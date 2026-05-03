'use client';

import { useState } from 'react';

// ────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'overview',      label: '📐 System Overview' },
  { id: 'auth',          label: '🔐 Auth Flow' },
  { id: 'pages',         label: '📁 Pages' },
  { id: 'components',    label: '🧩 Components' },
  { id: 'api',           label: '⚙️ API Reference' },
  { id: 'database',      label: '🗄️ Database' },
  { id: 'lib',           label: '📦 Shared Lib' },
  { id: 'flows',         label: '🔁 Feature Flows' },
  { id: 'moderation',    label: '🛡️ AI Moderation' },
  { id: 'issues',        label: '⚡ Known Issues' },
  { id: 'index',         label: '📂 File Index' },
];

// ────────────────────────────────────────────────
// SMALL UI PRIMITIVES
// ────────────────────────────────────────────────

function SectionTitle({ id, emoji, title }: { id: string; emoji: string; title: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-24">
      <span className="text-3xl">{emoji}</span>
      <h2 className="text-2xl font-extrabold text-[#191c1e] tracking-tight">{title}</h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-extrabold text-[#0434c6] uppercase tracking-widest mb-3 mt-8">{children}</h3>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-6 mb-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    gray:   'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}

function Method({ type }: { type: string }) {
  const c: Record<string, string> = {
    GET:     'bg-blue-100 text-blue-800',
    POST:    'bg-green-100 text-green-800',
    PUT:     'bg-orange-100 text-orange-800',
    PATCH:   'bg-purple-100 text-purple-800',
    DELETE:  'bg-red-100 text-red-800',
    WS:      'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${c[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e8ecf1]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f7f9fb] border-b border-[#e8ecf1]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-extrabold text-[#464555] text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#f2f4f6] hover:bg-[#fafbfc] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#464555] font-medium align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return <code className="font-mono text-[#0434c6] bg-blue-50 px-1.5 py-0.5 rounded text-xs">{children}</code>;
}

function Alert({ type, children }: { type: 'warning' | 'tip' | 'note'; children: React.ReactNode }) {
  const styles = {
    warning: { bg: 'bg-red-50 border-red-300',   icon: '⚠️', label: 'Warning', text: 'text-red-800' },
    tip:     { bg: 'bg-green-50 border-green-300', icon: '💡', label: 'Tip',     text: 'text-green-800' },
    note:    { bg: 'bg-blue-50 border-blue-300',   icon: 'ℹ️', label: 'Note',    text: 'text-blue-800' },
  };
  const s = styles[type];
  return (
    <div className={`border-l-4 rounded-r-xl p-4 mb-4 ${s.bg}`}>
      <div className={`font-extrabold text-sm mb-1 ${s.text}`}>{s.icon} {s.label}</div>
      <div className={`text-sm ${s.text}`}>{children}</div>
    </div>
  );
}

function FlowStep({ step, title, description, color = 'blue' }: { step: number; title: string; description: string; color?: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-600',
    green:  'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-500',
  };
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-8 h-8 rounded-full ${colors[color] || colors.blue} text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0 mt-0.5`}>{step}</div>
      <div>
        <div className="font-extrabold text-[#191c1e] text-sm">{title}</div>
        <div className="text-[#777587] text-sm mt-0.5">{description}</div>
      </div>
    </div>
  );
}

function FlowConnector() {
  return <div className="ml-4 pl-0 w-px h-5 bg-[#e0e3e5] ml-[15px]" />;
}

// ────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────

export default function DocsPage() {
  const [activeNav, setActiveNav] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans" style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}>
      {/* ── TOP HEADER ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white px-8 py-12 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏠</span>
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">Internal · Developer Reference</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">FamSilo Architecture Docs</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Single-source developer reference — pages, components, API endpoints, database tables, and feature flows. Open this before touching any feature.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge color="blue">Next.js 16</Badge>
            <Badge color="green">FastAPI</Badge>
            <Badge color="purple">Supabase</Badge>
            <Badge color="orange">WebSocket</Badge>
            <Badge color="gray">Tailwind CSS</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-8 px-8 py-10">
        {/* ── SIDEBAR NAV ──────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-1 w-56 flex-shrink-0 sticky top-8 self-start">
          <div className="text-xs font-extrabold text-[#b5b3c3] uppercase tracking-widest mb-3 ml-3">Sections</div>
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`text-left text-sm px-3 py-2.5 rounded-xl font-semibold transition-all ${
                activeNav === s.id
                  ? 'bg-[#0434c6] text-white shadow-md'
                  : 'text-[#464555] hover:bg-white hover:shadow-sm'
              }`}
            >
              {s.label}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* ═══════ 1. SYSTEM OVERVIEW ═══════ */}
          <section>
            <SectionTitle id="overview" emoji="📐" title="System Overview" />

            <Card>
              <SubTitle>Stack at a Glance</SubTitle>
              <Table
                headers={['Layer', 'Technology', 'Entry Point']}
                rows={[
                  ['Frontend',        'Next.js 16 (App Router) + Tailwind CSS',              <Code>app/layout.tsx</Code>],
                  ['API Client',      'Axios with JWT interceptor',                           <Code>lib/axios.ts</Code>],
                  ['Backend',         'FastAPI + Python + Uvicorn',                          <Code>main.py</Code>],
                  ['Database',        'Supabase (PostgreSQL)',                                'Supabase Dashboard'],
                  ['Authentication',  'Supabase Auth (JWT Bearer)',                           'localStorage → family_app_token'],
                  ['File Storage',    'Supabase Storage',                                    'bucket: profiles'],
                  ['Real-time Chat',  'WebSocket via FastAPI ConnectionManager',              <Code>app/routers/chat.py</Code>],
                ]}
              />
            </Card>

            <Card>
              <SubTitle>Architecture Diagram</SubTitle>
              <div className="overflow-x-auto">
                <div className="flex flex-col gap-4 items-center py-4 min-w-[400px]">
                  <div className="bg-[#0434c6] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg w-64 text-center">
                    🌐 Browser / Next.js 16
                    <div className="text-blue-200 text-xs font-normal mt-1">App Router · Tailwind CSS</div>
                  </div>
                  <div className="flex gap-6 items-start relative">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-[#777587] font-bold">REST (Bearer JWT)</div>
                      <div className="w-px h-8 bg-[#0434c6]" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-[#777587] font-bold">WebSocket (token in URL)</div>
                      <div className="w-px h-8 bg-orange-400" />
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg text-center w-52">
                      ⚙️ FastAPI Backend
                      <div className="text-green-200 text-xs font-normal mt-1">Python · Uvicorn</div>
                    </div>
                    <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg text-center w-52">
                      ⚡ WS ConnectionManager
                      <div className="text-orange-200 text-xs font-normal mt-1">room_id → list of sockets</div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-purple-500" />
                  <div className="bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg w-64 text-center">
                    🗄️ Supabase
                    <div className="text-purple-200 text-xs font-normal mt-1">PostgreSQL · Auth · Storage</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SubTitle>CORS Allowed Origins</SubTitle>
              <div className="space-y-1">
                {['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.40:3000 (LAN)', 'https://famsilo-webapp.vercel.app'].map((o) => (
                  <div key={o} className="font-mono text-sm text-[#464555] bg-[#f2f4f6] px-3 py-1.5 rounded-lg">{o}</div>
                ))}
              </div>
              <Alert type="warning">CORS is configured with <code>allow_origins=["*"]</code> — lock this down to specific domains before production.</Alert>
            </Card>
          </section>

          {/* ═══════ 2. AUTH FLOW ═══════ */}
          <section>
            <SectionTitle id="auth" emoji="🔐" title="Auth Flow" />
            <Card>
              <SubTitle>Login (Email OR Username)</SubTitle>
              <div className="space-y-3">
                <FlowStep step={1} color="blue"    title="User submits login form" description="Can enter email (e.g. john@email.com) OR username (e.g. john_doe) — no @ detection." />
                <FlowConnector />
                <FlowStep step={2} color="blue"    title="Backend translates username → email" description="POST /auth/login looks up the email in profiles table if no '@' in identifier." />
                <FlowConnector />
                <FlowStep step={3} color="green"   title="Supabase Auth authenticates" description="sign_in_with_password() validates credentials and returns JWT access_token." />
                <FlowConnector />
                <FlowStep step={4} color="purple"  title="Token stored in localStorage" description="Frontend saves token as family_app_token and user_id separately." />
                <FlowConnector />
                <FlowStep step={5} color="orange"  title="Every request uses Bearer token" description="lib/axios.ts intercepts all requests and adds Authorization: Bearer <token>." />
              </div>
              <Alert type="note">On 401 or 422 responses, the axios interceptor auto-removes the token and redirects to <code>/login</code>.</Alert>
            </Card>

            <Card>
              <SubTitle>Signup Rules</SubTitle>
              <Table
                headers={['Rule', 'Detail']}
                rows={[
                  ['Username format',   'Lowercase, 3-20 chars, only letters/numbers/underscore (regex enforced)'],
                  ['Username uniqueness', 'Checked against profiles table before Supabase auth creation'],
                  ['Email verification', 'Supabase may require email verification — session could be null on signup'],
                  ['Profile creation',  'On signup, a row is immediately inserted into profiles with id, username, email'],
                ]}
              />
            </Card>
          </section>

          {/* ═══════ 3. PAGES ═══════ */}
          <section>
            <SectionTitle id="pages" emoji="📁" title="Pages (App Router)" />
            <Card>
              <Table
                headers={['Route', 'File', 'Key Components', 'API Calls']}
                rows={[
                  [<Code>/</Code>,           <Code>app/page.tsx</Code>,               'TopNavbar, Sidebar, GroupProfileFeed, FeedList, GlobalChatWrapper', 'GET /silos/, GET /posts/group/{id}'],
                  [<Code>/login</Code>,       <Code>app/login/page.tsx</Code>,         '—',                                                  'POST /auth/login, POST /auth/signup'],
                  [<Code>/profile</Code>,     <Code>app/profile/page.tsx</Code>,       'ProfileHero, ProfileStatsBar, ProfileAbout, EditProfileModal',    'GET /users/me, PUT /users/me'],
                  [<Code>/silo/[id]</Code>,   <Code>app/silo/[id]/page.tsx</Code>,    'SiloHeader, SiloVaultTab, SiloMembersTab, InviteMemberModal',    'GET /silos/{id} (useSilo hook)'],
                  [<Code>/join</Code>,        <Code>app/join/page.tsx</Code>,          '—',                                                  'POST /silos/join (email token redemption)'],
                  [<Code>/docs</Code>,        <Code>app/docs/page.tsx</Code>,          '— (this page)',                                       '—'],
                ]}
              />
            </Card>
          </section>

          {/* ═══════ 4. COMPONENTS ═══════ */}
          <section>
            <SectionTitle id="components" emoji="🧩" title="Components" />

            <SubTitle>Global Layout</SubTitle>
            <Card>
              <Table
                headers={['Component', 'File', 'Responsibility']}
                rows={[
                  ['Providers',         <Code>components/Providers.tsx</Code>,              'Wraps app in ChatContext provider'],
                  ['TopNavbar',         <Code>components/TopNavbar.tsx</Code>,              'Logo, NotificationBell, GlobalChatButton, avatar → /profile'],
                  ['Sidebar',           <Code>components/Sidebar.tsx</Code>,                'Silo list, CreateGroupModal trigger'],
                  ['NotificationBell',  <Code>components/NotificationBell.tsx</Code>,       'Bell icon, notification dropdown, Accept/Decline for silo invites'],
                ]}
              />
            </Card>

            <SubTitle>Home Feed</SubTitle>
            <Card>
              <Table
                headers={['Component', 'File', 'Responsibility']}
                rows={[
                  ['GroupProfileFeed',  <Code>components/GroupProfileFeed.tsx</Code>,  'Tab switcher: Silos vs Members'],
                  ['FeedList',          <Code>components/FeedList.tsx</Code>,          'Renders FeedCards for a silo'],
                  ['FeedCard',          <Code>components/FeedCard.tsx</Code>,          'Single post: image, caption, author'],
                  ['SecureImage',       <Code>components/SecureImage.tsx</Code>,       'Fetches private Storage images with auth header'],
                  ['UploadModal',       <Code>components/UploadModal.tsx</Code>,       'Multi-step photo upload → POST /posts/'],
                  ['CreateGroupModal',  <Code>components/CreateGroupModal.tsx</Code>,  'Create new Silo → POST /silos/'],
                ]}
              />
            </Card>

            <SubTitle>Silo Dashboard</SubTitle>
            <Card>
              <Table
                headers={['Component', 'File', 'Responsibility']}
                rows={[
                  ['SiloHeader',         <Code>components/silo/SiloHeader.tsx</Code>,         'Name, description, tabs (Vault/Members/Feed/Calendar), Invite button'],
                  ['SiloVaultTab',       <Code>components/silo/SiloVaultTab.tsx</Code>,       'Photo grid, opens UploadModal'],
                  ['SiloMembersTab',     <Code>components/silo/SiloMembersTab.tsx</Code>,     'Member list, click opens ViewProfileModal'],
                  ['SiloPlaceholderTab', <Code>components/silo/SiloPlaceholderTab.tsx</Code>, 'Coming Soon placeholder for Feed and Calendar tabs'],
                  ['InviteMemberModal',  <Code>components/InviteMemberModal.tsx</Code>,       'Real-time user search (300ms debounce), POST /silos/{id}/invite, email fallback'],
                  ['ViewProfileModal',   <Code>components/ViewProfileModal.tsx</Code>,        'Read-only public profile card → GET /users/{userId}'],
                ]}
              />
            </Card>

            <SubTitle>Profile Page</SubTitle>
            <Card>
              <Table
                headers={['Component', 'File', 'Responsibility']}
                rows={[
                  ['ProfileHero',        <Code>components/profile/ProfileHero.tsx</Code>,        'Cover photo, avatar, display name'],
                  ['ProfileStatsBar',    <Code>components/profile/ProfileStatsBar.tsx</Code>,    'Stats: Silos joined, members known, posts. Shows Silos + Network lists'],
                  ['ProfileAbout',       <Code>components/profile/ProfileAbout.tsx</Code>,       'Bio, location, DOB, hobbies'],
                  ['ProfileMemories',    <Code>components/profile/ProfileMemories.tsx</Code>,    'Photo feed for the user'],
                  ['EditProfileModal',   <Code>components/profile/EditProfileModal.tsx</Code>,   'Full edit form + base64 image upload, 7-day username rule'],
                  ['ImageCropModal',     <Code>components/profile/ImageCropModal.tsx</Code>,     'Canvas crop tool before avatar/cover upload'],
                ]}
              />
            </Card>

            <SubTitle>Chat System</SubTitle>
            <Card>
              <Table
                headers={['Component', 'File', 'Responsibility']}
                rows={[
                  ['GlobalChatWrapper',  <Code>components/chat/GlobalChatWrapper.tsx</Code>,  'Floating panel container, z-index 50'],
                  ['GlobalChatButton',   <Code>components/chat/GlobalChatButton.tsx</Code>,   'Chat bubble icon in TopNavbar'],
                  ['ChatInbox',          <Code>components/chat/ChatInbox.tsx</Code>,          'SWR poll /chat/inbox every 15s, real-time search /chat/search'],
                  ['ChatItem',           <Code>components/chat/ChatItem.tsx</Code>,           'Single inbox row (DM circle / Silo square avatar)'],
                  ['ChatWindow',         <Code>components/chat/ChatWindow.tsx</Code>,         'WS connect, load history, send/receive messages, mark read'],
                  ['ChatMessage',        <Code>components/chat/ChatMessage.tsx</Code>,        'Single message bubble'],
                  ['SiloChatPanel',      <Code>components/chat/SiloChatPanel.tsx</Code>,      'Inline Silo chat tab inside silo dashboard'],
                  ['AvatarStack',        <Code>components/chat/AvatarStack.tsx</Code>,        'Stacked avatars (used in group room previews)'],
                ]}
              />
              <div className="mt-4 p-4 bg-[#f7f9fb] rounded-xl">
                <div className="font-extrabold text-sm text-[#191c1e] mb-2">Room ID Convention</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge color="blue">Silo Chat</Badge>
                    <Code>{'{silo_uuid}'}</Code>
                    <span className="text-[#777587] text-xs">— the group UUID directly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color="green">Direct Message</Badge>
                    <Code>{'dm_{sorted_id_1}_{sorted_id_2}'}</Code>
                    <span className="text-[#777587] text-xs">— IDs sorted alphabetically (deterministic)</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* ═══════ 5. API REFERENCE ═══════ */}
          <section>
            <SectionTitle id="api" emoji="⚙️" title="API Reference" />

            <SubTitle>Auth · /auth</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="POST" />, '/auth/signup', 'Register: creates Supabase auth user + inserts profiles row immediately'],
                  [<Method type="POST" />, '/auth/login',  'Login via email OR username. Returns JWT access_token + user_id'],
                ]}
              />
            </Card>

            <SubTitle>Users · /users</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="GET" />,   '/users/me',              'Full profile + stats (silos count, members count) + silos_list + members_list'],
                  [<Method type="PUT" />,   '/users/me',              'Update profile. Accepts base64 images. Enforces 7-day username change rule'],
                  [<Method type="POST" />,  '/users/me/image',        'Upload avatar or cover photo. Deletes old file from Storage first'],
                  [<Method type="GET" />,   '/users/search?q=',       'Real-time user search. Results sorted by relevance score (exact > prefix > word-start > contains)'],
                  [<Method type="GET" />,   '/users/{user_id}',       'Public profile. Respects privacy toggles (show_location, show_dob, show_hobbies)'],
                ]}
              />
            </Card>

            <SubTitle>Silos · /silos</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="POST" />, '/silos/',                     'Create silo. Auto-adds creator as admin in group_members'],
                  [<Method type="GET" />,  '/silos/',                     'List all silos current user is a member of'],
                  [<Method type="GET" />,  '/silos/{id}',                 'Full silo detail: name, description, all members with avatars/roles'],
                  [<Method type="POST" />, '/silos/{id}/invites',         'EMAIL invite: generates token, sends Gmail SMTP email with magic link'],
                  [<Method type="POST" />, '/silos/join',                 'Redeem email invite token from /join?token= page'],
                  [<Method type="POST" />, '/silos/{id}/invite',          'IN-APP invite: creates silo_invite notification for target user'],
                  [<Method type="POST" />, '/silos/{id}/accept-invite',   'Accept in-app invite: inserts group_members, marks notification read'],
                  [<Method type="POST" />, '/silos/{id}/decline-invite',  'Decline in-app invite: marks notification read/dismissed'],
                ]}
              />
              <Alert type="note">
                The email invite (<code>/invites</code>) requires <code>role = admin</code>. The in-app invite (<code>/invite</code>) currently does NOT check admin role — any member can invite.
              </Alert>
            </Card>

            <SubTitle>Posts · /posts</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="POST" />, '/posts/',                  'Create post. Verifies user is a silo member first'],
                  [<Method type="GET" />,  '/posts/group/{group_id}',  'Get silo feed, ordered newest first. Joins author profile for username + avatar'],
                ]}
              />
            </Card>

            <SubTitle>Chat · /chat</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="WS" />,   '/chat/ws/{room_id}?token=',    'Real-time WebSocket. Authenticates token, persists messages, broadcasts to room'],
                  [<Method type="GET" />,  '/chat/inbox',                   'Smart inbox: Silos + DMs, latest message preview, unread count, sorted by time'],
                  [<Method type="GET" />,  '/chat/search?q=',               'Unified search: users (DM rooms) + silos, relevance sorted'],
                  [<Method type="GET" />,  '/chat/{room_id}/messages',       'Full message history for a room. DM = starts with dm_, Silo = UUID'],
                  [<Method type="GET" />,  '/chat/dms',                     'List all users you have an active DM history with'],
                  [<Method type="POST" />, '/chat/{room_id}/read',           'Mark all unread DMs in room as read'],
                ]}
              />
            </Card>

            <SubTitle>Notifications · /notifications</SubTitle>
            <Card>
              <Table
                headers={['Method', 'Path', 'Description']}
                rows={[
                  [<Method type="GET" />,   '/notifications/',              'Fetch all notifications + unread_count for the badge'],
                  [<Method type="PATCH" />, '/notifications/read-all',      'Mark all as read'],
                  [<Method type="PATCH" />, '/notifications/{id}/read',     'Mark one notification as read'],
                ]}
              />
              <Alert type="warning">The notifications endpoint returns raw actor_id but does NOT enrich it with profile name/avatar. The UI's actor_name will be undefined until a bulk profile lookup is added in notifications.py.</Alert>
            </Card>
          </section>

          {/* ═══════ 6. DATABASE ═══════ */}
          <section>
            <SectionTitle id="database" emoji="🗄️" title="Database" />

            <Card>
              <SubTitle>Tables Overview</SubTitle>
              <Table
                headers={['Table', 'Primary Key', 'Purpose', 'Key Columns']}
                rows={[
                  ['profiles',      'uuid id',  'User accounts and public/private profile data',           'username, email, avatar_url, cover_photo_url, show_* toggles, last_username_change'],
                  ['groups',        'uuid id',  'Silos (family groups)',                                   'name, description, created_by'],
                  ['group_members', 'uuid id',  'Many-to-many: users ↔ groups + role',                    'group_id, user_id, role (admin|member)'],
                  ['posts',         'uuid id',  'Photo posts inside silos',                                'group_id, author_id, image_path, caption'],
                  ['messages',      'uuid id',  'Both Silo group chat AND direct messages in one table',   'user_id, silo_id (null for DM), receiver_id (null for Silo), content, is_read'],
                  ['notifications', 'uuid id',  'All notification types including silo invites',           'user_id, actor_id, type, silo_id, is_read'],
                  ['silo_invites',  'uuid id',  'Email invite token store',                                'silo_id, email, token, role, invited_by, status (pending|accepted)'],
                ]}
              />
            </Card>

            <SubTitle>Message Routing Logic (Unified Table)</SubTitle>
            <Card>
              <Table
                headers={['Chat Type', 'silo_id', 'receiver_id', 'Room ID Used by Frontend']}
                rows={[
                  ['Silo group chat',  'silo UUID',  'NULL',       '{silo_uuid}'],
                  ['Direct message',   'NULL',        'user UUID',  'dm_{sorted_uuid_1}_{sorted_uuid_2}'],
                ]}
              />
            </Card>

            <SubTitle>Relationships</SubTitle>
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['profiles', '→', 'group_members', 'A user can be in many silos'],
                  ['groups',   '→', 'group_members', 'A silo has many members'],
                  ['groups',   '→', 'posts',         'A silo has many posts'],
                  ['profiles', '→', 'posts',         'A user authors many posts'],
                  ['profiles', '→', 'messages',      'A user sends many messages'],
                  ['groups',   '→', 'messages',      'A silo has group messages'],
                  ['profiles', '→', 'notifications', 'A user receives many notifications'],
                  ['groups',   '→', 'silo_invites',  'A silo has pending email invites'],
                ].map(([from, arrow, to, label]) => (
                  <div key={`${from}-${to}`} className="flex items-center gap-2 bg-[#f7f9fb] rounded-xl p-3">
                    <Badge color="purple">{from as string}</Badge>
                    <span className="text-[#b5b3c3]">{arrow}</span>
                    <Badge color="blue">{to as string}</Badge>
                    <span className="text-[#777587] text-xs">{label as string}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* ═══════ 7. LIB ═══════ */}
          <section>
            <SectionTitle id="lib" emoji="📦" title="Shared Lib Layer" />
            <Card>
              <Table
                headers={['File', 'Purpose']}
                rows={[
                  [<Code>lib/axios.ts</Code>,                    'Axios instance: injects Bearer token on every request. Auto-redirects to /login on 401/422'],
                  [<Code>lib/supabase.ts</Code>,                 'Supabase browser client (for Storage public URL generation)'],
                  [<Code>lib/cropImage.ts</Code>,                'Canvas-based utility to crop images before upload (used in EditProfileModal)'],
                  [<Code>lib/keepAlive.ts</Code>,                'Background ping to prevent API cold starts (Supabase free tier hibernation)'],
                  [<Code>lib/context/ChatContext.tsx</Code>,     'Global openChatWith(roomId, name) function — open any chat room from anywhere in the app'],
                  [<Code>lib/hooks/useProfile.ts</Code>,         'SWR hook → GET /users/me'],
                  [<Code>lib/hooks/useSilo.ts</Code>,            'SWR hook → GET /silos/{id}'],
                  [<Code>lib/hooks/useUser.ts</Code>,            'Reads user_id from localStorage'],
                  [<Code>lib/hooks/useUnreadMessages.ts</Code>,  'Polls for unread DM count (used for navbar badge)'],
                ]}
              />
            </Card>
          </section>

          {/* ═══════ 8. FEATURE FLOWS ═══════ */}
          <section>
            <SectionTitle id="flows" emoji="🔁" title="Feature Flows" />

            <SubTitle>In-App Invite & Accept Flow</SubTitle>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="font-extrabold text-sm text-[#191c1e] mb-4">📤 Sending an Invite</div>
                  <div className="space-y-3">
                    <FlowStep step={1} color="blue"   title="Admin opens InviteMemberModal" description="Triggered by Invite button in SiloHeader" />
                    <FlowConnector />
                    <FlowStep step={2} color="blue"   title="Types username (real-time search)" description="useEffect debounced 300ms → GET /users/search?q=" />
                    <FlowConnector />
                    <FlowStep step={3} color="blue"   title="Clicks Invite button" description="POST /silos/{id}/invite with user_id" />
                    <FlowConnector />
                    <FlowStep step={4} color="green"  title="Backend checks + creates notification" description="Anti-spam check: no existing pending invite. Then INSERT notifications (silo_invite)" />
                    <FlowConnector />
                    <FlowStep step={5} color="green"  title='Success state: "Invite Sent! ✨"' description="Modal closes after 2 seconds" />
                  </div>
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#191c1e] mb-4">📥 Accepting an Invite</div>
                  <div className="space-y-3">
                    <FlowStep step={1} color="purple" title="Invitee opens NotificationBell" description="GET /notifications/ fetches all notifications" />
                    <FlowConnector />
                    <FlowStep step={2} color="purple" title="Sees silo_invite notification" description={'"@X invited you to join Y" with Accept/Decline buttons'} />
                    <FlowConnector />
                    <FlowStep step={3} color="purple" title="Clicks Accept" description="POST /silos/{id}/accept-invite with notification_id" />
                    <FlowConnector />
                    <FlowStep step={4} color="green"  title="Backend joins group" description="INSERT group_members + UPDATE notification is_read=true" />
                    <FlowConnector />
                    <FlowStep step={5} color="green"  title="Instant local state update" description="Notification removed from list immediately — no re-fetch needed" />
                  </div>
                </div>
              </div>
            </Card>

            <SubTitle>WebSocket Chat Flow</SubTitle>
            <Card>
              <div className="space-y-3">
                <FlowStep step={1} color="blue"   title="ChatWindow opens" description="GET /chat/{room_id}/messages loads history. Rendered as ChatMessage bubbles." />
                <FlowConnector />
                <FlowStep step={2} color="blue"   title="WebSocket connects" description="WS URL: /chat/ws/{room_id}?token={jwt}. Backend verifies token via Supabase Auth." />
                <FlowConnector />
                <FlowStep step={3} color="orange" title="User sends a message" description="Text sent via WebSocket. Backend determines room type (dm_ prefix vs silo UUID)." />
                <FlowConnector />
                <FlowStep step={4} color="green"  title="Backend persists + broadcasts" description="INSERT into messages, then broadcasts payload to ALL connections in that room_id." />
                <FlowConnector />
                <FlowStep step={5} color="green"  title="All clients receive message" description="Each ChatWindow receives broadcast and appends to local message list without re-fetch." />
              </div>
            </Card>
          </section>

          {/* ═══════ 8.5. AI MODERATION ═══════ */}
          <section>
            <SectionTitle id="moderation" emoji="🛡️" title="AI Moderation Pipeline" />

            <Card>
              <div className="text-sm text-[#464555] leading-relaxed mb-6">
                Every piece of user-generated content passes through a <strong>Zero-Trust AI Moderation Pipeline</strong> powered by Google Gemini before becoming public. This prevents PII leaks, harassment, and NSFW content.
              </div>

              <SubTitle>Moderation Workflows</SubTitle>
              <Table
                headers={['Content Type', 'Timing', 'Model', 'Action if Flagged']}
                rows={[
                  ['Text Posts & Captions', 'Synchronous',  <Code>gemini-2.5-flash</Code>, '422 Unprocessable Entity thrown instantly. Database write blocked.'],
                  ['Comments',              'Synchronous',  <Code>gemini-2.5-flash</Code>, '422 Unprocessable Entity thrown instantly. Database write blocked.'],
                  ['Images (JPEG/PNG)',     'Asynchronous', <Code>gemini-2.5-flash</Code>, 'DB status changed to quarantined. File moved to media-quarantine bucket.'],
                  ['Videos (MP4/WebM)',     'Asynchronous', <Code>gemini-2.5-flash</Code>, 'DB status changed to quarantined. File moved to media-quarantine bucket.'],
                ]}
              />

              <SubTitle>Frontend States</SubTitle>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge color="green">approved</Badge>
                  <span className="text-sm text-[#464555]">Normal state. Visible in all feeds to all silo members.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge color="orange">pending</Badge>
                  <span className="text-sm text-[#464555]">Currently being analyzed by BackgroundTasks. Visible <strong>only to the author</strong> with a yellow loading banner.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge color="red">quarantined</Badge>
                  <span className="text-sm text-[#464555]">Flagged by AI. Excluded from all feeds. Visible <strong>only to the author</strong> (and admins) with a red shield warning. File moved to private storage.</span>
                </div>
              </div>
            </Card>
          </section>

          {/* ═══════ 9. KNOWN ISSUES ═══════ */}
          <section>
            <SectionTitle id="issues" emoji="⚡" title="Known Issues & Improvements" />
            <div className="space-y-3">
              <Alert type="warning">
                <strong>Bug: Notifications missing actor name.</strong> GET /notifications/ returns actor_id but notifications.py doesn't fetch profile names. The UI tries to render <code>n.actor_name</code> which will be undefined. Fix: add a bulk profile lookup in the router before returning.
              </Alert>
              <Alert type="warning">
                <strong>Bug: mark-room-as-read is too broad.</strong> POST /chat/{'{room_id}'}/read marks ALL unread DMs where receiver = current user, regardless of room. It should filter by sender (peer_id from room_id) too.
              </Alert>
              <Alert type="warning">
                <strong>Permission gap: any member can invite.</strong> POST /silos/{'{id}'}/invite has no admin check. The email route (/invites) does check admin. Decide if non-admins should be able to invite and align both endpoints.
              </Alert>
              <Alert type="tip">
                <strong>Add auto-refresh to NotificationBell.</strong> Currently fetches only on mount. Add <code>setInterval</code> or SWR <code>refreshInterval: 30000</code> so silo invites appear in real time.
              </Alert>
              <Alert type="tip">
                <strong>Reduce chat inbox N+1.</strong> GET /chat/inbox runs a separate DB query per room for the latest message. Move to a single SQL view or Supabase RPC function for better performance at scale.
              </Alert>
              <Alert type="tip">
                <strong>Feed and Calendar tabs are not yet implemented</strong> — they render SiloPlaceholderTab. Good next features to build.
              </Alert>
            </div>
          </section>

          {/* ═══════ 10. FILE INDEX ═══════ */}
          <section>
            <SectionTitle id="index" emoji="📂" title="File Quick-Lookup Index" />
            <Card>
              <Table
                headers={['What you want to touch', 'File']}
                rows={[
                  ['Login / Signup form',            <Code>app/login/page.tsx</Code>],
                  ['Home feed page',                 <Code>app/page.tsx</Code>],
                  ['Silo dashboard',                 <Code>app/silo/[id]/page.tsx</Code>],
                  ['Email token join page',          <Code>app/join/page.tsx</Code>],
                  ['Silo invite modal',              <Code>components/InviteMemberModal.tsx</Code>],
                  ['Notification bell + actions',    <Code>components/NotificationBell.tsx</Code>],
                  ['User profile page',              <Code>app/profile/page.tsx</Code>],
                  ['Edit profile form',              <Code>components/profile/EditProfileModal.tsx</Code>],
                  ['Public profile card',            <Code>components/ViewProfileModal.tsx</Code>],
                  ['Create silo modal',              <Code>components/CreateGroupModal.tsx</Code>],
                  ['Left sidebar',                   <Code>components/Sidebar.tsx</Code>],
                  ['Top navbar',                     <Code>components/TopNavbar.tsx</Code>],
                  ['Chat inbox panel',               <Code>components/chat/ChatInbox.tsx</Code>],
                  ['Chat messages window',           <Code>components/chat/ChatWindow.tsx</Code>],
                  ['Silo inline chat',               <Code>components/chat/SiloChatPanel.tsx</Code>],
                  ['Photo upload',                   <Code>components/UploadModal.tsx</Code>],
                  ['Auth endpoints',                 <Code>Family_Group_API/app/routers/auth.py</Code>],
                  ['User endpoints',                 <Code>Family_Group_API/app/routers/users.py</Code>],
                  ['Silo + invite endpoints',        <Code>Family_Group_API/app/routers/silos.py</Code>],
                  ['Chat + WebSocket',               <Code>Family_Group_API/app/routers/chat.py</Code>],
                  ['Notifications',                  <Code>Family_Group_API/app/routers/notifications.py</Code>],
                  ['Posts / Feed',                   <Code>Family_Group_API/app/routers/posts.py</Code>],
                  ['Axios config + auth guard',      <Code>lib/axios.ts</Code>],
                  ['Global chat state',              <Code>lib/context/ChatContext.tsx</Code>],
                ]}
              />
            </Card>
          </section>

          {/* ── FOOTER ── */}
          <div className="text-center py-8 border-t border-[#e8ecf1] text-[#b5b3c3] text-sm">
            FamSilo Developer Docs · Last updated automatically · Visit <a href="/" className="text-[#0434c6] hover:underline">← Back to App</a>
          </div>

        </main>
      </div>
    </div>
  );
}
