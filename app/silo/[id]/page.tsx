'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import InviteMemberModal from '@/components/InviteMemberModal';
import SiloHeader from '@/components/silo/SiloHeader';
import SiloVaultTab from '@/components/silo/SiloVaultTab';
import SiloMembersTab from '@/components/silo/SiloMembersTab';
import SiloPlaceholderTab from '@/components/silo/SiloPlaceholderTab';
import { useSilo } from '@/lib/hooks/useSilo';

export default function SiloDashboard() {
  const params = useParams();
  const siloId = params.id as string;

  const { silo, members, isLoading } = useSilo(siloId);

  const [activeTab, setActiveTab] = useState('Vault');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0434c6]" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] h-screen overflow-hidden font-sans text-[#191c1e]">
      <TopNavbar />
      <main className="pt-28 px-8 pb-0 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 h-full relative">

        <div className="col-span-1 md:col-span-3 lg:col-span-2 h-full">
          <Sidebar />
        </div>

        <section className="col-span-1 md:col-span-9 lg:col-span-10 flex flex-col gap-6 overflow-y-auto h-full pb-32 no-scrollbar transition-all duration-500 ease-in-out">

          <SiloHeader
            silo={silo}
            members={members}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onInviteClick={() => setIsInviteModalOpen(true)}
          />

          {activeTab === 'Vault' && <SiloVaultTab />}
          {activeTab === 'Members' && <SiloMembersTab members={members} />}
          {(activeTab === 'Feed' || activeTab === 'Calendar') && <SiloPlaceholderTab tab={activeTab} />}

        </section>

      </main>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        siloId={siloId}
      />
    </div>
  );
}