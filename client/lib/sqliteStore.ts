"use client";

// @ts-ignore
import initSqlJs from 'sql.js';

let db: any = null;
let dbLoadingPromise: Promise<void> | null = null;

export { db };

async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(passphrase);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as Uint8Array<ArrayBuffer>,
      iterations: 600000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptWithAES(key: CryptoKey, data: Uint8Array): Promise<{ iv: Uint8Array; salt: Uint8Array; ciphertext: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as Uint8Array<ArrayBuffer>,
      additionalData: salt as unknown as Uint8Array<ArrayBuffer>,
    },
    key,
    data as unknown as Uint8Array<ArrayBuffer>
  );

  return { iv, salt, ciphertext: new Uint8Array(encrypted) };
}

async function decryptWithAES(key: CryptoKey, iv: Uint8Array, salt: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as Uint8Array<ArrayBuffer>,
      additionalData: salt as unknown as Uint8Array<ArrayBuffer>,
    },
    key,
    ciphertext as unknown as Uint8Array<ArrayBuffer>
  );
  return new Uint8Array(decrypted);
}

export async function initSqliteStore(passphrase: string): Promise<void> {
  if (db) return;
  if (dbLoadingPromise) return dbLoadingPromise;

  dbLoadingPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
      
      const storedData = typeof localStorage !== 'undefined' ? localStorage.getItem('uqzera_sqlite_db_path') : null;

      if (storedData) {
        const buffer = Buffer.from(storedData, 'base64');
        const iv = new Uint8Array(buffer.slice(0, 12));
        const salt = new Uint8Array(buffer.slice(12, 28));
        const ciphertext = new Uint8Array(buffer.slice(28));

        const key = await deriveKeyFromPassphrase(passphrase, salt);
        const decrypted = await decryptWithAES(key, iv, salt, ciphertext);
        db = new SQL.Database(decrypted);
      } else {
        db = new SQL.Database();
        // Initial Schema
        db.run(`
          CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            recipient_pub_key TEXT,
            peer_signing_pub_key TEXT,
            alias TEXT,
            unread_count INTEGER,
            updated_at INTEGER,
            kind TEXT,
            pinned INTEGER,
            favorite INTEGER,
            muted_until INTEGER,
            muted_forever INTEGER,
            disappearing_ms INTEGER,
            theme TEXT,
            list_id TEXT,
            blocked INTEGER
          );
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_id TEXT,
            sender_pub_key TEXT,
            content TEXT,
            type TEXT,
            status TEXT,
            timestamp INTEGER,
            outgoing INTEGER,
            attachment TEXT,
            ephemeral_timer INTEGER,
            read_at INTEGER
          );
          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            remote_pub_key TEXT,
            send_chain_key TEXT,
            receive_chain_key TEXT,
            send_counter INTEGER,
            receive_counter INTEGER
          );
          CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            data TEXT
          );
        `);
        await persistToStorage(passphrase);
      }
    } catch (e) {
      dbLoadingPromise = null;
      throw e;
    }
  })();

  return dbLoadingPromise;
}

async function persistToStorage(passphrase: string) {
  if (!db) return;
  const binaryDb = db.export();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const { iv, ciphertext } = await encryptWithAES(key, binaryDb);
  
  const finalBuffer = Buffer.concat([
    new Uint8Array(iv),
    new Uint8Array(salt),
    new Uint8Array(ciphertext)
  ]);
  localStorage.setItem('uqzera_sqlite_db_path', finalBuffer.toString('base64'));
}

export interface StoredChat {
  id: string;
  recipientPubKey: string;
  peerSigningPubKey?: string;
  alias: string;
  unreadCount: number;
  updatedAt: number;
  kind: 'direct' | 'system' | 'notes';
  pinned: boolean;
  favorite?: boolean;
  mutedUntil?: number;
  mutedForever?: boolean;
  disappearingMs?: number;
  theme?: string;
  listId?: string;
  blocked?: boolean;
}

export interface StoredMessage {
  id: string;
  chatId: string;
  senderPubKey: string;
  content: string;
  type: string;
  status: 'queued' | 'relayAccepted' | 'sent' | 'delivered' | 'read';
  timestamp: number;
  outgoing: boolean;
  attachment?: any;
  ephemeralTimer?: number;
  readAt?: number;
}

export async function saveChat(chat: StoredChat): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  db.run(
    `INSERT OR REPLACE INTO chats (id, recipient_pub_key, peer_signing_pub_key, alias, unread_count, updated_at, kind, pinned, favorite, muted_until, muted_forever, disappearing_ms, theme, list_id, blocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chat.id,
      chat.recipientPubKey,
      chat.peerSigningPubKey,
      chat.alias,
      chat.unreadCount,
      chat.updatedAt,
      chat.kind,
      chat.pinned ? 1 : 0,
      chat.favorite ? 1 : 0,
      chat.mutedUntil ?? 0,
      chat.mutedForever ? 1 : 0,
      chat.disappearingMs ?? 0,
      chat.theme ?? '',
      chat.listId ?? '',
      chat.blocked ? 1 : 0,
    ]
  );
}

export async function getChats(): Promise<StoredChat[]> {
  if (!db) throw new Error("Database not initialized");
  const result = db.exec(`SELECT * FROM chats ORDER BY updated_at DESC`);
  if (!result || result.length === 0) return [];
  
  return result[0].values.map((row: any[]) => ({
    id: row[0],
    recipientPubKey: row[1],
    peerSigningPubKey: row[2],
    alias: row[3],
    unreadCount: row[4],
    updatedAt: row[5],
    kind: row[6],
    pinned: !!row[7],
    favorite: !!row[8],
    mutedUntil: row[9],
    mutedForever: !!row[10],
    disappearingMs: row[11],
    theme: row[12],
    listId: row[13],
    blocked: !!row[14],
  }));
}

export async function saveMessage(message: StoredMessage): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  db.run(
    `INSERT OR REPLACE INTO messages (id, chat_id, sender_pub_key, content, type, status, timestamp, outgoing, attachment, ephemeral_timer, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.chatId,
      message.senderPubKey,
      message.content,
      message.type,
      message.status,
      message.timestamp,
      message.outgoing ? 1 : 0,
      message.attachment ? JSON.stringify(message.attachment) : null,
      message.ephemeralTimer ?? 0,
      message.readAt ?? 0,
    ]
  );
}

export async function getMessagesForChat(chatId: string): Promise<StoredMessage[]> {
  if (!db) throw new Error("Database not initialized");
  const result = db.exec(`SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC`, [chatId]);
  if (!result || result.length === 0) return [];

  return result[0].values.map((row: any[]) => ({
    id: row[0],
    chatId: row[1],
    senderPubKey: row[2],
    content: row[3],
    type: row[4],
    status: row[5],
    timestamp: row[6],
    outgoing: !!row[7],
    attachment: row[8] ? JSON.parse(row[8]) : null,
    ephemeralTimer: row[9],
    readAt: row[10],
  }));
}

export async function clearStore(): Promise<void> {
  if (!db) return;
  db.run("DELETE FROM chats; DELETE FROM messages; DELETE FROM sessions; DELETE FROM contacts;");
  localStorage.removeItem('uqzera_sqlite_db_path');
}
