"use client";

import { create } from "zustand";

interface SessionState {
  currentUserAlias: string;
  setCurrentUserAlias: (alias: string) => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  lastSeen: number;
  setLastSeen: (time: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
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
}));
