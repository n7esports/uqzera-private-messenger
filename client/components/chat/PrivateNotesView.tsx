"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import ContextMenu from "../ui/ContextMenu";

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

  const switchTab = (tab: "drafts" | "saved") => {
    const first = notes.find((note) => note.isDraft === (tab === "drafts"));
    if (first) setActiveNoteId(first.id);
    setActiveTab(tab);
  };

  const handleSave = () => {
    if (!currentNoteId) return;
    void updateNote(currentNoteId, { title, content, isDraft: false });
    setActiveNoteId(currentNoteId);
    setActiveTab("saved");
  };

  const handleExport = () => {
    const blob = new Blob([`${title || "Untitled"}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title || "untitled").replace(/[^a-z0-9_-]/gi, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewNote = () => void createNote("", "", activeTab === "drafts");

  return (
    <ContextMenu
      items={[
        { label: "Save note", onClick: handleSave },
        { label: "Export note", onClick: handleExport },
        { label: "New note", onClick: handleNewNote },
      ]}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full w-full bg-[#0d1117]"
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => switchTab("drafts")}
              className={`text-sm ${activeTab === "drafts" ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => switchTab("saved")}
              className={`text-sm ${activeTab === "saved" ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
            >
              Saved
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewNote}
              className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded"
            >
              + New Note
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="text-xs bg-white/10 text-white px-2 py-1 rounded"
            >
              Export
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs bg-emerald-500 text-black px-2 py-1 rounded font-bold"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <input
            type="text"
            aria-label="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="bg-transparent text-2xl font-semibold text-white outline-none w-full"
          />
          <textarea
            aria-label="Note content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="flex-1 bg-transparent text-gray-300 outline-none w-full resize-none overflow-y-auto custom-scrollbar"
          />
        </div>
      </motion.div>
    </ContextMenu>
  );
}
