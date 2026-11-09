"use client";

import { guideIntro, guideOutro, guideSections } from "../../lib/guideContent";

export default function GuideConversation({
  onBack,
}: {
  onBack?: () => void;
}) {
  return (
    <article className="flex h-full w-full flex-col bg-surface">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to chats"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface hover:bg-surface-high"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <div>
          <h1 className="text-base font-semibold text-on-surface">Guide</h1>
          <p className="text-xs text-on-surface-variant">Pinned quick-start guide</p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-6 rounded-xl border border-border bg-bg-panel p-4 text-sm leading-6 text-text-primary">
            {guideIntro}
          </p>
          <div className="space-y-6">
            {guideSections.map((section) => (
              <section key={section.heading}>
                <h2 className="mt-8 mb-3 text-sm font-semibold text-on-surface">
                  {section.heading}
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {section.caption}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <article
                        key={item.title}
                        className="rounded-xl border border-border p-4 glass"
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon
                            className="h-5 w-5 text-primary"
                          />
                          <h3 className="text-sm font-medium text-on-surface">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                          {item.body}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-bg-panel p-4">
            <h2 className="text-sm font-semibold text-on-surface">
              {guideOutro.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">
              {guideOutro.body}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
