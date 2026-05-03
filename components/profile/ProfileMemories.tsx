'use client';

import FeedList from '@/components/FeedList';

interface ProfileMemoriesProps {
  profileId: string | undefined;
}

export default function ProfileMemories({ profileId }: ProfileMemoriesProps) {
  if (!profileId) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        Recent Uploads
      </h2>
      <div className="-mt-6">
        <FeedList endpoint={`/posts/user/${profileId}`} hideFilters={true} />
      </div>
    </div>
  );
}