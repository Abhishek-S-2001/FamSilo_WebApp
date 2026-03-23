'use client';

import { useState } from 'react';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import SiloChatPanel from '@/components/SiloChatPanel';
import { Heart, MessageCircle, Share2, MessageSquare, X } from 'lucide-react';

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] min-h-screen font-sans text-[#191c1e] overflow-hidden">
      <TopNavbar />

      {/* FIXED: Changed height to h-screen to fix the blank bottom space */}
      <main className="pt-28 px-8 pb-8 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 h-screen relative">
         
        {/* LEFT COLUMN: Sidebar Component */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <Sidebar />
        </div>

        {/* CENTER COLUMN: FIXED with dynamic col-span so it expands when chat closes! */}
        <section 
          className={`flex flex-col gap-8 overflow-y-auto pb-32 scroll-smooth no-scrollbar transition-all duration-500 ease-in-out ${
            isChatOpen ? 'col-span-1 md:col-span-6 lg:col-span-7' : 'col-span-1 md:col-span-9 lg:col-span-10'
          }`}
        >
          
          <header className="flex flex-col gap-1 mb-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              Welcome back, Abhishek!
            </h1>
            <p className="text-[#464555] font-medium" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              Here's what's new across your family silos.
            </p>
          </header>

          <div className="flex flex-col gap-10">
            
            {/* Feed Card 1 */}
            <article className="bg-white/90 backdrop-blur-md rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-white">
              
              {/* Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e0e3e5]">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDNRJV77P9FS3NucruDvtpkudtb0KoQVjCRNESAWJuazhcATtyQRltzqvBPBYZnGH96xrtwL_ZELWMy9eZVdmAL7mStHxND7fNsvYPmtPBT4UAoJImNuQqz2Zl0KydbbjFSXLUCDeTmgiY6xYTDbjmNozj1jKf_pQYvpKIJfSIWAEX1Z0NzpZVWfI59ovY2HelhlI3IV9haAyjRcWNHi42pbjnNj_6-DG7OlqHsCpflkxbn2uAmEK0qtHywC5dJG3AAEdjNLaXtgxZ" alt="Aunt Sarah" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Aunt Sarah</h4>
                    <span className="text-[10px] text-[#3050de] font-extrabold uppercase tracking-widest" style={{ fontFamily: '"Manrope", sans-serif' }}>The Miller Family</span>
                  </div>
                </div>
                <span className="text-xs text-[#777587] font-bold" style={{ fontFamily: '"Manrope", sans-serif' }}>2 hours ago</span>
              </div>
              
              {/* Image */}
              <div className="w-full bg-[#f2f4f6]">
                <img className="w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo8u7AGWvZAFLvHFeprh6O6Yi5pI3TZ4BXAgiebc6q3Hs28zdW_BSQIBWNNgOfOdwcjinjqAATkHy-gpMgMsptLns4e_GEQpjyo18gE5cceJRG2XQRTt2uzgKMmCpl7Vv_UWmR_HUNe64ODxPcsdN3iLmap6_A7f6LmwRdwzm7FskOx2-Vt-57lLfu0eaJTybBcX6d5HB_zfMhOq7my7c103CBufV4QoyWiNOKIvZsSjjkzOlqGaqrJqv_QFF28mcoJ_O938cM3xW-" alt="Family dinner" />
              </div>
              
              {/* Footer / Caption */}
              <div className="p-8 flex flex-col gap-6">
                <p className="text-[#191c1e] font-medium text-lg leading-relaxed" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Finally caught the whole crew together for dinner! ❤️
                </p>
                <div className="flex items-center gap-8 pt-2">
                  <button className="flex items-center gap-2.5 text-[#464555] hover:text-[#0434c6] transition-colors font-bold text-sm">
                    <Heart size={20} /> 12
                  </button>
                  <button className="flex items-center gap-2.5 text-[#464555] hover:text-[#0434c6] transition-colors font-bold text-sm">
                    <MessageCircle size={20} /> 4 comments
                  </button>
                  <button className="ml-auto text-[#777587] hover:text-[#0434c6] transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </article>

            {/* Feed Card 2 */}
            <article className="bg-white/90 backdrop-blur-md rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-white">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e0e3e5]">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsE1Z-gtCwPAE_o64Rj2JB-8Y0r9tyU0aRg0LwrbTQ50d_i13V2VkQ02azkw2_lpCZ9ucDPb83qqOiWMBqHFv6JzAyUdR3vHfOk3L9dcpZNjswQhut4XlurUOTd0-EkUL9B3_CMSytBNL27RfU-KeIIqd-duy8mvx1QaXoE6btcUOonixnNaaQkjwz9duSu_WfienQ8Z8V5uua3XCjfecV6WKxn7CIw94xTDNTQUyg3foGux0ZK_coMEOU-B0fGoW3OnHRzjdNT2mr" alt="Mike" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Mike</h4>
                    <span className="text-[10px] text-[#3050de] font-extrabold uppercase tracking-widest" style={{ fontFamily: '"Manrope", sans-serif' }}>College Bros</span>
                  </div>
                </div>
                <span className="text-xs text-[#777587] font-bold" style={{ fontFamily: '"Manrope", sans-serif' }}>5 hours ago</span>
              </div>
              
              <div className="w-full bg-[#f2f4f6]">
                <img className="w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNanrQO4kqMJulZAREkmen_HvwX_9O2AobIhaIDDYOQe51Gp5dkvE1OOde6528_7uzuLCcvZjUvJe5hBK96LBQwpDIYvC0Mat5HQhrI1odW0dbu5V6Z9kqFQMKiiix7bi-nqxQ7IVIOczwtbokvQJEuszNbF5IHcbBO3MR6Ba4xFO28o0gZ3WI93k02xBM-okqS21w2854zHIOMQbDHoCZ11JrFD3rXpKF4mJnvmcSNyNAComiqPD2ckAJmGzXeR9l5Pi-ThIQFkHM" alt="Mountain peak" />
              </div>
              
              <div className="p-8 flex flex-col gap-6">
                <p className="text-[#191c1e] font-medium text-lg leading-relaxed" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Peak views from this morning's trail! 🏔️
                </p>
                <div className="flex items-center gap-8 pt-2">
                  <button className="flex items-center gap-2.5 text-[#464555] hover:text-[#0434c6] transition-colors font-bold text-sm">
                    <Heart size={20} /> 8
                  </button>
                  <button className="flex items-center gap-2.5 text-[#464555] hover:text-[#0434c6] transition-colors font-bold text-sm">
                    <MessageCircle size={20} /> 2 comments
                  </button>
                  <button className="ml-auto text-[#777587] hover:text-[#0434c6] transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* RIGHT COLUMN: The Global Chat Drawer */}
        {isChatOpen && (
          <SiloChatPanel isGlobal={true} siloName={''} members={[]} /> 
        )}

        {/* === FLOATING ACTION BUTTONS === */}
        <div className="fixed bottom-10 right-10 flex gap-4 z-50">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-[#0434c6] rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(4,52,198,0.3)] hover:scale-[1.05] hover:bg-[#3050de] active:scale-[0.95] transition-all"
          >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="mt-0.5" />}
          </button>
        </div>

      </main>
    </div>
  );
}