"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";

const PrivateNotesView = () => {
  const notes = useChatStore((s) => s.notes);
  const activeNoteId = useChatStore((s) => s.activeNoteId);
  const setActiveNoteId = useChatStore((s) => s.setActiveNoteId);
  const createNote = useChatStore((s) => s.createNote);
  const updateNote = useChatStore((s) => s.updateNote);
  const deleteNote = useChatStore((s) => s.deleteNote);

  const activeNote = notes.find((note) => note.id === activeNoteId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadedNoteId = useRef<string | null>(null);

  useEffect(() => {
    if (!activeNoteId) {
      loadedNoteId.current = null;
      return;
    }
    if (!activeNote || loadedNoteId.current === activeNoteId) return;
    loadedNoteId.current = activeNoteId;
    setTitle(activeNote.title);
    setContent(activeNote.content);
  }, [activeNote, activeNoteId]);

  useEffect(() => {
    if (!activeNoteId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void updateNote(activeNoteId, { title, content });
    }, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, content, activeNoteId, updateNote]);

  const renderNotes = (drafts: boolean) =>
    notes
      .filter((note) => note.isDraft === drafts)
      .map((note) => (
        <button
          key={note.id}
          type="button"
          onClick={() => setActiveNoteId(note.id)}
          className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm ${
            note.id === activeNoteId
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {note.title || "Untitled"}
        </button>
      ));

  return (
    <div className="flex h-full w-full bg-[#0d1117]">
      <aside className="flex w-64 flex-col border-r border-white/5">
        <button
          type="button"
          onClick={() => void createNote("Untitled", "")}
          className="m-3 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/30"
        >
          + New Note
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="px-3 py-2 text-xs font-semibold text-white">Drafts</p>
          {renderNotes(true)}
          <p className="px-3 py-2 text-xs font-semibold text-white">Saved</p>
          {renderNotes(false)}
        </div>
      </aside>
      <section className="flex flex-1 flex-col p-4">
        <input
          aria-label="Note title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="bg-transparent text-white text-lg w-full outline-none"
          placeholder="Untitled"
          disabled={!activeNoteId}
        />
        <textarea
          aria-label="Note content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full h-full bg-transparent text-gray-300 resize-none outline-none mt-4"
          placeholder="Start typing your private note..."
          disabled={!activeNoteId}
        />
        {activeNoteId && (
          <button
            type="button"
            onClick={() => void deleteNote(activeNoteId)}
            className="self-end rounded-lg border border-white/10 px-3 py-2 text-xs text-red-400 hover:bg-white/5"
          >
            Delete note
          </button>
        )}
      </section>
    </div>
  );
};

export default PrivateNotesView;
