'use client';

import { Home, Lock, Users, Plus, HelpCircle, Shield, LogOut, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import CreateGroupModal from './CreateGroupModal';
import api from '@/lib/axios';

const fetcher = (url: string) => api.get(url).then(r => r.data);

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

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  const { data: silos = [], isLoading, mutate } = useSWR('/silos', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const handleLogout = () => {
    localStorage.removeItem('family_app_token');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  const base = 'flex items-center gap-3 rounded-2xl py-3.5 px-4 transition-all duration-200';
  const active = 'bg-white dark:bg-white/10 shadow-sm dark:shadow-none text-[var(--brand)] border border-[var(--border-subtle)] dark:border-[var(--border-default)]';
  const inactive = 'text-[var(--text-secondary)] hover:bg-white/60 dark:hover:bg-white/5 hover:text-[var(--text-primary)]';

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`
        fixed md:flex flex-col top-0 md:top-28 bottom-0 left-0 md:left-auto
        w-[280px] md:w-[inherit] md:max-w-[220px]
        bg-[var(--bg-card)] md:bg-transparent
        border-r border-[var(--border-subtle)] md:border-none
        pb-8 pt-6 md:pt-0 pl-6 md:pl-0 pr-6 md:pr-4
        z-50 md:z-0 no-scrollbar
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        <div className="flex md:hidden items-center justify-between mb-6 border-b border-[var(--border-subtle)] pb-4">
          <span className="text-xl font-extrabold text-[var(--brand)]">FamSilo</span>
          <button onClick={() => setIsMobileOpen(false)}
            className="text-[var(--text-secondary)] p-2 hover:bg-[var(--brand-soft)] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-8 overflow-y-auto flex-1 no-scrollbar">
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest pl-2 mb-2">Navigation</h2>
            <Link href="/" className={`${base} ${pathname === '/' ? active : inactive}`}>
              <Home size={20} strokeWidth={2.5} />
              <span className="font-extrabold text-sm">Home</span>
            </Link>
          </div>

          {/* AI Daily Briefing shortcut */}
          <button
            onClick={() => window.dispatchEvent(new Event('open-briefing'))}
            className="flex items-center gap-3 rounded-2xl py-3 px-4 w-full text-left
              bg-gradient-to-r from-[var(--brand-soft)] to-transparent
              border border-[var(--border-subtle)] dark:border-[var(--border-default)]
              text-[var(--brand)] hover:border-[var(--brand)] transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--brand-medium)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-sm leading-tight">Today's Briefing</p>
              <p className="text-[10px] font-medium text-[var(--text-muted)] truncate">AI daily summary</p>
            </div>
          </button>

          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest pl-2 mb-1">Private Space</h3>
            <Link href="/vault" className={`${base} ${pathname === '/vault' ? active : inactive}`}>
              <Lock size={18} className={pathname === '/vault' ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'} />
              <span className="font-bold text-sm">My Personal Vault</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest pl-2 mb-1">Your Silos</h3>
            {isLoading ? (
              <div className="flex flex-col gap-2 px-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-11 w-full rounded-2xl" />)}
              </div>
            ) : silos.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] font-medium pl-2 mb-2">You haven't joined any silos yet.</p>
            ) : (
              silos.map((silo: any) => {
                const isActive = pathname === `/silo/${silo.id}`;
                return (
                  <Link key={silo.id} href={`/silo/${silo.id}`}
                    className={`${base} justify-between group ${isActive ? active : inactive}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Users size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--brand)]'}`} />
                      <span className="font-bold text-sm truncate">{silo.name}</span>
                    </div>
                  </Link>
                );
              })
            )}
            <button onClick={() => setIsModalOpen(true)}
              className="mt-2 border-2 border-dashed border-[var(--border-strong)] text-[var(--text-muted)] py-3.5 px-4 rounded-2xl hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-all flex items-center justify-center gap-2 font-bold text-sm group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              Create Silo
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-3 pl-2 flex-shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-bold hover:text-red-500 dark:hover:text-red-400 transition-colors w-fit">
            <LogOut size={14} /> Log out
          </button>
          <button className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-bold hover:text-[var(--brand)] transition-colors">
            <HelpCircle size={14} /> Help Center
          </button>
          <button className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-bold hover:text-[var(--brand)] transition-colors">
            <Shield size={14} /> Privacy Policy
          </button>
        </div>
      </aside>

      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => mutate()} />
    </>
  );
}