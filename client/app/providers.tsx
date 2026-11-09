"use client";

import { useCallback, useEffect, useState } from "react";
import { useVaultStore } from "../store/useVaultStore";
import { startAutoLockTimer } from "../lib/lockSettings";

export function Providers({ children }: { children: React.ReactNode }) {
 const [isReady, setIsReady] = useState(false);
 const markReady = useCallback(() => setIsReady(true), []);

 return (
 <VaultInitializer onReady={markReady}>
 {isReady ? children : <LoadingShell />}
 </VaultInitializer>
 );
}

function VaultInitializer({
 onReady,
 children,
}: {
 onReady: () => void;
 children: React.ReactNode;
}) {
 const initializeVault = useVaultStore((s) => s.initializeVault);

 useEffect(() => {
   initializeVault().then(onReady).catch((error: unknown) => {
     useVaultStore.setState({
       sessionRestored: true,
       sessionRestoreError: error instanceof Error ? error.message : "Could not open the vault.",
     });
     onReady();
   });
 }, [initializeVault, onReady]);

 return (
   <>
     <VaultAutoLock />
     {children}
   </>
 );
}

function VaultAutoLock() {
 const isUnlocked = useVaultStore((s) => s.isUnlocked);
 const autoLockMinutes = useVaultStore((s) => s.autoLockMinutes);
 const lockOnBackground = useVaultStore((s) => s.lockOnBackground);
 const lockVault = useVaultStore((s) => s.lockVault);

 useEffect(() => {
   if (!isUnlocked) return;
   let cancelTimer = () => {};
   const scheduleLock = () => {
     cancelTimer();
     cancelTimer = startAutoLockTimer(lockVault, autoLockMinutes);
   };
   const onActivity = () => scheduleLock();
   const onBackground = () => {
     if (lockOnBackground && document.visibilityState === "hidden") lockVault();
   };
   const onPageHide = () => {
     if (lockOnBackground) lockVault();
   };
   scheduleLock();
   window.addEventListener("pointerdown", onActivity);
   window.addEventListener("keydown", onActivity);
   window.addEventListener("touchstart", onActivity);
   document.addEventListener("visibilitychange", onBackground);
   window.addEventListener("pagehide", onPageHide);
   return () => {
     cancelTimer();
     window.removeEventListener("pointerdown", onActivity);
     window.removeEventListener("keydown", onActivity);
     window.removeEventListener("touchstart", onActivity);
     document.removeEventListener("visibilitychange", onBackground);
     window.removeEventListener("pagehide", onPageHide);
   };
 }, [autoLockMinutes, isUnlocked, lockOnBackground, lockVault]);

 return null;
}

function LoadingShell() {
 return (
 <div className="flex h-screen w-full items-center justify-center bg-transparent">
 <div className="bg-surface-container border border-hairline flex flex-col items-center gap-3 px-8 py-6">
 <div className="h-2 w-2 rounded-full bg-primary " />
 <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
 Initializing vault
 </p>
 </div>
 </div>
 );
}
