'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Network, Image as ImageIcon, MessageCircle } from 'lucide-react';

interface ProfileStatsBarProps {
  stats: { silos_joined: number; known_members: number; media_posts: number };
  silosList: any[];
  membersList: any[];
  onStartDM: (peerId: string, peerName: string) => void;
  onViewProfile: (id: string) => void;
  recentMemories?: any[];
}

export default function ProfileStatsBar({ stats, silosList, membersList, recentMemories = [], onStartDM, onViewProfile }: ProfileStatsBarProps) {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activePopover, setActivePopover] = useState<'members' | 'silos' | 'gallery' | null>(null);

  const toggle = (id: 'members' | 'silos' | 'gallery') =>
    setActivePopover(prev => (prev === id ? null : id));

  return (
    <div className="flex items-center gap-3 pb-2 flex-wrap md:flex-nowrap" ref={popoverRef}>

      {/* Members */}
      <div className="relative">
        <button onClick={() => toggle('members')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0434c6] flex items-center justify-center"><Users size={16} /></div>
          <div className="flex flex-col text-center">
            <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Members</span>
            <span className="text-sm font-extrabold text-[#191c1e]">{stats.known_members}</span>
          </div>
        </button>
        {activePopover === 'members' && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto p-2 no-scrollbar">
              <div className="px-3 py-2 border-b border-[#f2f4f6] mb-2">
                <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Members</h4>
              </div>
              {membersList.length === 0 ? (
                <p className="text-center text-xs text-[#b5b3c3] py-4 font-bold">No connected members yet.</p>
              ) : (
                membersList.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { onViewProfile(member.id); setActivePopover(null); }}
                        className="w-10 h-10 rounded-full bg-[#e0e3e5] text-[#0434c6] font-extrabold flex items-center justify-center text-sm shadow-sm border-2 border-white overflow-hidden hover:ring-2 hover:ring-[#0434c6] transition-all"
                      >
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          : member.name.charAt(0).toUpperCase()}
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-[#191c1e]">{member.name}</span>
                        <span className="text-[10px] font-bold text-[#777587]">Shared Silos: {member.shared_silos}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onStartDM(member.id, member.name)}
                      className="w-8 h-8 rounded-full bg-white text-[#b5b3c3] hover:bg-[#0434c6] hover:text-white flex items-center justify-center transition-all shadow-sm"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Silos */}
      <div className="relative">
        <button onClick={() => toggle('silos')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Network size={16} /></div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Connected</span>
            <span className="text-sm font-extrabold text-[#191c1e]">{stats.silos_joined} Silos Joined</span>
          </div>
        </button>
        {activePopover === 'silos' && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto p-2 no-scrollbar">
              <div className="px-3 py-2 border-b border-[#f2f4f6] mb-2">
                <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Connected Silos</h4>
              </div>
              {silosList.length === 0 ? (
                <p className="text-center text-xs text-[#b5b3c3] py-4 font-bold">No Silos joined yet.</p>
              ) : (
                silosList.map(silo => (
                  <div key={silo.id} onClick={() => router.push(`/silo/${silo.id}`)} className="flex items-center gap-3 p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 text-[#0434c6] font-extrabold flex items-center justify-center text-sm shadow-sm border border-white">
                      {silo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-[#191c1e] truncate max-w-[160px]">{silo.name}</span>
                      <span className="text-[10px] font-bold text-[#777587]">{silo.members} Members Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="relative">
        <button onClick={() => toggle('gallery')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><ImageIcon size={16} /></div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Gallery</span>
            <span className="text-sm font-extrabold text-[#191c1e]">{stats.media_posts} Posts</span>
          </div>
        </button>
        {activePopover === 'gallery' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto p-3 no-scrollbar">
              <div className="px-1 py-1 border-b border-[#f2f4f6] mb-3">
                <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Recent Uploads</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {recentMemories.length === 0 ? (
                  <p className="col-span-3 text-center text-xs text-[#b5b3c3] py-4 font-bold">No posts uploaded yet.</p>
                ) : (
                  recentMemories.map((mem) => (
                    <div key={mem.id} className="aspect-square rounded-xl overflow-hidden shadow-sm bg-black hover:scale-105 transition-transform cursor-pointer relative">
                      {mem.url ? (
                        mem.type === 'video' ? (
                          <video src={mem.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                        ) : (
                          <img src={mem.url} alt={mem.caption || "Memory"} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0434c6] to-[#3050de]" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}