'use client';

import { Home, Lock, Users, Plus, HelpCircle, Shield, Loader2, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 
        Sidebar Content
        - `fixed` on mobile, but behaves like sticky/fixed on desktop
        - transitions sliding in/out on mobile
      */}
      <aside className={`
        fixed md:flex flex-col
        top-0 md:top-28 bottom-0 left-0 md:left-auto
        w-[280px] md:w-[inherit] md:max-w-[220px]
        bg-white md:bg-transparent
        shadow-[20px_0_40px_rgba(4,52,198,0.1)] md:shadow-none
        pb-8 pt-6 md:pt-0 pl-6 md:pl-0 pr-6 md:pr-4
        z-50 md:z-0
        transition-transform duration-300 ease-in-out
        no-scrollbar
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Mobile Header in Sidebar */}
        <div className="flex md:hidden items-center justify-between mb-6 border-b border-[#f2f4f6] pb-4">
          <span className="text-xl font-extrabold text-[#0434c6]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>FamSilo</span>
          <button onClick={() => setIsMobileOpen(false)} className="text-[#464555] p-2 hover:bg-[#f2f4f6] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

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