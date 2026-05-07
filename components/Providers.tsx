'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { SWRConfig } from 'swr';
import { ChatProvider } from '@/lib/context/ChatContext';
import { startKeepAlive } from '@/lib/keepAlive';
import DailyBriefingModal from '@/components/DailyBriefingModal';

export default function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    startKeepAlive();
  }, []);

  return (
    // next-themes: attribute="class" adds/removes "dark" class on <html>
    // defaultTheme="system" respects OS preference on first visit
    // enableSystem allows automatic OS detection
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <SWRConfig value={{
        shouldRetryOnError: (error) => {
          const status = error?.response?.status;
          return status !== 401 && status !== 422;
        },
      }}>
        <ChatProvider>
          {children}
          {/* Global AI Briefing modal — mounted here so it listens on every page */}
          <DailyBriefingModal />
        </ChatProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}