'use client';

// 1. Swap useUser for useProfile
import { useProfile } from '@/lib/hooks/useProfile'; 
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import FeedList from '@/components/FeedList';
import HomeHeader from '@/components/HomeHeader';

export default function DashboardPage() {
  // 2. Pull the profile data from your database hook instead
  const { profile, isLoading } = useProfile();

  // 3. Intelligently grab whatever name they have available, and split it!
  const rawName = profile?.display_name || profile?.username || 'there';
  const firstName = rawName.split(' ')[0];

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] h-screen font-sans text-[#191c1e] overflow-hidden">
      <TopNavbar />

      <main className="pt-28 px-8 pb-0 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 h-full relative">
        <div className="col-span-1 md:col-span-3 lg:col-span-2 h-full">
          <Sidebar />
        </div>

        <section className="col-span-1 md:col-span-9 lg:col-span-10 flex flex-col gap-8 overflow-y-auto h-full pb-32 scroll-smooth no-scrollbar transition-all duration-500 ease-in-out">
          {!isLoading && <HomeHeader firstName={firstName} />}
          <FeedList />
        </section>
      </main>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}