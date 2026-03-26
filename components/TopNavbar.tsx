'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';

import NotificationBell from '@/components/NotificationBell';

export default function TopNavbar() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks anywhere outside of it
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
    // 1. Clear the security tokens from local storage
    localStorage.removeItem('family_app_token');
    localStorage.removeItem('user_id');
    
    // 2. Redirect back to the login page
    router.push('/login');
  };

  const navigateToProfile = () => {
    setIsProfileOpen(false);
    router.push('/profile');
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-2xl z-40 border-b border-[#f2f4f6]/80 flex items-center justify-between px-8 transition-all">
      
      {/* LEFT: Logo & Main Links */}
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#0434c6]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          FamSilo
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#191c1e] font-extrabold text-sm border-b-2 border-[#0434c6] pb-1">Home</Link>
          <Link href="#" className="text-[#777587] hover:text-[#191c1e] transition-colors font-bold text-sm pb-1">Memories</Link>
          <Link href="#" className="text-[#777587] hover:text-[#191c1e] transition-colors font-bold text-sm pb-1">Vault</Link>
          <Link href="#" className="text-[#777587] hover:text-[#191c1e] transition-colors font-bold text-sm pb-1">Calendar</Link>
        </div>
      </div>

      {/* RIGHT: Search, Notifications, & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Utility Icons */}
        <div className="flex items-center gap-2 mr-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#f2f4f6] transition-colors">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#f2f4f6] transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <NotificationBell />

        {/* Profile Dropdown Container */}
        <div className="relative" ref={menuRef}>
          {/* The Clickable Avatar */}
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-[#fcdbb6] border-2 border-white shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0434c6] focus:ring-offset-2"
          >
            {/* Fallback Initials - You can replace this with an <img> tag later! */}
            <span className="text-[#d97c27] font-extrabold text-sm uppercase">A</span>
          </button>

          {/* The Floating Card */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(25,28,30,0.1)] border border-[#f2f4f6] py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="px-5 py-3 border-b border-[#f2f4f6] mb-1">
                <p className="text-sm font-extrabold text-[#191c1e] truncate">Abhishek</p>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mt-0.5">Family Curator</p>
              </div>

              <button 
                onClick={navigateToProfile} 
                className="flex items-center gap-3 px-5 py-3 text-[#464555] hover:text-[#0434c6] hover:bg-[#f0f4ff] transition-colors text-sm font-bold w-full text-left"
              >
                <User size={18} /> Profile
              </button>
              
              <div className="h-px w-full bg-[#f2f4f6] my-1"></div>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 px-5 py-3 text-[#d93a3a] hover:bg-[#fff0f0] transition-colors text-sm font-bold w-full text-left"
              >
                <LogOut size={18} /> Log Out
              </button>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
}