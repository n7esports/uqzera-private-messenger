"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "../store/useVaultStore";

export default function RootPage() {
  const router = useRouter();
  const sessionRestored = useVaultStore((state) => state.sessionRestored);
  const sessionRestoreError = useVaultStore((state) => state.sessionRestoreError);
  const vaultExists = useVaultStore((state) => state.vaultExists);
  const isUnlocked = useVaultStore((state) => state.isUnlocked);

  useEffect(() => {
    if (!sessionRestored || sessionRestoreError) return;
    router.replace(!vaultExists ? "/onboarding" : isUnlocked ? "/chats" : "/lock");
  }, [isUnlocked, router, sessionRestored, sessionRestoreError, vaultExists]);

  if (sessionRestoreError) {
    return <p role="alert" className="p-8 text-center text-sm text-error">{sessionRestoreError}</p>;
  }
  return <p className="p-8 text-center text-sm text-secondary">Opening vault…</p>;
}
