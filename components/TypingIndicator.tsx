'use client';

/**
 * TypingIndicator
 * Three bouncing dots with staggered animation-delay,
 * matching the AI "Concierge" thinking state (FR-A4).
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-[var(--bg-input)] dark:bg-slate-700/50 rounded-[1.25rem] rounded-tl-sm w-fit shadow-sm">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
