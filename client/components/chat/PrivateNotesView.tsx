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
  const activeTab = useChatStore((s) => s.notesTab);
  const setActiveTab = useChatStore((s) => s.setNotesTab);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const loadedKey = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDraftTab = activeTab === "drafts";
  const currentNote =
    notes.find((note) => note.id === activeNoteId && note.isDraft === isDraftTab) ??
    notes.find((note) => note.isDraft === isDraftTab);
  const currentNoteId = currentNote?.id;
  const key = currentNoteId ? `${activeTab}:${currentNoteId}` : activeTab;

  useEffect(() => {
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setTitle(currentNote?.title ?? "");
    setContent(currentNote?.content ?? "");
  }, [key, currentNote, setTitle, setContent]);

  useEffect(() => {
    if (!currentNoteId) return;
    const timer = setTimeout(() => {
      void updateNote(currentNoteId, { title, content, isDraft: isDraftTab });
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, currentNoteId, isDraftTab, updateNote]);

  const ensureNote = () => {
    if (!currentNoteId) void createNote(title, content, isDraftTab);
  };

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

  const wrapSelection = (prefix: string, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    setContent(content.slice(0, start) + prefix + selected + suffix + content.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  };

  const applyChecklist = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const nextBreak = content.indexOf("\n", el.selectionEnd);
    const lineEnd = nextBreak === -1 ? content.length : nextBreak;
    const block = content.slice(lineStart, lineEnd);
    setContent(
      content.slice(0, lineStart) +
        block.split("\n").map((line) => `- [ ] ${line}`).join("\n") +
        content.slice(lineEnd),
    );
  };

  const clearContent = () => {
    if (content && !window.confirm("Clear this note's content?")) return;
    setContent("");
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 min-w-0 w-full">
    <ContextMenu
      items={[
        { label: "Save note", onClick: handleSave },
        { label: "Export note", onClick: handleExport },
        { label: "New note", onClick: () => void createNote("", "", isDraftTab) },
      ]}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 flex flex-col h-full bg-[#0A0D14]"
      >
        <div className="flex w-full items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0F131C] px-6 py-3">
          <div className="flex items-center gap-5">
            {(["drafts", "saved"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchTab(tab)}
                className={`relative pb-1 text-sm capitalize transition-colors ${
                  activeTab === tab ? "font-medium text-[#10B981]" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#10B981]" />}
              </button>
            ))}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <span className="mr-2 hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Encrypted Locally
            </span>
            <button
              type="button"
              onClick={() => void createNote("", "", isDraftTab)}
              className="rounded-lg border border-[#10B981]/30 px-2.5 py-1.5 text-xs text-[#10B981] transition hover:bg-[#10B981]/10"
            >
              + New Note
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/15"
            >
              Export
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-medium text-black transition hover:brightness-110"
            >
              Save
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-4xl w-full flex-1 flex-col px-8 py-6">
          <input
            type="text"
            aria-label="Note title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onFocus={ensureNote}
            placeholder="Untitled"
            className="w-full bg-transparent text-2xl font-semibold text-slate-100 focus:outline-none placeholder:text-slate-500"
          />
          <div className="my-4 border-b border-white/[0.07]" />
          <div className="flex flex-wrap items-center gap-1 pb-4">
            {[
              { label: "Bold", action: () => wrapSelection("**") },
              { label: "Italic", action: () => wrapSelection("*") },
              { label: "Code", action: () => wrapSelection("`") },
              { label: "Checklist", action: applyChecklist },
              { label: "Copy", action: () => void navigator.clipboard.writeText(content) },
              { label: "Clear", action: clearContent },
            ].map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={tool.action}
                className="rounded-md px-2.5 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                {tool.label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            aria-label="Note content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onFocus={ensureNote}
            placeholder="Start typing... Notes are encrypted locally on this device and never sent to any server."
            className="flex-1 w-full resize-none bg-transparent leading-relaxed text-slate-200 focus:outline-none placeholder:text-slate-600"
          />
          <div className="flex items-center justify-between border-t border-white/[0.07] pt-3 text-[11px] text-slate-500">
            <span>{currentNote?.isDraft === false ? "Saved" : "Draft"}</span>
            <span>AES-256-GCM Local Storage</span>
            <span>{words} words · {content.length} characters</span>
          </div>
        </div>
      </motion.div>
    </ContextMenu>
    </div>
  );
}
