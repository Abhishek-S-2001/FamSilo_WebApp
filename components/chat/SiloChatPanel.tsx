'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import ChatInbox from '@/components/chat/ChatInbox';
import ChatWindow from '@/components/chat/ChatWindow';

interface SiloChatPanelProps {
  siloId?: string;
  siloName?: string;
  members?: any[];
  isGlobal?: boolean;
  preSelectedChatId?: string | null;
  preSelectedChatName?: string | null;
}

export default function SiloChatPanel({
  preSelectedChatId, preSelectedChatName,
  siloId, siloName, members = [], isGlobal = false,
}: SiloChatPanelProps) {

  const [activeChatId, setActiveChatId] = useState<string | undefined>(preSelectedChatId || siloId);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Load user ID client-side only
  useEffect(() => {
    setCurrentUserId(localStorage.getItem('user_id'));
  }, []);

  // Sync active chat from props
  useEffect(() => {
    if (preSelectedChatId) setActiveChatId(preSelectedChatId);
  }, [preSelectedChatId]);

  useEffect(() => {
    if (!isGlobal) setActiveChatId(siloId);
  }, [siloId, isGlobal]);

  // Fetch inbox
  const fetchInbox = async () => {
    try {
      const res = await api.get('/chat/inbox');
      setRecentChats(res.data);
    } catch (err) {
      console.error('Failed to load inbox', err);
    }
  };

  useEffect(() => {
    api.post(`/chat/${activeChatId}/read`).catch(() => {});
    fetchInbox();
  }, [activeChatId]);

  // WebSocket + message history
  useEffect(() => {
    if (!activeChatId) return;
    setMessages([]);

    const token = localStorage.getItem('family_app_token');
    if (!token) return;

    api.get(`/chat/${activeChatId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to load chat history', err));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsUrl}/chat/ws/${activeChatId}?token=${token}`);

    socket.onopen = () => console.log(`Connected to Room ${activeChatId}`);
    socket.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };
    socket.onclose = () => console.log(`Disconnected from Room ${activeChatId}`);

    ws.current = socket;
    return () => socket.close();
  }, [activeChatId]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current) return;
    ws.current.send(newMessage);
    setNewMessage('');
  };

  // Derived state
  const activeChatInfo = recentChats.find(c => c.id === activeChatId);
  const isDM = activeChatId?.startsWith('dm_') || activeChatInfo?.type === 'dm';
  const displayTitle = activeChatInfo?.name || preSelectedChatName || siloName || (isDM ? 'Direct Message' : 'Family Chat');
  const otherChats = recentChats.filter(c => c.id !== activeChatId);

  // VIEW 1: Global inbox with no active chat selected
  if (isGlobal && !activeChatId) {
    return <ChatInbox chats={recentChats} onSelectChat={setActiveChatId} />;
  }

  // VIEW 2: Active chat
  return (
    <ChatWindow
      displayTitle={displayTitle}
      messages={messages}
      currentUserId={currentUserId}
      newMessage={newMessage}
      isDM={isDM}
      isGlobal={isGlobal}
      siloId={siloId}
      activeChatId={activeChatId}
      members={members}
      otherChats={otherChats}
      onMessageChange={setNewMessage}
      onSendMessage={handleSendMessage}
      onSelectChat={setActiveChatId}
      onBack={() => setActiveChatId(undefined)}
    />
  );
}