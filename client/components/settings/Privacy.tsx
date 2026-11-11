"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { ShowGuideAgainIcon } from "../icons/outline/ShowGuideAgainIcon";

const READ_RECEIPTS_KEY = "cloak.settings.privacy.readReceipts";
const LAST_SEEN_KEY = "cloak.settings.privacy.lastSeen";

export default function PrivacySettings() {
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const setGuideVisible = useChatStore((state) => state.setGuideVisible);
  const showToast = useChatStore((state) => state.showToast);

  useEffect(() => {
    const r = localStorage.getItem(READ_RECEIPTS_KEY);
    if (r !== null) setReadReceipts(r === "true");
    const l = localStorage.getItem(LAST_SEEN_KEY);
    if (l !== null) setLastSeen(l === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(READ_RECEIPTS_KEY, String(readReceipts));
  }, [readReceipts]);

  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, String(lastSeen));
  }, [lastSeen]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-container/60 p-4">
        <h2 className="text-sm font-semibold text-on-surface">Read Receipts</h2>
        <p className="mt-1 text-xs text-outline">Let others know when you read their messages.</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{readReceipts ? "On" : "Off"}</span>
          <Toggle checked={readReceipts} onChange={setReadReceipts} />
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/50 bg-surface-container/60 p-4">
        <h2 className="text-sm font-semibold text-on-surface">Last Seen</h2>
        <p className="mt-1 text-xs text-outline">Show when you were last active.</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">{lastSeen ? "On" : "Off"}</span>
          <Toggle checked={lastSeen} onChange={setLastSeen} />
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/50 bg-surface-container/60 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent-emerald">
            <ShowGuideAgainIcon size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-on-surface">Guide</h2>
            <p className="mt-1 text-xs text-outline">
              Bring the pinned quick-start guide back to your chat list.
            </p>
            <button
              type="button"
              onClick={() => {
                setGuideVisible(true);
                showToast({
                  id: crypto.randomUUID(),
                  message: "Guide restored to your chat list.",
                  type: "success",
                });
              }}
              className="mt-3 rounded-xl border border-outline-variant bg-surface-container/60 px-3 py-1.5 text-xs font-medium text-on-surface transition hover:border-accent/40 hover:text-accent-emerald"
            >
              Show guide again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (_v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`h-6 w-10 rounded-full border border-hairline transition-colors ${
        checked ? "bg-primary" : "bg-surface-low"
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-current transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
