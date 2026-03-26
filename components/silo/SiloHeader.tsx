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

const TABS = ['Feed', 'Vault', 'Calendar', 'Members'];

export default function SiloHeader({ silo, members, activeTab, onTabChange, onInviteClick }: SiloHeaderProps) {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex flex-col gap-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Silo Icon */}
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white">
            <span className="text-2xl font-extrabold text-[#0434c6]">
              {silo?.name?.charAt(0) || 'F'}
            </span>
          </div>

          {/* Name + member count */}
          <div>
            <h1
              className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              {silo?.name || 'Family Vault'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <AvatarStack members={members.slice(0, 3)} />
              <p className="text-[#464555] font-bold text-sm" style={{ fontFamily: '"Manrope", sans-serif' }}>
                {members.length} {members.length === 1 ? 'Member' : 'Members'}
                {/* TODO: replace hardcoded storage once backend exposes it */}
                {' '}• 1.2 GB used
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onInviteClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-sm text-[#464555] font-bold text-sm hover:text-[#0434c6] transition-colors"
          >
            <UserPlus size={18} /> Invite
          </button>
          <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#464555] hover:text-[#0434c6] transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#f2f4f6]/50 p-1.5 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab
                ? 'bg-white text-[#0434c6] shadow-sm'
                : 'text-[#777587] hover:text-[#464555] hover:bg-white/40'
            }`}
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}