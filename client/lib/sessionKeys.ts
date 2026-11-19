"use client";

import { create } from "zustand";

interface SessionKeyState {
  // Dynamic in-memory session keys (32 bytes each for encryption/signing)
  sessionEncryptionKey: Uint8Array | null;
  sessionSigningKey: Uint8Array | null;
  sessionEncryptionPubKey: Uint8Array | null;
  sessionSigningPubKey: Uint8Array | null;
  
  // Session rotation state
  sessionId: string;
  sessionCreated: number;
  sessionExpires: number;
  sessionRotationCount: number;
  
  // Identity state
  currentUserAlias: string;
  
  // Actions
  initializeSession: () => Promise<void>;
  rotateSession: () => Promise<void>;
  getSessionEncryptionKey: () => Uint8Array | null;
  getSessionSigningKey: () => Uint8Array | null;
  getSessionEncryptionPubKey: () => Uint8Array | null;
  getSessionSigningPubKey: () => Uint8Array | null;
  isSessionValid: () => boolean;
  cleanupSession: () => void;
}

function generateSecureKeyPair(): {
  encryption: Uint8Array;
  signing: Uint8Array;
  encryptionPub: Uint8Array;
  signingPub: Uint8Array;
} {
  const crypto = window.crypto;
  const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
  const signingKey = crypto.getRandomValues(new Uint8Array(64));
  const encryptionPub = crypto.getRandomValues(new Uint8Array(32));
  const signingPub = crypto.getRandomValues(new Uint8Array(32));
  
  return {
    encryption: encryptionKey,
    signing: signingKey,
    encryptionPub: encryptionPub,
    signingPub: signingPub,
  };
}

function generateSessionId(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const useSessionKeyStore = create<SessionKeyState>((set, get) => ({
  sessionEncryptionKey: null,
  sessionSigningKey: null,
  sessionEncryptionPubKey: null,
  sessionSigningPubKey: null,
  sessionId: '',
  sessionCreated: 0,
  sessionExpires: 0,
  sessionRotationCount: 0,
  currentUserAlias: '',
  
  initializeSession: async () => {
    try {
      // Load or create user alias
      const alias = typeof window !== 'undefined' ? 
        localStorage.getItem("uqzera.onboarding.alias") || "User" : "User";
      
      set({ currentUserAlias: alias });
      
      // Generate initial key pair
      const keys = generateSecureKeyPair();
      const now = Date.now();
      const sessionId = generateSessionId();
      const expires = now + (24 * 60 * 60 * 1000); // 24 hours
      
      set({
        sessionEncryptionKey: keys.encryption,
        sessionSigningKey: keys.signing,
        sessionEncryptionPubKey: keys.encryptionPub,
        sessionSigningPubKey: keys.signingPub,
        sessionId,
        sessionCreated: now,
        sessionExpires: expires,
        sessionRotationCount: 0,
      });
      
      // Store initial public keys for app-wide access
      if (typeof window !== 'undefined') {
        localStorage.setItem("uqzera.session.encryptionPubKey", arrayBufferToBase64(keys.encryptionPub.buffer));
        localStorage.setItem("uqzera.session.signingPubKey", arrayBufferToBase64(keys.signingPub.buffer));
        localStorage.setItem("uqzera.session.userAlias", alias);
      }
      
    } catch (error) {
      console.error("Failed to initialize session:", error);
      // Fallback to deterministic keys based on user alias
      const alias = get().currentUserAlias || "User";
      const aliasBytes = new TextEncoder().encode(alias);
      const hashBuffer = await crypto.subtle.digest('SHA-256', aliasBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      
      const keys = {
        encryption: new Uint8Array(hashArray.slice(0, 32)),
        signing: new Uint8Array(hashArray.slice(32, 64)),
        encryptionPub: new Uint8Array(hashArray.slice(64, 96)),
        signingPub: new Uint8Array(hashArray.slice(96, 128)),
      };
      
      const now = Date.now();
      const sessionId = generateSessionId();
      
      set({
        sessionEncryptionKey: keys.encryption,
        sessionSigningKey: keys.signing,
        sessionEncryptionPubKey: keys.encryptionPub,
        sessionSigningPubKey: keys.signingPub,
        sessionId,
        sessionCreated: now,
        sessionExpires: now + (24 * 60 * 60 * 1000),
        sessionRotationCount: 0,
      });
    }
  },
  
  rotateSession: async () => {
    const state = get();
    
    if (!state.sessionEncryptionKey || !state.sessionSigningKey) {
      await get().initializeSession();
      return;
    }
    
    // Zero out old keys for security
    state.sessionEncryptionKey.fill(0);
    state.sessionSigningKey.fill(0);
    
    const keys = generateSecureKeyPair();
    const now = Date.now();
    const sessionId = generateSessionId();
    const expires = now + (24 * 60 * 60 * 1000);
    
    set({
      sessionEncryptionKey: keys.encryption,
      sessionSigningKey: keys.signing,
      sessionEncryptionPubKey: keys.encryptionPub,
      sessionSigningPubKey: keys.signingPub,
      sessionId,
      sessionCreated: now,
      sessionExpires: expires,
      sessionRotationCount: state.sessionRotationCount + 1,
    });
    
    // Update stored public keys
    if (typeof window !== 'undefined') {
      localStorage.setItem("uqzera.session.encryptionPubKey", arrayBufferToBase64(keys.encryptionPub.buffer));
      localStorage.setItem("uqzera.session.signingPubKey", arrayBufferToBase64(keys.signingPub.buffer));
    }
  },
  
  getSessionEncryptionKey: () => get().sessionEncryptionKey,
  getSessionSigningKey: () => get().sessionSigningKey,
  getSessionEncryptionPubKey: () => get().sessionEncryptionPubKey,
  getSessionSigningPubKey: () => get().sessionSigningPubKey,
  
  isSessionValid: () => {
    const state = get();
    if (!state.sessionEncryptionKey || !state.sessionSigningKey) return false;
    return state.sessionExpires > Date.now();
  },
  
  cleanupSession: () => {
    const state = get();
    if (state.sessionEncryptionKey) state.sessionEncryptionKey.fill(0);
    if (state.sessionSigningKey) state.sessionSigningKey.fill(0);
    set({
      sessionEncryptionKey: null,
      sessionSigningKey: null,
      sessionEncryptionPubKey: null,
      sessionSigningPubKey: null,
    });
  },
}));