"use client";

import { useMemo, useState } from "react";
import { useChatStore } from "../../store/useChatStore";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotesSidebar() {
  const notes = useChatStore((s) => s.notes);
  const activeNoteId = useChatStore((s) => s.activeNoteId);
  const setActiveNoteId = useChatStore((s) => s.setActiveNoteId);
  const setNotesTab = useChatStore((s) => s.setNotesTab);
  const createNote = useChatStore((s) => s.createNote);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes.filter(
      (note) =>
        !needle ||
        note.title.toLowerCase().includes(needle) ||
        note.content.toLowerCase().includes(needle),
    );
  }, [notes, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0F131C]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">Private Notes</h2>
        <button
          type="button"
          aria-label="Create new note"
          onClick={() => void createNote("", "", true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#10B981] transition hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="px-3 py-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
          className="w-full rounded-lg border border-white/[0.07] bg-[#121824] px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-[#10B981]/40"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-xs text-slate-500">No notes found</p>
        )}
        {visible.map((note) => (
          <button
            key={note.id}
            type="button"
            aria-pressed={note.id === activeNoteId}
            onClick={() => {
              setActiveNoteId(note.id);
              setNotesTab(note.isDraft ? "drafts" : "saved");
            }}
            className={`flex w-full flex-col gap-1 border-b border-l-2 border-white/[0.05] px-4 py-3 text-left transition ${
              note.id === activeNoteId
                ? "border-l-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                : "border-l-transparent text-slate-300 hover:bg-white/[0.03]"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{note.title || "Untitled"}</span>
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                {formatTime(note.updatedAt)}
              </span>
            </span>
            <span className="line-clamp-1 text-xs text-slate-500">
              {note.content || "Empty note"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
