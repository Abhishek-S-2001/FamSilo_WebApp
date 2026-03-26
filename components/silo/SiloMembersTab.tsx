'use client';

import { MoreHorizontal } from 'lucide-react';

interface SiloMembersTabProps {
  members: any[];
}

export default function SiloMembersTab({ members }: SiloMembersTabProps) {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2
        className="text-xl font-extrabold text-[#191c1e] mb-4"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        Silo Members
      </h2>

      <div className="flex flex-col gap-4">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border border-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center overflow-hidden">
                {member.avatar
                  ? <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-[#0434c6] font-extrabold text-lg">{member.username.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="flex flex-col">
                <span
                  className="font-extrabold text-[#191c1e] text-base"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                >
                  {member.username}
                </span>
                <span
                  className="text-xs font-bold text-[#777587] uppercase tracking-wider mt-0.5"
                  style={{ fontFamily: '"Manrope", sans-serif' }}
                >
                  {member.role === 'admin' ? 'Admin / Creator' : 'Member'}
                </span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#777587] transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}