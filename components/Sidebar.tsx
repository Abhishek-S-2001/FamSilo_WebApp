'use client';

import { Home, Lock, Users, Plus, HelpCircle, Shield, Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import CreateGroupModal from './CreateGroupModal';
import api from '@/lib/axios';

const fetcher = (url: string) => api.get(url).then(r => r.data);

const linkBase = 'flex items-center gap-3 rounded-2xl py-3.5 px-4 transition-all';
const activeStyle = 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.03)] text-[#0434c6]';
const inactiveStyle = 'text-[#464555] hover:bg-white/60';

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: silos = [], isLoading, mutate } = useSWR('/silos', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // cache 60s — silos don't change often
  });

  const handleLogout = () => {
    localStorage.removeItem('family_app_token');
    localStorage.removeItem('user_id'); // ← was missing before
    router.push('/login');
  };

  return (
    <>
      {/* 
        Key layout fix: 
        - `fixed` positions it relative to viewport, not page content
        - `top-28` clears the TopNavbar
        - `bottom-0` stretches to screen bottom
        - footer always visible at bottom regardless of silo count
      */}
      <aside className="hidden md:flex flex-col fixed top-28 bottom-0 w-[inherit] max-w-[220px] pb-8 pr-4 no-scrollbar">

        {/* Scrollable content area — grows and scrolls independently */}
        <div className="flex flex-col gap-8 overflow-y-auto flex-1 no-scrollbar">

          {/* Navigation */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-bold text-[#777587] uppercase tracking-widest pl-2" style={{ fontFamily: '"Manrope", sans-serif' }}>
              Navigation
            </h2>
            <Link href="/" className={`${linkBase} ${pathname === '/' ? activeStyle : inactiveStyle}`}>
              <Home size={20} strokeWidth={2.5} />
              <span className="font-extrabold text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Home</span>
            </Link>
          </div>

          {/* Private Space */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold text-[#777587] uppercase tracking-widest pl-2 mb-1" style={{ fontFamily: '"Manrope", sans-serif' }}>
              Private Space
            </h3>
            <Link href="/vault" className={`${linkBase} ${pathname === '/vault' ? activeStyle : inactiveStyle}`}>
              <Lock size={18} className={pathname === '/vault' ? 'text-[#0434c6]' : 'text-[#777587]'} />
              <span className="font-bold text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>My Personal Vault</span>
            </Link>
          </div>

          {/* Your Silos */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold text-[#777587] uppercase tracking-widest pl-2 mb-1" style={{ fontFamily: '"Manrope", sans-serif' }}>
              Your Silos
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-[#c7c4d8]" size={20} />
              </div>
            ) : silos.length === 0 ? (
              <p className="text-xs text-[#777587] font-medium pl-2 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                You haven't joined any silos yet.
              </p>
            ) : (
              silos.map((silo: any) => {
                const isActive = pathname === `/silo/${silo.id}`;
                return (
                  <Link
                    key={silo.id}
                    href={`/silo/${silo.id}`}
                    className={`flex items-center justify-between py-2.5 px-4 rounded-2xl transition-all w-full group ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Users size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#0434c6]' : 'text-[#777587] group-hover:text-[#0434c6]'}`} />
                      <span className="font-bold text-sm truncate" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        {silo.name}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 border-2 border-dashed border-[#c7c4d8] text-[#777587] py-3.5 px-4 rounded-2xl hover:border-[#3050de] hover:text-[#3050de] hover:bg-white/40 transition-all flex items-center justify-center gap-2 font-bold text-sm group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              Create Silo
            </button>
          </div>
        </div>

        {/* Footer — always pinned to bottom, never scrolls away */}
        <div className="pt-6 border-t border-[#f2f4f6] flex flex-col gap-3 pl-2 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#777587] text-xs font-bold hover:text-[#93000a] transition-colors w-fit"
            style={{ fontFamily: '"Manrope", sans-serif' }}
          >
            <LogOut size={14} /> Log out
          </button>
          <button className="flex items-center gap-2 text-[#777587] text-xs font-bold hover:text-[#0434c6] transition-colors" style={{ fontFamily: '"Manrope", sans-serif' }}>
            <HelpCircle size={14} /> Help Center
          </button>
          <button className="flex items-center gap-2 text-[#777587] text-xs font-bold hover:text-[#0434c6] transition-colors" style={{ fontFamily: '"Manrope", sans-serif' }}>
            <Shield size={14} /> Privacy Policy
          </button>
        </div>
      </aside>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()} // SWR revalidates instead of manual refetch
      />
    </>
  );
}