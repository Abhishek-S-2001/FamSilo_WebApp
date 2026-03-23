'use client';

import { Home, Lock, Users, Plus, HelpCircle, Shield, Loader2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
// 1. Import Link and usePathname for Next.js routing
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CreateGroupModal from './CreateGroupModal';
import api from '../lib/api'; 

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [silos, setSilos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. Get the current URL path to highlight the active tab
  const pathname = usePathname();
  const router = useRouter();

  const fetchSilos = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/silos/');
      setSilos(response.data);
    } catch (error) {
      console.error('Failed to fetch silos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSilos();
  }, []);

  const handleLogout = () => {
    // Destroy the authentication token
    localStorage.removeItem('family_app_token');
    // Send them back to the login screen
    router.push('/login');
  };

  return (
    <>
      <aside className="hidden md:flex flex-col gap-8 overflow-y-auto pb-8 h-full pr-4 no-scrollbar">

        {/* Navigation Block */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xs font-bold text-[#777587] uppercase tracking-widest pl-2" style={{ fontFamily: '"Manrope", sans-serif' }}>
            Navigation
          </h2>

          {/* Wrap Home in a Link */}
          <Link 
            href="/"
            className={`flex items-center gap-3 rounded-2xl py-3.5 px-4 transition-all border-none ${
              pathname === '/' 
                ? 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.03)] text-[#0434c6]' // Active state
                : 'text-[#464555] hover:bg-white/60' // Inactive state
            }`}
          >
            <Home size={20} strokeWidth={2.5} />
            <span className="font-extrabold text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Home</span>
          </Link>
        </div>

        {/* Private Space */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold text-[#777587] uppercase tracking-widest pl-2 mb-1" style={{ fontFamily: '"Manrope", sans-serif' }}>
            Private Space
          </h3>
          <Link 
            href="/vault"
            className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl transition-all ${
              pathname === '/vault' ? 'bg-white shadow-sm text-[#0434c6]' : 'text-[#464555] hover:bg-white/60'
            }`}
          >
            <Lock size={18} className={pathname === '/vault' ? "text-[#0434c6]" : "text-[#777587]"} />
            <span className="font-bold text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>My Personal Vault</span>
          </Link>
        </div>

        {/* Your Silos */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold text-[#777587] uppercase tracking-widest pl-2 mb-1" style={{ fontFamily: '"Manrope", sans-serif' }}>
            Your Silos
          </h3>

          {/* Dynamic Silo Rendering */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-[#c7c4d8]" size={20} />
            </div>
          ) : silos.length === 0 ? (
            <p className="text-xs text-[#777587] font-medium pl-2 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              You haven't joined any silos yet.
            </p>
          ) : (
            silos.map((silo) => {
              // Check if the current URL matches this specific silo
              const isActive = pathname === `/silo/${silo.id}`;

              return (
                // 3. Changed from <button> to <Link> pointing to /silo/[id]
                <Link 
                  key={silo.id}
                  href={`/silo/${silo.id}`}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-2xl transition-all w-full group ${
                    isActive 
                      ? 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.03)] text-[#0434c6]' // Active Glass State
                      : 'text-[#464555] hover:bg-white/60'
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

          {/* Create Silo Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 border-2 border-dashed border-[#c7c4d8] text-[#777587] py-3.5 px-4 rounded-2xl hover:border-[#3050de] hover:text-[#3050de] hover:bg-white/40 transition-all flex items-center justify-center gap-2 font-bold text-sm group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Create Silo
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-auto pt-6 flex flex-col gap-3 pl-2">
          {/* 5. The Logout Button (Subtle red hover) */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#777587] text-xs font-bold hover:text-[#93000a] transition-colors mt-2 w-fit" 
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
        onSuccess={() => fetchSilos()}
      />
    </>
  );
}