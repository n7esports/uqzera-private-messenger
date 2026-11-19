"use client";

import { create } from "zustand";

interface SessionState {
  currentUserAlias: string;
  setCurrentUserAlias: (alias: string) => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  lastSeen: number;
  setLastSeen: (time: number) => void;
  
  // Dynamic session key material
  sessionEncryptionKey: Uint8Array | null;
  sessionSigningKey: Uint8Array | null;
  sessionEncryptionPubKey: Uint8Array | null;
  sessionSigningPubKey: Uint8Array | null;
  sessionId: string;
  sessionExpires: number;
  initializeSessionKeys: () => void;
  rotateSessionKeys: () => void;
}

function generateSecureKeys() {
  if (typeof window === "undefined" || !window.crypto) {
    const fallback = new TextEncoder().encode("uqzera-fallback-key-32bytes-length!!");
    return {
      enc: fallback,
      sig: fallback,
      encPub: fallback,
      sigPub: fallback,
    };
  }
  return {
    enc: window.crypto.getRandomValues(new Uint8Array(32)),
    sig: window.crypto.getRandomValues(new Uint8Array(64)),
    encPub: window.crypto.getRandomValues(new Uint8Array(32)),
    sigPub: window.crypto.getRandomValues(new Uint8Array(32)),
  };
}

export const useSessionStore = create<SessionState>((set) => {
  const initialKeys = generateSecureKeys();
  const sessionId = typeof window !== "undefined" && window.crypto ? 
    Array.from(window.crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('') : 
    "fallback-session";
    
  return {
    currentUserAlias: typeof window !== "undefined" ? localStorage.getItem("uqzera.onboarding.alias") || "User" : "User",
    setCurrentUserAlias: (alias) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("uqzera.onboarding.alias", alias);
      }
      set({ currentUserAlias: alias });
    },
    isOnline: true,
    setIsOnline: (status) => set({ isOnline: status }),
    lastSeen: Date.now(),
    setLastSeen: (time) => set({ lastSeen: time }),
    
    sessionEncryptionKey: initialKeys.enc,
    sessionSigningKey: initialKeys.sig,
    sessionEncryptionPubKey: initialKeys.encPub,
    sessionSigningPubKey: initialKeys.sigPub,
    sessionId,
    sessionExpires: Date.now() + 24 * 60 * 60 * 1000,
    
    initializeSessionKeys: () => {
      const keys = generateSecureKeys();
      set({
        sessionEncryptionKey: keys.enc,
        sessionSigningKey: keys.sig,
        sessionEncryptionPubKey: keys.encPub,
        sessionSigningPubKey: keys.sigPub,
        sessionExpires: Date.now() + 24 * 60 * 60 * 1000,
      });
    },
    
    rotateSessionKeys: () => {
      const keys = generateSecureKeys();
      set({
        sessionEncryptionKey: keys.enc,
        sessionSigningKey: keys.sig,
        sessionEncryptionPubKey: keys.encPub,
        sessionSigningPubKey: keys.sigPub,
        sessionExpires: Date.now() + 24 * 60 * 60 * 1000,
      });
    },
  };
});
