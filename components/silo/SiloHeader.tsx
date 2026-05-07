'use client';

import { UserPlus, MoreHorizontal } from 'lucide-react';
import AvatarStack from '@/components/chat/AvatarStack';

interface SiloHeaderProps {
  silo: any;
  members: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onInviteClick: () => void;
}

const TABS = ['Feed', 'Vault', 'Members'];

export default function SiloHeader({ silo, members, activeTab, onTabChange, onInviteClick }: SiloHeaderProps) {
  return (
    <div className="
      bg-[var(--bg-card)]/70 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8
      border border-[var(--border-subtle)] dark:border-[var(--border-default)]
      shadow-[var(--shadow-card)] dark:shadow-none
      flex flex-col gap-6
    ">

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 md:gap-5">
          {/* Silo Icon */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white dark:border-white/10 flex-shrink-0">
            <span className="text-xl md:text-2xl font-extrabold text-[var(--brand)]">
              {silo?.name?.charAt(0) || 'F'}
            </span>
          </div>

          {/* Name + member count */}
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {silo?.name || 'Family Vault'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <AvatarStack members={members.slice(0, 3)} />
              <p className="text-[var(--text-secondary)] font-bold text-sm">
                {members.length} {members.length === 1 ? 'Member' : 'Members'}
                {' '}• 1.2 GB used
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onInviteClick}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] font-bold text-sm hover:text-[var(--brand)] hover:border-[var(--brand)] transition-all shadow-sm"
          >
            <UserPlus size={18} /> Invite
          </button>
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors shadow-sm">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-[var(--bg-input)] p-1.5 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-5 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab
                ? 'bg-[var(--bg-card)] text-[var(--brand)] shadow-sm border border-[var(--border-subtle)] dark:border-[var(--border-default)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}