'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useDailyBriefing } from '@/lib/hooks/useDailyBriefing';
import { useRouter } from 'next/navigation';

const STORY_DURATION = 9000;

export default function DailyBriefingModal() {
  const { briefing, shouldShow, isLoading, dismiss } = useDailyBriefing();
  const [visible, setVisible] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // Listen for manual re-open from Sidebar "Today's Briefing" button
  useEffect(() => {
    const handler = () => {
      setForceOpen(true);
      setProgress(0);
      setTimeout(() => setTextVisible(true), 400);
    };
    window.addEventListener('open-briefing', handler);
    return () => window.removeEventListener('open-briefing', handler);
  }, []);

  // Auto-show on first visit of the day (from useDailyBriefing hook)
  useEffect(() => {
    if (shouldShow && briefing) {
      const t = setTimeout(() => {
        setVisible(true);
        setTimeout(() => setTextVisible(true), 400);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [shouldShow, briefing]);

  const isOpen = visible || forceOpen;

  // Story progress bar — restarts whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) handleDismiss();
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen]);

  const handleDismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(false);
    setForceOpen(false);
    setTextVisible(false);
    dismiss(); // Marks today's date so auto-show won't fire again today
  };

  const handleViewFeed = () => {
    handleDismiss();
    router.push('/');
  };

  // Show loading placeholder when manually opened but data not fetched yet
  const isManuallyOpenedBeforeData = forceOpen && !briefing && isLoading;

  if (!isOpen && !isManuallyOpenedBeforeData) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleDismiss}
      />

      {/* Story Card */}
      <div className={`
        relative z-10 w-full max-w-sm mx-4
        rounded-[2rem] overflow-hidden
        transition-all duration-350
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-6'}
      `}>

        {/* Story progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Gradient background */}
        <div className="
          bg-gradient-to-br from-[#0434c6] via-[#3050de] to-[#6080f0]
          dark:from-[#0a0e2e] dark:via-[#1a2060] dark:to-[#2a3590]
          min-h-[480px] flex flex-col p-7 pt-8
        ">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 mt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-tight">AI Daily Briefing</p>
                <p className="text-white/60 text-[10px] font-medium">
                  {briefing?.post_count
                    ? `${briefing.post_count} update${briefing.post_count !== 1 ? 's' : ''} since yesterday`
                    : 'Your family network'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Summary Text */}
          <div className={`flex-1 flex flex-col justify-center transition-all duration-500 ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="text-white/20 text-7xl font-serif leading-none mb-2 select-none">"</div>
            <p className="text-white text-lg font-bold leading-relaxed tracking-tight">
              {briefing?.summary ?? 'Loading your daily briefing…'}
            </p>
          </div>

          {/* Footer CTAs */}
          <div className={`flex gap-3 mt-8 transition-all duration-500 delay-200 ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={handleViewFeed}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[var(--brand)] font-extrabold text-sm hover:bg-white/90 transition-colors"
            >
              View Feed <ChevronRight size={16} />
            </button>
            <button
              onClick={handleDismiss}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
