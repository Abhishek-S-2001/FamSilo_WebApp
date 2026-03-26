'use client';

import { usePathname } from 'next/navigation';
import { useChat } from '@/lib/context/ChatContext';
import GlobalChatButton from '@/components/chat/GlobalChatButton';
import SiloChatPanel from '@/components/chat/SiloChatPanel';
import ChatInbox from '@/components/chat/ChatInbox';

export default function GlobalChatWrapper() {
  const { isChatOpen, setIsChatOpen, activeChatId, activeChatName, openChatWith } = useChat();
  const pathname = usePathname();

  const renderChatContent = () => {
    // 1. Active DM or selected chat from inbox
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

    // 2. Inside a silo — show that silo's chat contextually
    if (pathname?.startsWith('/silo/')) {
      const currentSiloId = pathname.split('/')[2];
      return (
        <SiloChatPanel
          siloId={currentSiloId}
          siloName="Silo Chat"
          isGlobal={false}
        />
      );
    }

    // 3. Default — inbox, selecting a chat routes through context
    return (
      <ChatInbox
        onSelectChat={(id) => openChatWith(id, '')}
      />
    );
  };

  return (
    <>
      <GlobalChatButton isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

      {isChatOpen && (
        <div className="fixed bottom-28 right-10 z-[100] w-[400px] md:w-[400px] h-[600px] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col">
          {renderChatContent()}
        </div>
      )}
    </>
  );
}