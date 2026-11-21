"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContextMenu({ items, children }: { items: { label: string; onClick: () => void }[], children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  useEffect(() => {
    const close = () => setVisible(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: pos.y, left: pos.x }}
            className="fixed z-[9999] bg-[#161b22] border border-white/10 rounded-lg shadow-xl py-1 w-48"
          >
            {items.map((item, i) => (
              <button key={i} onClick={() => { item.onClick(); setVisible(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
