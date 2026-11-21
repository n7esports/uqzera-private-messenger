"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";

export default function PrivateNotesView() {
  const notes = useChatStore((s) => s.notes);
  const activeNoteId = useChatStore((s) => s.activeNoteId);
  const setActiveNoteId = useChatStore((s) => s.setActiveNoteId);
  const createNote = useChatStore((s) => s.createNote);
  const updateNote = useChatStore((s) => s.updateNote);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"drafts" | "saved">("drafts");
  const loadedKey = useRef<string | null>(null);

  const currentNote =
    notes.find((note) => note.id === activeNoteId && note.isDraft === (activeTab === "drafts")) ??
    notes.find((note) => note.isDraft === (activeTab === "drafts"));
  const currentNoteId = currentNote?.id;
  const key = currentNoteId ? `${activeTab}:${currentNoteId}` : activeTab;

  useEffect(() => {
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setTitle(currentNote?.title ?? "");
    setContent(currentNote?.content ?? "");
  }, [key, currentNote]);

  useEffect(() => {
    if (!currentNoteId) return;
    const timer = setTimeout(() => {
      void updateNote(currentNoteId, {
        title,
        content,
        isDraft: activeTab === "drafts",
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, currentNoteId, activeTab, updateNote]);

  const switchTab = (tab: "drafts" | "saved") => {
    const first = notes.find((note) => note.isDraft === (tab === "drafts"));
    if (first) setActiveNoteId(first.id);
    setActiveTab(tab);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-[#0d1117]"
    >
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#161b22]">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => switchTab("drafts")}
            className={`text-sm font-medium transition-colors ${activeTab === "drafts" ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Drafts
          </button>
          <button
            type="button"
            onClick={() => switchTab("saved")}
            className={`text-sm font-medium transition-colors ${activeTab === "saved" ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Saved
          </button>
        </div>
        <button
          type="button"
          onClick={() => void createNote("", "", activeTab === "drafts")}
          className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <input
          type="text"
          aria-label="Note title"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-2xl font-semibold text-white outline-none w-full placeholder:text-gray-600"
        />
        <textarea
          aria-label="Note content"
          placeholder="Start typing your private note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent text-gray-300 outline-none w-full resize-none placeholder:text-gray-600 leading-relaxed"
        />
      </div>
    </motion.div>
  );
}
