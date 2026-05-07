'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Settings, User, LogOut, Menu, Sun, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import NotificationBell from '@/components/NotificationBell';
import { useProfile } from '@/lib/hooks/useProfile';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // Avoid hydration mismatch — render only after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setSpinning(true);
    setTheme(isDark ? 'light' : 'dark');
    setTimeout(() => setSpinning(false), 400);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] transition-colors"
    >
      <span className={spinning ? 'animate-theme-toggle' : ''}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </span>
    </button>
  );
}

export default function TopNavbar() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profile, isLoading: isProfileLoading } = useProfile();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('family_app_token');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  const navigateToProfile = () => {
    setIsProfileOpen(false);
    router.push('/profile');
  };

  const userDisplayName = profile?.full_name || profile?.username || 'Family Member';
  const userAvatar = profile?.avatar_url;
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <nav className="
      fixed top-0 left-0 w-full h-20 z-40 flex items-center justify-between px-4 md:px-8
      bg-white/80 dark:bg-slate-900/80
      backdrop-blur-2xl
      border-b border-[var(--border-subtle)]
      transition-colors duration-200
    ">

      {/* LEFT: Logo & Main Links */}
      <div className="flex items-center gap-4 md:gap-12">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => window.dispatchEvent(new Event('toggle-mobile-sidebar'))}
          className="md:hidden flex items-center justify-center p-2 -ml-2 text-[var(--text-secondary)] hover:bg-[var(--brand-soft)] rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>

        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-[var(--brand)]"
        >
          FamSilo
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[var(--text-primary)] font-extrabold text-sm border-b-2 border-[var(--brand)] pb-1">Home</Link>
          <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm pb-1">Memories</Link>
          <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm pb-1">Vault</Link>
          <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm pb-1">Calendar</Link>
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-2">

        {/* Utility Icons */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] transition-colors">
          <Search size={20} />
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] transition-colors">
          <Settings size={20} />
        </button>

        <ThemeToggle />
        <NotificationBell />

        {/* AI Concierge Button */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-concierge'))}
          aria-label="Open AI Concierge"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-medium)] text-white shadow-md hover:scale-105 transition-transform"
        >
          <Sparkles size={18} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-white dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userDisplayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-amber-700 dark:text-amber-300 font-extrabold text-sm uppercase">{userInitial}</span>
            )}
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="
                absolute right-0 mt-3 w-56 z-50
                bg-[var(--bg-card)] rounded-2xl py-2 flex flex-col
                border border-[var(--border-subtle)]
                shadow-[var(--shadow-float)]
                dark:shadow-none dark:border-[var(--border-default)]
                animate-slide-up-fade
              ">
                <div className="px-5 py-3 border-b border-[var(--border-subtle)] mb-1 text-left">
                  <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">{userDisplayName}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Family Member</p>
                </div>

                <button
                  onClick={navigateToProfile}
                  className="flex items-center gap-3 px-5 py-3 text-[var(--text-secondary)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors text-sm font-bold w-full text-left"
                >
                  <User size={18} /> Profile
                </button>

                <div className="h-px w-full bg-[var(--border-subtle)] my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-bold w-full text-left"
                >
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}