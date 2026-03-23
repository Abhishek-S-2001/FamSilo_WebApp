'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCheck, Smile, Send, Search, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';

import ViewProfileModal from './ViewProfileModal';

interface SiloChatPanelProps {
  siloId?: string; 
  siloName?: string;
  members?: any[];
  isGlobal?: boolean;
  preSelectedChatId?: string | null;
  preSelectedChatName?: string | null;
}

export default function SiloChatPanel({ preSelectedChatId, preSelectedChatName, siloId, siloName, members = [], isGlobal = false }: SiloChatPanelProps) {
  
  // --- STATE ---
  const [activeChatId, setActiveChatId] = useState<string | undefined>(preSelectedChatId || siloId);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  
  // FIX 1: Safely load the User ID only after the component mounts on the client!
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This securely grabs your ID and fixes the left/right bubble alignment!
    setCurrentUserId(localStorage.getItem('user_id'));
  }, []);

  // --- LIFECYCLE: Sync Active Chat ---
  useEffect(() => {
    if (preSelectedChatId) {
      setActiveChatId(preSelectedChatId);
    }
  }, [preSelectedChatId]);

  useEffect(() => {
    if (!isGlobal) setActiveChatId(siloId);
  }, [siloId, isGlobal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

// --- FETCH SMART INBOX ---
  const fetchInbox = async () => {
    try {
      const response = await api.get('/chat/inbox');
      setRecentChats(response.data);
    } catch (error) {
      console.error("Failed to load inbox", error);
    }
  };

  useEffect(() => {
    // Mark messages as read!
    api.post(`/chat/${activeChatId}/read`).catch(() => {});
    fetchInbox();
  }, [activeChatId]); // Re-fetch when active chat changes


  // --- WEBSOCKET & HISTORY LIFECYCLE ---
  useEffect(() => {
    if (!activeChatId) return;

    setMessages([]); // Clear old messages when switching rooms

    const token = localStorage.getItem('family_app_token');
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chat/${activeChatId}/messages`);
        setMessages(response.data);
      } catch (error: any) {
        console.error("Failed to load chat history", error);
      }
    };
    fetchHistory();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsUrl}/chat/ws/${activeChatId}?token=${token}`);

    socket.onopen = () => console.log(`Connected to Room ${activeChatId}`);
    
    socket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, incomingMessage]);
    };

    socket.onclose = () => console.log(`Disconnected from Room ${activeChatId}`);
    ws.current = socket;

    return () => socket.close();
  }, [activeChatId]);

  // --- SEND MESSAGE ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current) return;
    ws.current.send(newMessage);
    setNewMessage("");
  };

  const renderAvatarStack = () => {
    const displayMembers = members.slice(0, 3);
    const extraCount = members.length - 3;
    return (
      <div className="flex items-center -space-x-2.5">
        {displayMembers.map((member, i) => (
          <div key={member.id} className="w-7 h-7 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center overflow-hidden shadow-sm" style={{ zIndex: 10 - i }}>
            {member.avatar ? (
              <img src={member.avatar} className="w-full h-full object-cover" alt={member.username} />
            ) : (
              <span className="text-[#0434c6] font-extrabold uppercase text-[10px]">{member.username?.charAt(0) || 'U'}</span>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e0e3e5] flex items-center justify-center text-[10px] font-bold text-[#464555] z-0">+{extraCount}</div>
        )}
      </div>
    );
  };

  // --- DYNAMIC UI VARIABLES ---
  const activeChatInfo = recentChats.find(c => c.id === activeChatId);
  const isDM = activeChatId?.startsWith('dm_') || activeChatInfo?.type === 'dm';
  
  // FIX 3: If it's a DM but we don't have the name yet, say "Direct Message" instead of "Family Chat"
  const displayTitle = activeChatInfo?.name || preSelectedChatName || siloName || (isDM ? 'Direct Message' : 'Family Chat');
  const otherChats = recentChats.filter(chat => chat.id !== activeChatId);


  // ==========================================
  // VIEW 1: GLOBAL INBOX
  // ==========================================
  if (isGlobal && !activeChatId) {
    return (
      // FIX 2: Solid white background so the teal hero banner doesn't bleed through!
      <div className="col-span-1 md:col-span-4 lg:col-span-3 w-full h-full md:h-[calc(100vh-8rem)] bg-white md:rounded-[3rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-[#f2f4f6] flex flex-col overflow-hidden relative">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#f2f4f6]">
          <h3 className="text-lg font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Messages
          </h3>
          <button className="text-[#777587] hover:text-[#0434c6] transition-colors"><Search size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 p-4 no-scrollbar bg-[#f7f9fb]/30">
          {recentChats.length === 0 ? (
            <p className="text-center text-[#b5b3c3] text-sm font-bold mt-10">Your inbox is empty.</p>
          ) : (
            recentChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)} 
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f2f4f6] cursor-pointer transition-colors group"
              >
                {chat.type === 'dm' ? (
                   <div className="w-12 h-12 rounded-full bg-[#e0e3e5] flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-sm overflow-hidden border-2 border-white">
                      {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-extrabold text-lg">{chat.name.charAt(0).toUpperCase()}</span>
                      )}
                   </div>
                ) : (
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-inner">
                      <span className="font-extrabold text-lg">{chat.name.charAt(0).toUpperCase()}</span>
                   </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm truncate ${chat.unread_count > 0 ? 'font-extrabold text-[#191c1e]' : 'font-bold text-[#464555]'}`}>
                      {chat.name}
                    </h4>
                    {/* Timestamp of last message */}
                    <span className={`text-[10px] ${chat.unread_count > 0 ? 'text-[#0434c6] font-bold' : 'text-[#b5b3c3] font-medium'}`}>
                       {chat.last_message_time !== "2000-01-01T00:00:00Z" ? new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[85%] ${chat.unread_count > 0 ? 'text-[#191c1e] font-bold' : 'text-[#777587] font-medium'}`}>
                       {chat.last_message_preview}
                    </p>
                    {/* Unread Blue Dot Badge */}
                    {chat.unread_count > 0 && (
                      <div className="w-4 h-4 rounded-full bg-[#0434c6] text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                        {chat.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE CHAT SPLIT VIEW
  // ==========================================
  return (
    // Solid white background here too!
    <div className="col-span-1 md:col-span-4 lg:col-span-3 w-full h-full md:h-[calc(100vh-8rem)] bg-white md:rounded-[3rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-[#f2f4f6] flex flex-col overflow-hidden relative pb-6">
      
      {/* TOP SECTION: Header & Chat */}
      <div className="flex flex-col flex-1 h-[60%] border-b border-[#f2f4f6]">
        <div className="p-6 pb-4 flex items-center justify-between z-10 bg-white">
          <div className="flex items-center gap-2">
            {isGlobal ? (
              <button onClick={() => setActiveChatId(undefined)} className="text-[#777587] hover:text-[#0434c6] -ml-1 mr-1 transition-colors">
                <ChevronLeft size={22} />
              </button>
            ) : (
              <MessageSquare size={20} className="text-[#0434c6]" />
            )}
            <h3 className="text-lg font-extrabold text-[#191c1e] truncate max-w-[150px]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {displayTitle}
            </h3>
          </div>
          {activeChatId === siloId && !isDM && renderAvatarStack()}
        </div>

        {/* CHAT MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 pt-4 flex flex-col gap-5 no-scrollbar bg-[#f7f9fb]/30">
          {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 bg-[#e0e3e5] rounded-full flex items-center justify-center text-[#777587] mb-4"><MessageSquare size={28} /></div>
                <p className="text-[#191c1e] font-extrabold text-sm mb-1">No messages yet</p>
                <p className="text-[#777587] text-xs font-medium">Say hello!</p>
              </div>
          ) : (
              messages.map((msg, idx) => {
                // Now currentUserId is guaranteed to be loaded!
                const isMe = currentUserId && (msg.user_id === currentUserId || msg.sender_id === currentUserId);
                const senderName = isMe ? 'You' : (msg.profiles?.username || msg.username || msg.sender || 'Family Member');

                return (
                  <div key={idx} className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isMe ? 'items-end self-end' : 'items-start'}`}>
                    
                    <span className={`text-[10px] font-bold text-[#b5b3c3] ${isMe ? 'mr-2' : 'ml-2'}`}>
                      {senderName}
                    </span>
                    
                    <div className={`px-5 py-3.5 rounded-[1.25rem] text-sm font-medium leading-relaxed shadow-sm ${
                      isMe ? 'bg-[#0434c6] text-white rounded-tr-sm shadow-md' : 'bg-white border border-[#e0e3e5] text-[#191c1e] rounded-tl-sm'
                    }`}>
                      {msg.content || msg.text}
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'mr-2' : 'ml-2'}`}>
                      <span className="text-[9px] font-bold text-[#b5b3c3]">
                        {msg.created_at || msg.timestamp ? new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      {isMe && <CheckCheck size={12} className="text-[#0434c6]" />}
                    </div>
                  </div>
                );
              })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* CHAT INPUT FORM */}
        <div className="px-5 pb-4 pt-3 bg-white">
          <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#f7f9fb] border border-[#e0e3e5] rounded-full shadow-sm p-1.5 pr-2 focus-within:border-[#0434c6]/50 transition-colors">
            <button type="button" className="text-[#777587] hover:text-[#0434c6] transition-colors p-2">
              <Smile size={20} />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isDM ? `Message...` : "Message the family..."} 
              className="w-full bg-transparent border-none text-sm font-medium text-[#191c1e] placeholder-[#b5b3c3] focus:ring-0 outline-none px-2"
            />
            <button type="submit" className="w-8 h-8 bg-[#0434c6] rounded-full flex items-center justify-center text-white hover:bg-[#3050de] transition-colors">
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM SECTION: Other Conversations */}
      <div className="flex flex-col h-[40%] px-6 pt-5 bg-white">
         <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-[#f2f4f6] flex-1"></div>
          <span className="text-[9px] font-bold text-[#b5b3c3] uppercase tracking-widest">Other Conversations</span>
          <div className="h-px bg-[#f2f4f6] flex-1"></div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 no-scrollbar pb-16">
          {otherChats.length === 0 ? (
             <p className="text-center text-[#b5b3c3] text-xs font-bold mt-4">No other chats yet.</p>
          ) : (
            otherChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChatId(chat.id)} 
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f7f9fb] cursor-pointer transition-colors border border-transparent hover:border-[#f2f4f6] group"
              >
                {chat.type === 'dm' ? (
                   <div className="w-10 h-10 rounded-full bg-[#e0e3e5] flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-sm overflow-hidden border border-white">
                      {chat.avatar ? (
                        
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-extrabold text-sm">{chat.name.charAt(0).toUpperCase()}</span>
                      )}
                   </div>
                ) : (
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[#0434c6] flex-shrink-0 shadow-inner">
                      <span className="font-extrabold text-sm">{chat.name.charAt(0).toUpperCase()}</span>
                   </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm truncate ${chat.unread_count > 0 ? 'font-extrabold text-[#191c1e]' : 'font-bold text-[#464555]'}`}>
                      {chat.name}
                    </h4>
                    {/* Timestamp of last message */}
                    <span className={`text-[10px] ${chat.unread_count > 0 ? 'text-[#0434c6] font-bold' : 'text-[#b5b3c3] font-medium'}`}>
                       {chat.last_message_time !== "2000-01-01T00:00:00Z" ? new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[85%] ${chat.unread_count > 0 ? 'text-[#191c1e] font-bold' : 'text-[#777587] font-medium'}`}>
                       {chat.last_message_preview}
                    </p>
                    {/* Unread Blue Dot Badge */}
                    {chat.unread_count > 0 && (
                      <div className="w-4 h-4 rounded-full bg-[#0434c6] text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                        {chat.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}