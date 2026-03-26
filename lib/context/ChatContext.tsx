'use client';

import React, { createContext, useContext, useState } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  activeChatId: string | null;
  activeChatName: string | null;
  openChatWith: (chatId: string, chatName: string) => void;
  closeDM: () => void; // ← new: clears active DM back to inbox
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string | null>(null);

  const openChatWith = (chatId: string, chatName: string) => {
    setActiveChatId(chatId);
    setActiveChatName(chatName);
    setIsChatOpen(true);
  };

  const closeDM = () => {
    setActiveChatId(null);
    setActiveChatName(null);
  };

  // Clear active DM when chat is fully closed
  const handleSetChatOpen = (isOpen: boolean) => {
    setIsChatOpen(isOpen);
    if (!isOpen) {
      setActiveChatId(null);
      setActiveChatName(null);
    }
  };

  return (
    <ChatContext.Provider value={{
      isChatOpen,
      setIsChatOpen: handleSetChatOpen,
      activeChatId,
      activeChatName,
      openChatWith,
      closeDM,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}