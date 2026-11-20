"use client";

// @ts-ignore
import initSqlJs from 'sql.js';

let SqlJsStatic: any = null;

async function ensureSqlJsLoaded(): Promise<any> {
  if (SqlJsStatic) return SqlJsStatic;

  try {
    SqlJsStatic = await initSqlJs();
    return SqlJsStatic;
  } catch (error) {
    throw new Error(`Failed to load sql.js: ${error}`);
  }
}

interface DbInitOptions {
  localtime?: boolean;
  cacheSize?: number;
  locations?: boolean;
}

// Default options for database initialization
const defaultOptions: DbInitOptions = {
  localtime: true,
  cacheSize: -10000, // 10MB cache
};

// Cache the database instance per session
let db: any = null;
let dbLoading: Promise<void> | null = null;

// Export the db instance for use by other modules
export { db };

export async function initSqliteStore(): Promise<void> {
  if (db) return; // already initialized
  if (dbLoading) return dbLoading; // avoid duplicate init

  dbLoading = (async () => {
    const SqlJs = await ensureSqlJsLoaded();
    db = new SqlJs.Database(defaultOptions);

    // Create tables
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
      )
    `);
    db.run(`
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
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        remote_pub_key TEXT,
        send_chain_key TEXT,
        receive_chain_key TEXT,
        send_counter INTEGER,
        receive_counter INTEGER
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        data TEXT
      )
    `);

    // Store the database path in localStorage for persistence across sessions
    if (typeof localStorage !== 'undefined') {
      const buffer = Buffer.from(db.export());
      localStorage.setItem('uqzera_sqlite_db_path', buffer.toString('base64'));
    }
  })();

  await dbLoading;
  dbLoading = null;
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

export interface StoredSession {
  id: string;
  remotePubKey: string;
  sendChainKey: string;
  receiveChainKey: string;
  sendCounter: number;
  receiveCounter: number;
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
      chat.favorite ?? 0,
      chat.mutedUntil ?? 0,
      chat.mutedForever ?? 0,
      chat.disappearingMs ?? 0,
      chat.theme ?? '',
      chat.listId ?? '',
      chat.blocked ? 1 : 0,
    ]
  );
}

export async function getChats(): Promise<StoredChat[]> {
  if (!db) throw new Error("Database not initialized");
  const result = db.exec(
    `SELECT * FROM chats ORDER BY updated_at DESC`
  );
  const rows = result[0].values;
  return rows.map((row: any[]) => ({
    id: row[0],
    recipientPubKey: row[1],
    peerSigningPubKey: row[2] || undefined,
    alias: row[3],
    unreadCount: row[4],
    updatedAt: row[5],
    kind: row[6] as 'direct' | 'system' | 'notes',
    pinned: row[7] === 1,
    favorite: row[8] === 1,
    mutedUntil: row[9] || undefined,
    mutedForever: row[10] || undefined,
    disappearingMs: row[11] || undefined,
    theme: row[12] || undefined,
    listId: row[13] || undefined,
    blocked: row[14] === 1,
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
      message.attachment ? JSON.stringify(message.attachment) : undefined,
      message.ephemeralTimer ?? 0,
      message.readAt ?? 0,
    ]
  );
}

export async function getMessagesForChat(chatId: string): Promise<StoredMessage[]> {
  if (!db) throw new Error("Database not initialized");
  const result = db.exec(
    `SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC`,
    [chatId]
  );
  const rows = result[0].values;
  return rows.map((row: any[]) => ({
    id: row[0],
    chatId: row[1],
    senderPubKey: row[2],
    content: row[3],
    type: row[4],
    status: row[5] as 'queued' | 'relayAccepted' | 'sent' | 'delivered' | 'read',
    timestamp: row[6],
    outgoing: row[7] === 1,
    attachment: row[8] ? JSON.parse(row[8]) : undefined,
    ephemeralTimer: row[9] || 0,
    readAt: row[10] || 0,
  }));
}

export async function updateMessage(id: string, patch: Partial<StoredMessage>): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [id];

  if (patch.content !== undefined) {
    updates.push(`content = ?`);
    values.push(patch.content);
  }
  if (patch.status !== undefined) {
    updates.push(`status = ?`);
    values.push(patch.status);
  }
  if (patch.readAt !== undefined) {
    updates.push(`read_at = ?`);
    values.push(patch.readAt);
  }
  if (patch.ephemeralTimer !== undefined) {
    updates.push(`ephemeral_timer = ?`);
    values.push(patch.ephemeralTimer);
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(`updated_at`);
    const query = `UPDATE messages SET ${updates.join(', ')} WHERE id = ?`;
    db.run(query, values);
  }
}

export async function deleteMessages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  for (const id of ids) {
    db.run(`DELETE FROM messages WHERE id = ?`, [id]);
  }
}

export async function saveSession(db: any, session: StoredSession): Promise<void> {
  db.run(
    `INSERT OR REPLACE INTO sessions (id, remote_pub_key, send_chain_key, receive_chain_key, send_counter, receive_counter) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.remotePubKey,
      session.sendChainKey,
      session.receiveChainKey,
      session.sendCounter,
      session.receiveCounter,
    ]
  );
}

export async function getSession(id: string): Promise<StoredSession | undefined> {
  const result = db.exec(
    `SELECT * FROM sessions WHERE id = ?`,
    [id]
  );
  const rows = result[0].values;
  if (rows.length === 0) return undefined;
  const row = rows[0];
  return {
    id: row[0],
    remotePubKey: row[1],
    sendChainKey: row[2],
    receiveChainKey: row[3],
    sendCounter: row[4],
    receiveCounter: row[5],
  };
}

export async function saveContact(db: any, contact: any): Promise<void> {
  const data = JSON.stringify(contact);
  db.run(
    `INSERT OR REPLACE INTO contacts (id, data) VALUES (?, ?)`,
    [contact.id || Date.now().toString(), data]
  );
}

export async function getContact(db: any, id: string): Promise<any> {
  const result = db.exec(
    `SELECT * FROM contacts WHERE id = ?`,
    [id]
  );
  const rows = result[0].values;
  if (rows.length === 0) return undefined;
  return JSON.parse(rows[0][1]);
}

export async function clearStore(db: any): Promise<void> {
  db.run(`DELETE FROM chats`);
  db.run(`DELETE FROM messages`);
  db.run(`DELETE FROM sessions`);
  db.run(`DELETE FROM contacts`);
}