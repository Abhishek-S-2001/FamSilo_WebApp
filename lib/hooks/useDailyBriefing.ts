'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface BriefingData {
  summary: string;
  post_count: number;
  cached: boolean;
  date: string;
}

const STORAGE_KEY = 'famsilo_briefing_shown';

export function useDailyBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('family_app_token');
    if (!token) return;

    const today = new Date().toISOString().slice(0, 10);
    const shownDate = localStorage.getItem(STORAGE_KEY);

    // ALWAYS fetch — backend caches it, so subsequent calls are instant.
    // shouldShow is controlled separately by localStorage.
    setIsLoading(true);
    api.get('/agents/briefing')
      .then((res) => {
        setBriefing(res.data);
        // Auto-show only if not already shown today
        if (shownDate !== today) {
          setShouldShow(true);
        }
      })
      .catch(() => {
        // Fail silently — briefing is non-critical
      })
      .finally(() => setIsLoading(false));
  }, []);

  const dismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);
    setShouldShow(false);
  };

  return { briefing, shouldShow, isLoading, dismiss };
}
