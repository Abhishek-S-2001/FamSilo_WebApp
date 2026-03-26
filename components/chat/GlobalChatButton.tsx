'use client';

import { MessageSquare, X } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/axios';
import { useUser } from '@/lib/hooks/useUser';

const fetcher = (url: string) => api.get(url).then(r => r.data);

interface GlobalChatButtonProps {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

export default function GlobalChatButton({ isChatOpen, setIsChatOpen }: GlobalChatButtonProps) {
  const { user } = useUser();

  // Reuse the inbox SWR cache — no extra API call, no extra endpoint needed
  const { data: inbox = [] } = useSWR(
    user ? '/chat/inbox' : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const unreadCount = inbox.reduce(
    (sum: number, chat: any) => sum + (chat.unread_count || 0), 0
  );

  const handleToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-4">
      <button
        onClick={handleToggle}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0434c6] text-white shadow-[0_8px_24px_rgba(4,52,198,0.3)] hover:bg-blue-800 transition-all hover:scale-105 active:scale-95"
      >
        {isChatOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageSquare size={24} className="mt-0.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}