'use client';

import { Search } from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/axios';

// 1. Import the EXACT type from ChatItem so they never get out of sync
import ChatItem, { ChatData } from './ChatItem'; 

// 2. Import the global brain so clicking a chat actually opens it!
import { useChat } from '@/lib/context/ChatContext';

interface ChatInboxProps {
  chats?: ChatData[]; // Strictly typed array!
  onSelectChat?: (id: string) => void; // Made optional
}

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ChatInbox({ chats: propChats, onSelectChat }: ChatInboxProps) {
  // Grab the global action to open a chat
  const { openChatWith } = useChat();

  // Only fetch if no chats were passed as props
  const { data: fetchedChats = [] } = useSWR(
    propChats === undefined ? '/chat/inbox' : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 }
  );

  const chats = propChats ?? fetchedChats;

  // 3. The Click Handler Logic
  const handleChatClick = (chat: ChatData) => {
    if (onSelectChat) {
      // If a parent provided a custom click handler, use it
      onSelectChat(chat.id); 
    } else {
      // Otherwise, tell the Global wrapper to open this DM/Silo!
      openChatWith(chat.id, chat.name); 
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-[#f2f4f6]">
        <h3 className="text-lg font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          Messages
        </h3>
        <button className="text-[#777587] hover:text-[#0434c6] transition-colors">
          <Search size={18} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 p-4 no-scrollbar bg-[#f7f9fb]/30">
        {chats.length === 0 ? (
          <p className="text-center text-[#b5b3c3] text-sm font-bold mt-10">Your inbox is empty.</p>
        ) : (
          chats.map((chat: ChatData) => (
            <ChatItem 
              key={chat.id} 
              chat={chat} 
              onClick={() => handleChatClick(chat)} // Pass the whole object to our smart handler
              size="md" 
            />
          ))
        )}
      </div>
    </div>
  );
}