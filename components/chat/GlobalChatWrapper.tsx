'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/lib/context/ChatContext';
import GlobalChatButton from '@/components/chat/GlobalChatButton';
import SiloChatPanel from '@/components/chat/SiloChatPanel';
import ChatInbox from '@/components/chat/ChatInbox';
import ConciergeChatPanel from '@/components/ConciergeChatPanel';

export default function GlobalChatWrapper() {
  const { isChatOpen, setIsChatOpen, activeChatId, activeChatName, openChatWith } = useChat();
  const pathname = usePathname();
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Listen for the AI Concierge trigger from the Navbar button
  useEffect(() => {
    const handler = () => {
      setIsConciergeOpen(prev => !prev);
      setIsChatOpen(false); // Close regular chat if open
    };
    window.addEventListener('open-concierge', handler);
    return () => window.removeEventListener('open-concierge', handler);
  }, [setIsChatOpen]);

  // Hide on auth pages
  if (
    pathname === '/login' ||
    pathname === '/docs' ||
    pathname === '/auth/callback' ||
    pathname === '/reset-password' ||
    pathname?.startsWith('/auth/')
  ) {
    return null;
  }

  const currentSiloId = pathname?.startsWith('/silo/')
    ? pathname.split('/')[2]
    : null;

  const renderChatContent = () => {
    if (activeChatId) {
      return (
        <SiloChatPanel
          siloId={activeChatId}
          siloName={activeChatName || 'Direct Message'}
          isGlobal={true}
          preSelectedChatId={activeChatId}
          preSelectedChatName={activeChatName || 'Direct Message'}
        />
      );
    }
    if (currentSiloId) {
      return (
        <SiloChatPanel
          siloId={currentSiloId}
          siloName="Silo Chat"
          isGlobal={false}
        />
      );
    }
    return <ChatInbox onSelectChat={(id) => openChatWith(id, '')} />;
  };

  const panelClass = `
    fixed bottom-28 right-4 md:right-10 z-[100]
    w-[calc(100vw-2rem)] md:w-[400px] h-[600px]
    rounded-2xl overflow-hidden flex flex-col
    bg-[var(--bg-card)] border border-[var(--border-default)]
    shadow-[var(--shadow-float)] dark:shadow-none
    animate-slide-up-fade
  `;

  return (
    <>
      <GlobalChatButton isChatOpen={isChatOpen} setIsChatOpen={(open) => {
        setIsChatOpen(open);
        if (open) setIsConciergeOpen(false); // Mutually exclusive
      }} />

      {/* Regular Chat Panel */}
      {isChatOpen && (
        <div className={panelClass}>
          {renderChatContent()}
        </div>
      )}

      {/* AI Concierge Panel */}
      {isConciergeOpen && (
        <div className={panelClass} style={{ right: isChatOpen ? 'calc(1rem + 420px)' : undefined }}>
          <ConciergeChatPanel
            onClose={() => setIsConciergeOpen(false)}
            siloId={currentSiloId}
          />
        </div>
      )}
    </>
  );
}