'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, ChevronDown } from 'lucide-react';
import TypingIndicator from '@/components/TypingIndicator';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  streaming?: boolean;
}

interface ConciergeChatPanelProps {
  onClose: () => void;
  siloId?: string | null;
}

const SUGGESTIONS = [
  'What have we been discussing lately?',
  'Summarise recent proposals',
  'What memories did we share this week?',
  'Are there any pending votes?',
];

export default function ConciergeChatPanel({ onClose, siloId }: ConciergeChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', streaming: true }]);

    try {
      const token = localStorage.getItem('family_app_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const siloParam = siloId ? `&silo_id=${siloId}` : '';
      const url = `${apiUrl}/agents/concierge/stream?q=${encodeURIComponent(query)}${siloParam}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE data lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.chunk || '';
            setMessages(prev =>
              prev.map(m => m.id === aiMsgId
                ? { ...m, content: accumulated, streaming: true }
                : m
              )
            );
          } catch { /* ignore parse errors */ }
        }
      }

      // Mark streaming complete
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: 'Sorry, I had trouble reaching the server. Please try again.', streaming: false }
          : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-medium)] flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm text-[var(--text-primary)]">AI Concierge</p>
          <p className="text-[10px] font-medium text-[var(--text-faint)]">
            {siloId ? 'Searching this silo\'s memory' : 'Searching across your silos'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 thin-scrollbar">

        {/* Empty state / suggestions */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-3 h-full justify-center">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--brand-soft)] to-[var(--brand-soft)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-[var(--brand)]" />
              </div>
              <p className="text-sm font-extrabold text-[var(--text-primary)]">Ask me anything</p>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
                I know everything your family has shared
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-fade`}
          >
            {msg.role === 'ai' && msg.content === '' && msg.streaming ? (
              <TypingIndicator />
            ) : (
              <div className={`max-w-[85%] px-4 py-3 rounded-[1.25rem] text-sm font-medium leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--brand)] text-white rounded-tr-sm'
                  : 'bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.streaming && msg.content && (
                  <span className="inline-block w-1.5 h-4 bg-current opacity-70 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask about your family's posts…"
            className="flex-1 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-full px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--brand)] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100 flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
