"use client";

import { useEffect, useState } from "react";

type Category = "essential" | "analytics" | "marketing";
type Preferences = Record<Category, boolean>;

const STORAGE_KEY = "anon_consent";
const CATEGORIES: { id: Category; label: string; disabled: boolean }[] = [
  { id: "essential", label: "Essential", disabled: true },
  { id: "analytics", label: "Analytics", disabled: false },
  { id: "marketing", label: "Marketing", disabled: false },
];
const ESSENTIAL_ONLY: Preferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [toggles, setToggles] = useState<Preferences>(ESSENTIAL_ONLY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowBanner(localStorage.getItem(STORAGE_KEY) === null);
  }, []);

  const save = (preferences: Preferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setShowBanner(false);
      setOpen(false);
      setError(null);
    } catch {
      setError("Could not save your cookie preferences in this browser.");
    }
  };

  const toggle = (id: Category) => {
    setToggles((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  if (!showBanner && !open) return null;

  return (
    <>
      {showBanner && (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
          <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-container p-3 shadow-panel">
            <p className="text-sm text-on-surface">
              This site uses cookies. Essential cookies are always enabled.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => save({ essential: true, analytics: true, marketing: true })}
                className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
              >
                Accept all
              </button>
              <button
                onClick={() => save(ESSENTIAL_ONLY)}
                className="rounded border border-hairline px-3 py-1.5 text-sm font-medium text-on-surface"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => setOpen(true)}
                className="rounded border border-hairline px-3 py-1.5 text-sm font-medium text-on-surface"
              >
                Preferences
              </button>
              <button
                aria-label="Dismiss cookie notice"
                onClick={() => save(ESSENTIAL_ONLY)}
                className="rounded border border-hairline px-3 py-1.5 text-sm font-medium text-on-surface"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded border border-hairline bg-surface-container p-6 shadow-panel">
            <h2 className="mb-4 text-base font-medium text-on-surface">
              Cookie Preferences
            </h2>
            <ul className="space-y-3">
              {CATEGORIES.map(({ id, label, disabled }) => (
                <li
                  key={id}
                  className="flex items-center justify-between text-sm text-on-surface"
                >
                  <span>{label}</span>
                  <button
                    role="switch"
                    aria-checked={toggles[id]}
                    disabled={disabled}
                    onClick={() => toggle(id)}
                    className={`h-6 w-10 rounded-full border border-hairline transition-colors ${
                      toggles[id]
                        ? "bg-primary text-on-primary"
                        : "bg-surface-low"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-current transition-transform ${
                        toggles[id] ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
            {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded border border-hairline px-3 py-1.5 text-sm font-medium text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => save(toggles)}
                className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
