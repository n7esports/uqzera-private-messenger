"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useChatStore, type ChatState } from "../../store/useChatStore";
import { useSessionStore } from "../../store/useSessionStore";

const ALIAS_STORAGE_KEY = "uqzera.onboarding.alias";

export default function OnboardingPage() {
  const router = useRouter();
  const mountRef = useRef(false);
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const updateChat = useChatStore((s: ChatState) => s.updateChat);
  const chats = useChatStore((s: ChatState) => s.chats);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Check if alias already exists
    const savedAlias = localStorage.getItem(ALIAS_STORAGE_KEY);
    if (savedAlias) {
      setAlias(savedAlias);
    }
  }, []);

  const handleContinue = async () => {
    if (!alias.trim()) {
      setError("Please enter your name.");
      return;
    }

    const trimmedAlias = alias.trim();
    if (trimmedAlias.length < 1 || trimmedAlias.length > 40) {
      setError("Name must be 1-40 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update profile in "Private Notes" chat
      const notesChat = chats.find((c) => c.alias === "Private Notes");
      if (notesChat) {
        await updateChat(notesChat.id, { alias: trimmedAlias });
      }

      if (!mountRef.current) return;

      localStorage.setItem(ALIAS_STORAGE_KEY, trimmedAlias);
      useSessionStore.getState().setCurrentUserAlias(trimmedAlias);
      router.replace("/chats");
    } catch (saveError) {
      if (!mountRef.current) return;

      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-app">
      <div className="mx-4 w-full max-w-lg">
        <div className="mb-8 text-center">
          <Image src="/keyhole-256.png" alt="UQZERA" className="h-16 w-auto mx-auto mb-4 text-[#34D399]" />
          <h1 className="font-sans text-2xl font-semibold text-text-primary">
            Welcome to UQZERA
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your alias to get started
          </p>
        </div>

        <div className="rounded-2xl border border-border bg bg-panel p-6">
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Alias
          </label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-border bg-bg-panel px-4 py-3 text-base text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            maxLength={40}
          />
          {error && (
            <p className="mt-2 text-xs text-error">{error}</p>
          )}
          <p className="mt-3 text-xs text-text-secondary">
            Your alias is how others will see you. It's always private.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}