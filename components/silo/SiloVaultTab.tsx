'use client';

import { Filter, Plus } from 'lucide-react';

// TODO: replace mock images with real Supabase bucket URLs when Photo Vault is built
const MOCK_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNanrQO4kqMJulZAREkmen_HvwX_9O2AobIhaIDDYOQe51Gp5dkvE1OOde6528_7uzuLCcvZjUvJe5hBK96LBQwpDIYvC0Mat5HQhrI1odW0dbu5V6Z9kqFQMKiiix7bi-nqxQ7IVIOczwtbokvQJEuszNbF5IHcbBO3MR6Ba4xFO28o0gZ3WI93k02xBM-okqS21w2854zHIOMQbDHoCZ11JrFD3rXpKF4mJnvmcSNyNAComiqPD2ckAJmGzXeR9l5Pi-ThIQFkHM',
    alt: 'Camping', col: 'col-span-12', row: 'row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Coffee', col: 'col-span-5', row: 'row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Portrait', col: 'col-span-7', row: 'row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Dog', col: 'col-span-5', row: 'row-span-1',
  },
];

export default function SiloVaultTab() {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Toolbar */}
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

      {/* Masonry Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
        {MOCK_IMAGES.map((img) => (
          <div
            key={img.alt}
            className={`${img.col} ${img.row} rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer`}
          >
            <img
              src={img.src}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={img.alt}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}