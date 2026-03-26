'use client';

interface SiloPlaceholderTabProps {
  tab: string;
}

export default function SiloPlaceholderTab({ tab }: SiloPlaceholderTabProps) {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-12 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 flex-1 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-[#e2dfff] rounded-full flex items-center justify-center text-[#352ac0] text-3xl">
        {tab === 'Feed' ? '📰' : '📅'}
      </div>
      <h2
        className="text-2xl font-extrabold text-[#191c1e]"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        {tab} coming soon
      </h2>
      <p className="text-[#464555] font-medium max-w-sm">
        We're currently building out the {tab.toLowerCase()} feature. Check back later!
      </p>
    </div>
  );
}