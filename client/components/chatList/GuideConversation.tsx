"use client";

import { guideIntro, guideOutro, guideSections } from "../../lib/guideContent";
import PrivacyBackdrop from "../shell/PrivacyBackdrop";


export default function GuideConversation({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <article className="flex h-full w-full flex-col bg-[#0d1117]">
      <header className="flex items-center gap-3 border-b border-white/5 px-6 py-4 bg-[#0d1117]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to chats"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <div>
          <h1 className="text-base font-semibold text-white">Guide</h1>
          <p className="text-xs text-gray-400">Pinned quick-start guide</p>
        </div>
      </header>
    <PrivacyBackdrop>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-6 bg-[#0d1117]">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-6 rounded-xl border border-white/10 bg-[#161b22] p-4 text-sm leading-6 text-gray-400">
            {guideIntro}
          </p>
          <div className="space-y-6">
            {guideSections.map((section) => (
              <section key={section.heading}>
                <h2 className="mt-8 mb-3 text-sm font-semibold text-white">
                  {section.heading}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {section.caption}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <article
                        key={item.title}
                        className="rounded-xl border border-white/10 p-4 bg-[#161b22] shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon
                            className="h-5 w-5 text-emerald-400"
                          />
                          <h3 className="text-sm font-medium text-white">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-gray-400">
                          {item.body}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-[#161b22] p-4">
            <h2 className="text-sm font-semibold text-white">
              {guideOutro.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-gray-400">
              {guideOutro.body}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm text-white font-medium transition-all"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("uqzera.guide.confirmed", "1");
              }
            }}
          >
            Read & confirm
          </button>
        </div>
      </div>
    </PrivacyBackdrop>
    </article>
  );
}