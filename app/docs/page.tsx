'use client';

import { useState } from 'react';
import { X, ArrowRight, Cpu, Globe, Database, Shield, Zap, Bot, MessageSquare, Newspaper, Users } from 'lucide-react';

// ─── NODE DATA ─────────────────────────────────────────────────────────────

type NodeId = 'frontend' | 'auth' | 'backend' | 'websocket' | 'agents' | 'briefing' | 'facilitator' | 'concierge' | 'database' | 'storage';

interface NodeInfo {
  id: NodeId;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  ring: string;
  connects: NodeId[];
  badge?: string;
  detail: {
    description: string;
    sections: { title: string; items: string[] }[];
  };
}

const NODES: Record<NodeId, NodeInfo> = {
  frontend: {
    id: 'frontend', label: 'Browser / Next.js', subtitle: 'App Router · React 19 · Tailwind v4',
    icon: <Globe size={22} />, gradient: 'from-blue-600 to-indigo-700', glow: 'shadow-blue-500/50', ring: 'ring-blue-400',
    connects: ['auth', 'backend', 'websocket'],
    detail: {
      description: 'The consumer-facing Next.js 16 app. Uses the App Router with server + client components, a Tailwind v4 design system, hardware-accelerated animations, and a seamless dark/light theme engine.',
      sections: [
        { title: 'Key Pages', items: ['/ — Home feed dashboard', '/silo/[id] — Group dashboard (Vault, Members, Chat)', '/profile — User profile & timeline', '/login — Auth (Email / Username / OAuth)', '/docs — This interactive docs page'] },
        { title: 'Core Libraries', items: ['SWR — Data fetching & caching', 'Axios — JWT-intercepted API client (lib/axios.ts)', 'next-themes — Flicker-free dark mode', 'lucide-react — Icon system'] },
        { title: 'State & Events', items: ['ChatContext — Global open-chat-with() helper', 'Custom window events: open-briefing, open-concierge, toggle-mobile-sidebar', 'localStorage: family_app_token, user_id, famsilo_briefing_shown'] },
      ],
    },
  },
  auth: {
    id: 'auth', label: 'Auth Layer', subtitle: 'Supabase Auth · JWT Bearer',
    icon: <Shield size={22} />, gradient: 'from-violet-600 to-purple-700', glow: 'shadow-violet-500/50', ring: 'ring-violet-400',
    connects: ['backend', 'database'],
    detail: {
      description: 'Supabase Auth handles all identity. Supports email/password and Google OAuth. The FastAPI backend verifies JWTs on every request using the Supabase Admin SDK.',
      sections: [
        { title: 'Login Flow', items: ['User enters email OR username', 'POST /auth/login — backend resolves username → email', 'Supabase sign_in_with_password() returns JWT', 'Token stored as family_app_token in localStorage', 'Axios interceptor attaches Bearer token to all requests'] },
        { title: 'Signup Rules', items: ['Username: 3-20 chars, lowercase alphanumeric + underscore', 'Username uniqueness checked before Supabase user creation', 'Profile row inserted in profiles table immediately on signup', '7-day cooldown enforced for username changes'] },
        { title: 'API Endpoints', items: ['POST /auth/signup', 'POST /auth/login', '401/422 → auto-logout + redirect to /login'] },
      ],
    },
  },
  backend: {
    id: 'backend', label: 'FastAPI Backend', subtitle: 'Python · Uvicorn · Pydantic v2',
    icon: <Cpu size={22} />, gradient: 'from-emerald-600 to-green-700', glow: 'shadow-emerald-500/50', ring: 'ring-emerald-400',
    connects: ['agents', 'database', 'storage', 'websocket'],
    detail: {
      description: 'The central API server. Built with FastAPI for automatic OpenAPI docs, strict Pydantic v2 validation, and async background tasks for moderation and AI pipelines.',
      sections: [
        { title: 'API Routers', items: ['POST/GET /auth — Signup, Login', 'GET/PUT /users/me — Profile CRUD', 'GET/POST /silos — Group management + invite flows', 'POST/GET /posts — Feed creation with AI moderation', 'GET /notifications — Bell feed + accept/decline invites', 'GET /chat — Inbox, history, search', 'GET/POST /agents — AI Agent Suite'] },
        { title: 'Background Tasks', items: ['Image moderation — Gemini scans on upload', 'Video moderation — Async stream analysis', 'File quarantine — Moves flagged media to secure bucket', 'Post indexing — Embeds new posts to pgvector'] },
        { title: 'Content Moderation States', items: ['approved — Visible to all silo members', 'pending — Under analysis, visible only to author', 'quarantined — Flagged, hidden, file moved to private bucket'] },
      ],
    },
  },
  websocket: {
    id: 'websocket', label: 'WebSocket Server', subtitle: 'Real-time Chat · ConnectionManager',
    icon: <Zap size={22} />, gradient: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/50', ring: 'ring-orange-400',
    connects: ['database'],
    detail: {
      description: 'Handles real-time bidirectional messaging for both Silo group chats and direct messages. A single in-memory ConnectionManager maps room IDs to live WebSocket connections.',
      sections: [
        { title: 'Endpoint', items: ['WS /chat/ws/{room_id}?token={jwt}', 'Token verified against Supabase Auth on connect', 'Message persisted to DB, then broadcast to all room members'] },
        { title: 'Room ID Convention', items: ['Silo Chat: {silo_uuid} — the group UUID directly', 'Direct Message: dm_{sorted_id_1}_{sorted_id_2} — alphabetically sorted for determinism'] },
        { title: 'REST Companions', items: ['GET /chat/inbox — Smart inbox with unread counts', 'GET /chat/{room_id}/messages — Full history', 'POST /chat/{room_id}/read — Mark all as read', 'GET /chat/search?q= — Unified user + silo search'] },
      ],
    },
  },
  agents: {
    id: 'agents', label: 'AI Agent Suite', subtitle: 'Gemini 2.5 Flash · pgvector RAG',
    icon: <Bot size={22} />, gradient: 'from-pink-600 to-rose-700', glow: 'shadow-pink-500/50', ring: 'ring-pink-400',
    connects: ['briefing', 'facilitator', 'concierge', 'database'],
    badge: 'NEW',
    detail: {
      description: 'Three autonomous AI agents powered by Gemini 2.5 Flash. They read, curate, and actively participate in your family network — from morning briefings to reigniting dormant conversations.',
      sections: [
        { title: 'Shared Utility (ai_agent.py)', items: ['embed_text() — 768-dim embeddings via text-embedding-004', 'stream_text() — Async SSE generator for Gemini output', 'Shared Supabase + genai client instances'] },
        { title: 'API Endpoints', items: ['GET /agents/briefing — Personalized daily digest', 'POST /agents/facilitator/check/{silo_id} — Dormancy check + post generation', 'GET /agents/concierge/stream?q= — SSE RAG chat stream', 'POST /agents/index/{silo_id} — Index all posts into pgvector'] },
        { title: 'Database Tables', items: ['post_embeddings — vector(768) with silo_id FK', 'daily_briefings — Cached summaries per user per day', 'facilitator_runs — Idempotency log (once per silo per day)'] },
      ],
    },
  },
  briefing: {
    id: 'briefing', label: 'Daily Briefing', subtitle: 'Story-style · Once per day',
    icon: <Newspaper size={22} />, gradient: 'from-sky-500 to-cyan-600', glow: 'shadow-sky-500/50', ring: 'ring-sky-400',
    connects: [],
    badge: 'NEW',
    detail: {
      description: 'An Instagram Story-style modal that greets users each morning with a warm 2-sentence AI summary of unseen family activity. Auto-dismisses after 9 seconds with a progress bar.',
      sections: [
        { title: 'Frontend (DailyBriefingModal.tsx)', items: ['Auto-shows on first page load of the day', 'localStorage (famsilo_briefing_shown) prevents repeat auto-shows', 'Sidebar "Today\'s Briefing" button always re-opens it', 'Custom event: window.dispatchEvent(new Event("open-briefing"))', 'Mounted globally in Providers.tsx — available on every page'] },
        { title: 'Backend Logic', items: ['GET /agents/briefing fetches past 24h posts across all silos', 'Summarized by Gemini into a warm, human tone', 'Cached in daily_briefings table — re-requests are instant', 'useDailyBriefing hook always fetches; localStorage only gates auto-show'] },
      ],
    },
  },
  facilitator: {
    id: 'facilitator', label: 'Silo Facilitator', subtitle: 'Dormancy detection · Auto-post',
    icon: <Users size={22} />, gradient: 'from-lime-600 to-green-700', glow: 'shadow-lime-500/50', ring: 'ring-lime-400',
    connects: [],
    badge: 'NEW',
    detail: {
      description: 'When a family Silo goes quiet for 24 hours, the Facilitator automatically generates and posts a contextually appropriate piece of content — a joke, trivia, a challenge, or a proposal — to reignite engagement.',
      sections: [
        { title: 'Trigger Flow', items: ['SiloFeed.tsx pings POST /agents/facilitator/check/{silo_id} on load', 'Backend checks: last post timestamp < 24 hours ago?', 'Checks facilitator_runs to ensure idempotency (once per silo per day)', 'If dormant: Gemini generates content based on silo name + history', 'Post inserted with is_ai_generated=true flag'] },
        { title: 'Content Types', items: ['Family trivia or nostalgic question', 'A joke tailored to the group name', 'A "challenge" or activity proposal', 'A heartfelt open-ended question'] },
      ],
    },
  },
  concierge: {
    id: 'concierge', label: 'AI Concierge', subtitle: 'RAG Chat · SSE Streaming',
    icon: <MessageSquare size={22} />, gradient: 'from-fuchsia-600 to-purple-700', glow: 'shadow-fuchsia-500/50', ring: 'ring-fuchsia-400',
    connects: [],
    badge: 'NEW',
    detail: {
      description: 'A context-aware AI chatbot that intimately knows your family\'s post history. Answers questions grounded in actual silo content via a pgvector RAG pipeline, streamed token-by-token.',
      sections: [
        { title: 'RAG Pipeline', items: ['Posts indexed as 768-dim vectors in post_embeddings table', 'User query embedded with text-embedding-004', 'match_silo_posts() Supabase RPC: cosine similarity search', 'Top 5 results injected as context into Gemini prompt', 'Answer streamed via Server-Sent Events (SSE)'] },
        { title: 'Frontend (ConciergeChatPanel.tsx)', items: ['Opened via ✨ button in TopNavbar or navbar entry', 'Custom event: window.dispatchEvent(new Event("open-concierge"))', 'Uses ReadableStream (not EventSource) to support Bearer JWT header', 'Mutually exclusive with regular chat panel in GlobalChatWrapper'] },
      ],
    },
  },
  database: {
    id: 'database', label: 'PostgreSQL / pgvector', subtitle: 'Supabase · RLS · Embeddings',
    icon: <Database size={22} />, gradient: 'from-purple-600 to-indigo-700', glow: 'shadow-purple-500/50', ring: 'ring-purple-400',
    connects: [],
    detail: {
      description: 'Supabase-hosted PostgreSQL with Row Level Security enabled. Extended with pgvector for AI embedding storage. All data access validated server-side via JWT.',
      sections: [
        { title: 'Core Tables', items: ['profiles — User accounts, avatars, privacy toggles', 'groups — Silos (family groups)', 'group_members — users ↔ groups + role (admin|member)', 'posts — Content with status: approved|pending|quarantined', 'messages — Unified Silo + DM chat (silo_id nullable)', 'notifications — Bell feed: silo_invite, like, comment, etc.', 'silo_invites — Email invite tokens'] },
        { title: 'AI Tables (002_ai_agent_tables.sql)', items: ['post_embeddings — vector(768) per post', 'daily_briefings — Cached AI briefing per user per day', 'facilitator_runs — One-per-silo-per-day idempotency log'] },
        { title: 'Key Features', items: ['Row Level Security on all tables', 'match_silo_posts() RPC for vector cosine similarity search', 'Full-text search on users via ilike + similarity score'] },
      ],
    },
  },
  storage: {
    id: 'storage', label: 'Supabase Storage', subtitle: 'Media Buckets · Quarantine',
    icon: <Shield size={22} />, gradient: 'from-teal-600 to-cyan-700', glow: 'shadow-teal-500/50', ring: 'ring-teal-400',
    connects: [],
    detail: {
      description: 'Manages all user-uploaded media. Files are initially uploaded to a public staging area, then moved to secure buckets based on AI moderation results.',
      sections: [
        { title: 'Buckets', items: ['profiles — Avatars and cover photos (public)', 'media — Approved post images and videos', 'media-quarantine — Flagged content (private, admin-only)'] },
        { title: 'Upload Flow', items: ['1. Client uploads file to Supabase Storage via signed URL', '2. File path stored in posts table with status=pending', '3. BackgroundTask downloads + scans with Gemini', '4. If clean → status=approved, stays in media bucket', '5. If flagged → status=quarantined, file moved to media-quarantine'] },
      ],
    },
  },
};

// ─── NODE COMPONENT ────────────────────────────────────────────────────────

function ArchNode({ node, selected, onClick, pulse }: { node: NodeInfo; selected: boolean; onClick: () => void; pulse?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-br ${node.gradient} text-white font-bold text-sm transition-all duration-300 cursor-pointer shadow-lg ${node.glow}
        ${selected ? `scale-105 ring-4 ${node.ring} ring-offset-2 ring-offset-[#0a0e1a] shadow-2xl` : 'hover:scale-105 hover:shadow-xl opacity-90 hover:opacity-100'}
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{ minWidth: 130 }}
    >
      {node.badge && (
        <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
          {node.badge}
        </span>
      )}
      <div className="opacity-90">{node.icon}</div>
      <div className="text-xs font-extrabold leading-tight text-center">{node.label}</div>
      <div className="text-[10px] font-medium opacity-70 text-center leading-tight">{node.subtitle}</div>
    </button>
  );
}

// ─── CONNECTION LINE ──────────────────────────────────────────────────────

function Line({ vertical = false, dashed = false }: { vertical?: boolean; dashed?: boolean }) {
  return (
    <div className={`relative ${vertical ? 'w-[2px] h-8 mx-auto' : 'h-[2px] w-8 my-auto'} bg-gradient-to-r from-white/10 via-white/30 to-white/10 overflow-hidden rounded-full`}>
      <div className={`absolute inset-0 bg-white/60 ${vertical ? 'animate-[shimmer_1.5s_ease-in-out_infinite]' : 'animate-[shimmer_1.5s_ease-in-out_infinite]'}`} />
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: NodeInfo; onClose: () => void }) {
  return (
    <div className="animate-[slide-up-fade_0.35s_cubic-bezier(0.16,1,0.3,1)_both] flex flex-col h-full overflow-y-auto">
      <div className="flex items-start justify-between mb-5">
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br ${node.gradient} text-white shadow-lg ${node.glow}`}>
          {node.icon}
          <div>
            <div className="font-extrabold text-sm">{node.label}</div>
            <div className="text-[10px] opacity-70">{node.subtitle}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-6 border-l-2 border-white/20 pl-4">{node.detail.description}</p>

      <div className="space-y-5 flex-1">
        {node.detail.sections.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-2">{section.title}</div>
            <div className="space-y-1.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/80 group/item hover:text-white transition-colors">
                  <ArrowRight size={12} className="flex-shrink-0 mt-1 text-white/30 group-hover/item:text-white/60 transition-colors" />
                  <span className="leading-snug font-mono text-[11px] text-white/70 hover:text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [selected, setSelected] = useState<NodeId | null>(null);

  const select = (id: NodeId) => setSelected(prev => prev === id ? null : id);
  const selectedNode = selected ? NODES[selected] : null;

  return (
    <div className="min-h-screen bg-[#080c18] text-white" style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="px-8 pt-10 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/60 tracking-widest uppercase">Interactive · Architecture Explorer</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">FamSilo System Anatomy</h1>
        <p className="text-white/40 mt-2 text-sm">Click any node to explore its internals. Connections show data flow between layers.</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-16 flex gap-6 min-h-[80vh]">

        {/* Architecture Diagram */}
        <div className="flex-1 min-w-0">
          <div className="relative flex flex-col items-center gap-0 pt-4">

            {/* Layer 1: Browser */}
            <ArchNode node={NODES.frontend} selected={selected === 'frontend'} onClick={() => select('frontend')} />

            {/* L1 → L2 connector hub */}
            <Line vertical />
            <div className="flex items-center gap-0 w-full justify-center">
              <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-white/20 max-w-[100px] ml-auto" />
              <div className="w-[2px] h-4 bg-white/20" />
              <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-white/20 max-w-[100px] mr-auto" />
            </div>

            {/* Layer 2: Auth | Backend | WebSocket */}
            <div className="flex items-start gap-8 mt-0">
              <div className="flex flex-col items-center gap-2">
                <ArchNode node={NODES.auth} selected={selected === 'auth'} onClick={() => select('auth')} />
              </div>

              <div className="flex flex-col items-center gap-0">
                <ArchNode node={NODES.backend} selected={selected === 'backend'} onClick={() => select('backend')} />
                
                {/* Backend → L3 connectors */}
                <Line vertical />
                <div className="flex items-center w-[460px] justify-center">
                  <div className="flex-1 h-[2px] bg-white/20" />
                  <div className="w-[2px] h-4 bg-white/20 mx-0" />
                  <div className="flex-1 h-[2px] bg-white/20" />
                </div>

                {/* Layer 3: Agents | Database | Storage */}
                <div className="flex items-start gap-6 mt-0">
                  
                  <div className="flex flex-col items-center gap-0">
                    <ArchNode node={NODES.agents} selected={selected === 'agents'} onClick={() => select('agents')} />
                    
                    {/* Agents → Sub-agents */}
                    <Line vertical />
                    <div className="flex items-center w-[360px] justify-center">
                      <div className="flex-1 h-[2px] bg-white/15" />
                      <div className="w-[2px] h-4 bg-white/15" />
                      <div className="flex-1 h-[2px] bg-white/15" />
                    </div>

                    {/* Layer 4: Sub-agents */}
                    <div className="flex items-start gap-4 mt-0">
                      <ArchNode node={NODES.briefing} selected={selected === 'briefing'} onClick={() => select('briefing')} />
                      <ArchNode node={NODES.facilitator} selected={selected === 'facilitator'} onClick={() => select('facilitator')} />
                      <ArchNode node={NODES.concierge} selected={selected === 'concierge'} onClick={() => select('concierge')} />
                    </div>
                  </div>

                  <ArchNode node={NODES.database} selected={selected === 'database'} onClick={() => select('database')} />
                  <ArchNode node={NODES.storage} selected={selected === 'storage'} onClick={() => select('storage')} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <ArchNode node={NODES.websocket} selected={selected === 'websocket'} onClick={() => select('websocket')} />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-14 flex flex-wrap gap-4 justify-center">
              {[
                { color: 'bg-white/20', label: 'Data / REST flow' },
                { color: 'bg-pink-500/60', label: 'AI Agent layer' },
                { color: 'bg-emerald-500/60', label: 'Backend processing' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2 text-xs text-white/40">
                  <div className={`w-4 h-[2px] rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
              <div className="text-xs text-white/30 ml-4">← Click any node to explore</div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className={`transition-all duration-500 ease-out overflow-hidden ${selectedNode ? 'w-[380px] opacity-100' : 'w-0 opacity-0'}`}>
          {selectedNode && (
            <div className="w-[380px] h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <DetailPanel node={selectedNode} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      </div>

      {/* Hint when nothing selected */}
      {!selected && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/8 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 text-white/50 text-xs font-semibold animate-[slide-up-fade_0.5s_0.5s_both]">
          <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
          Select any node in the diagram to inspect it
        </div>
      )}
    </div>
  );
}
