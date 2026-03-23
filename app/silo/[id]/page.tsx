'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar'; 
import Sidebar from '@/components/Sidebar';
import { MoreHorizontal, Filter, Plus, Send, CheckCheck, UserPlus, Loader2, MessageSquare, Cloud, X } from 'lucide-react';
import InviteMemberModal from '@/components/InviteMemberModal';
import api from '@/lib/api';
import SiloChatPanel from '@/components/SiloChatPanel';

export default function SiloDashboard() {
  const [activeTab, setActiveTab] = useState('Vault');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const params = useParams();
  const siloId = params.id as string;

  const [silo, setSilo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Fetch Silo data on load
  useEffect(() => {if (!siloId) return;
    const fetchSiloData = async () => {
      try {
        const response = await api.get(`/silos/${siloId}`);
        setSilo(response.data.silo);
        setMembers(response.data.members);
      } catch (error: any) {
        // Log the actual error response from the backend so we can see it
        console.error("Failed to load silo data", error.response?.data || error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiloData();
  }, [siloId]);

  // Helper to render the Avatar Stack
  const renderAvatarStack = (size = "w-10 h-10", fontSize = "text-xs") => {
    const displayMembers = members.slice(0, 3);
    const extraCount = members.length - 3;

    return (
      <div className="flex items-center -space-x-3">
        {displayMembers.map((member, i) => (
          <div 
            key={member.id} 
            className={`${size} rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center overflow-hidden shadow-sm`}
            style={{ zIndex: 10 - i }}
          >
            {member.avatar ? (
              <img src={member.avatar} className="w-full h-full object-cover" alt={member.username} />
            ) : (
              <span className={`text-[#0434c6] font-extrabold uppercase ${fontSize}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {member.username.charAt(0)}
              </span>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className={`${size} rounded-full border-2 border-white bg-[#e0e3e5] flex items-center justify-center ${fontSize} font-bold text-[#464555] z-0`}>
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0434c6]" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] min-h-screen font-sans text-[#191c1e]">
      <TopNavbar />

      <main className="pt-28 px-8 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-5rem)] relative">
        
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <Sidebar />
        </div>

          {/* CENTER COLUMN: Silo Header & Content Area */}
        <section 
          className={`flex flex-col gap-6 overflow-y-auto pb-24 no-scrollbar transition-all duration-500 ease-in-out ${
            isChatOpen ? 'col-span-1 md:col-span-6 lg:col-span-7' : 'col-span-1 md:col-span-9 lg:col-span-10'
          }`}
        >
          {/* Silo Header Card - Glassmorphic */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white">
                  <span className="text-2xl font-extrabold text-[#0434c6]">{silo?.name?.charAt(0) || 'F'}</span>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {silo?.name || 'Family Vault'}
                  </h1>
                  <div className="flex items-center gap-3 mt-1.5">
                    {renderAvatarStack("w-6 h-6", "text-[9px]")}
                    <p className="text-[#464555] font-bold text-sm" style={{ fontFamily: '"Manrope", sans-serif' }}>
                      {members.length} {members.length === 1 ? 'Member' : 'Members'} • 1.2 GB used
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
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
              {['Feed', 'Vault', 'Calendar', 'Members'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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

          {/* ========================================= */}
          {/* TAB CONTENT RENDERING                     */}
          {/* ========================================= */}

          {/* 1. VAULT TAB */}
          {activeTab === 'Vault' && (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  August 2024
                </h2>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-sm text-[#464555] font-bold text-sm hover:text-[#0434c6] transition-colors">
                    <Filter size={16} /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all">
                    <Plus size={18} /> Add Photos
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
                <div className="col-span-12 row-span-1 rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNanrQO4kqMJulZAREkmen_HvwX_9O2AobIhaIDDYOQe51Gp5dkvE1OOde6528_7uzuLCcvZjUvJe5hBK96LBQwpDIYvC0Mat5HQhrI1odW0dbu5V6Z9kqFQMKiiix7bi-nqxQ7IVIOczwtbokvQJEuszNbF5IHcbBO3MR6Ba4xFO28o0gZ3WI93k02xBM-okqS21w2854zHIOMQbDHoCZ11JrFD3rXpKF4mJnvmcSNyNAComiqPD2ckAJmGzXeR9l5Pi-ThIQFkHM" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Camping" />
                </div>
                <div className="col-span-5 row-span-1 rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer bg-[#f2f4f6]">
                  <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Coffee" />
                </div>
                <div className="col-span-7 row-span-2 rounded-[2.5rem] overflow-hidden shadow-sm relative group cursor-pointer bg-[#e0e3e5]">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Portrait" />
                </div>
                <div className="col-span-5 row-span-1 rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer bg-[#f2f4f6]">
                  <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Dog" />
                </div>
              </div>
            </div>
          )}

          {/* 2. MEMBERS TAB */}
          {activeTab === 'Members' && (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Silo Members
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border border-white">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#0434c6] font-extrabold text-lg">{member.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      
                      {/* Name & Role */}
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#191c1e] text-base" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                          {member.username}
                        </span>
                        <span className="text-xs font-bold text-[#777587] uppercase tracking-wider mt-0.5" style={{ fontFamily: '"Manrope", sans-serif' }}>
                          {member.role === 'admin' ? 'Admin / Creator' : 'Member'}
                        </span>
                      </div>
                    </div>

                    {/* Actions (Mocked for now) */}
                    <button className="w-10 h-10 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#777587] transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. FEED / CALENDAR PLACEHOLDERS */}
          {(activeTab === 'Feed' || activeTab === 'Calendar') && (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-12 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-[#e2dfff] rounded-full flex items-center justify-center text-[#352ac0]">
                {/* Just a placeholder icon */}
                <span className="material-symbols-outlined text-3xl">{activeTab === 'Feed' ? 'dynamic_feed' : 'calendar_month'}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {activeTab} coming soon
              </h2>
              <p className="text-[#464555] font-medium max-w-sm">
                We're currently building out the {activeTab.toLowerCase()} feature. Check back later!
              </p>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: The Collapsible Chat Drawer */}
        {isChatOpen && (
          <SiloChatPanel siloId={siloId} siloName={silo?.name || 'Silo Chat'} members={members} />
        )}
        <div className="fixed bottom-10 right-10 flex gap-4 z-50">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-[#0434c6] rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(4,52,198,0.3)] hover:scale-105 hover:bg-[#3050de] active:scale-95 transition-all"
          >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="mt-0.5" />}
          </button>
        </div>

      </main>

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        siloId={siloId} 
      />

    </div>
  );
}