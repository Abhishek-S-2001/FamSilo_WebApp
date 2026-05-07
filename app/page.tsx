'use client';

// 1. Swap useUser for useProfile
import { useProfile } from '@/lib/hooks/useProfile'; 
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import FeedList from '@/components/FeedList';

export default function DashboardPage() {
  // 2. Pull the profile data from your database hook instead
  const { profile, isLoading } = useProfile();

  // 3. Intelligently grab whatever name they have available, and split it!
  const rawName = profile?.display_name || profile?.username || 'there';
  const firstName = rawName.split(' ')[0];

  return (
    <div className="bg-[var(--bg-page)] h-screen text-[var(--text-primary)] overflow-hidden transition-colors duration-200">
      <TopNavbar />

      <main className="pt-20 md:pt-24 px-4 md:px-8 pb-0 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 h-full relative">
        <div className="md:col-span-3 lg:col-span-2 h-0 md:h-full z-50 md:z-auto">
          <Sidebar />
        </div>

        <section className="md:col-span-9 lg:col-span-10 flex flex-col gap-8 overflow-y-auto h-full pb-32 scroll-smooth no-scrollbar transition-all duration-500 ease-in-out">
          <FeedList />
        </section>
      </main>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}