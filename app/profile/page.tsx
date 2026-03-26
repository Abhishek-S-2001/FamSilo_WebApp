'use client';

import { useState } from 'react';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import ViewProfileModal from '@/components/ViewProfileModal';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileAbout from '@/components/profile/ProfileAbout';
import ProfileMemories from '@/components/profile/ProfileMemories';
import ProfileStatsBar from '@/components/profile/ProfileStatsBar';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ImageCropModal from '@/components/profile/ImageCropModal';
import { useProfile } from '@/lib/hooks/useProfile';
import api from '@/lib/axios';
import { useChat } from '@/lib/context/ChatContext';

export default function ProfilePage() {
  const { profile, stats, silosList, membersList, isLoading, mutate } = useProfile();
  const { openChatWith } = useChat();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<'avatar' | 'cover' | null>(null);

  const [cropModal, setCropModal] = useState<{ image: string; type: 'avatar' | 'cover' } | null>(null);


  // Handle file selection → open cropper
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!e.target.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => setCropModal({ image: reader.result as string, type });
    reader.readAsDataURL(e.target.files[0]);
    e.target.value = '';
  };

  // After crop → upload to backend
  const handleCropDone = async (croppedBase64: string, type: 'avatar' | 'cover') => {
    setCropModal(null);
    setIsUploading(type);
    try {
      const res = await api.post('/users/me/image', { image_base64: croppedBase64, type });
      mutate(); // revalidate SWR cache so new image shows immediately
    } catch (e) {
      console.error('Image upload failed', e);
    } finally {
      setIsUploading(null);
    }
  };

const handleStartDM = (peerId: string, peerName: string) => {
    if (!profile?.id) return;
    const ids = [profile.id, peerId].sort();
    const dmRoomId = `dm_${ids[0]}_${ids[1]}`;
    
    openChatWith(dmRoomId, peerName); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0434c6] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Derived display values
  const displayName = profile?.display_name || profile?.username || 'User';
  const userHandle = profile?.username ? `@${profile.username}` : '@user';
  const pronouns = profile?.pronouns || 'He/Him';
  const role = profile?.family_role || 'The Tech Guy';
  const bio = profile?.bio || '';
  const dob = profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';
  const hobbies = profile?.hobbies?.length ? profile.hobbies : [];

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] min-h-screen font-sans text-[#191c1e]">
      <TopNavbar />

      <main className="pt-28 px-8 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-24">
        <div className="col-span-1 md:col-span-3 lg:col-span-2 relative z-20">
          <Sidebar />
        </div>

        <section className="col-span-1 md:col-span-9 lg:col-span-10 flex flex-col gap-8 relative z-10">
          <ProfileHero
            profile={profile}
            displayName={displayName}
            userHandle={userHandle}
            pronouns={pronouns}
            role={role}
            isUploading={isUploading}
            onFileChange={onFileChange}
            statsBar={
              <ProfileStatsBar
                stats={stats}
                silosList={silosList}
                membersList={membersList}
                onStartDM={handleStartDM}
                onViewProfile={setViewProfileId}
              />
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="col-span-1 lg:col-span-4">
              <ProfileAbout
                profile={profile}
                bio={bio}
                dob={dob}
                hobbies={hobbies}
                onEditClick={() => setIsEditModalOpen(true)}
              />
            </div>
            <div className="col-span-1 lg:col-span-8">
              <ProfileMemories />
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={mutate}
        />
      )}

      {cropModal && (
        <ImageCropModal
          image={cropModal.image}
          type={cropModal.type}
          onDone={handleCropDone}
          onCancel={() => setCropModal(null)}
        />
      )}

      <ViewProfileModal
        userId={viewProfileId}
        isOpen={!!viewProfileId}
        onClose={() => setViewProfileId(null)}
      />
    </div>
  );
}