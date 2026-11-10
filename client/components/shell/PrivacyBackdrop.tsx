import type { ReactNode } from "react";

export default function PrivacyBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden h-full w-full">
      <div
        aria-hidden="true"
        className="absolute inset-0 backdrop-blur-[60px] bg-[#0B0F16]/40 pointer-events-none"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}