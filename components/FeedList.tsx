'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import FeedCard, { Post } from './FeedCard';
import { Loader2, Zap } from 'lucide-react';
import api from '@/lib/axios';
import { supabase } from '@/lib/supabase';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function FeedList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilterId, setActiveFilterId] = useState<string>('all');

  // Fetch Silos for the filter pills
  const { data: silos = [] } = useSWR('/silos', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Fetch Global Feed
  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get('/posts/feed/home');
      const raw = res.data?.posts || [];

      const mapped: Post[] = raw.map((p: any) => {
        const profile = p.profiles || {};
        const postType = p.post_type || ((!p.image_path || p.image_path === '__text__') ? 'text' : 'photo');
        const isTextPost = postType === 'text';
        const isProposal = postType === 'proposal';

        let imageUrl: string | undefined;
        if (!isTextPost && !isProposal && p.image_path && p.image_path !== '__text__') {
          const { data } = supabase.storage.from('group-media').getPublicUrl(p.image_path);
          imageUrl = data?.publicUrl;
        }

        const createdAt = p.created_at ? timeAgo(p.created_at) : 'Just now';

        return {
          id: p.id,
          type: postType as 'photo' | 'text' | 'proposal',
          author: {
            name: profile.username || 'Family Member',
            avatar: profile.avatar_url || undefined,
          },
          timestamp: createdAt,
          imageUrl,
          caption: p.caption || undefined,
          textContent: isTextPost ? p.caption : undefined,
          gradient: p.gradient || 'bg-gradient-to-br from-blue-500 to-purple-600',
          proposalText: isProposal ? p.caption : undefined,
          proposalStatus: p.proposal_status || undefined,
          upvotes: p.upvotes || 0,
          downvotes: p.downvotes || 0,
          totalMembers: p.total_members || 0,
          requiredPercent: 40,
          myVote: p.my_vote || null,
          likeCount: p.like_count || 0,
          likedByMe: p.liked_by_me || false,
          commentCount: p.comment_count || 0,
          isPublic: p.is_public ?? true,
          isAuthor: p.is_author || false,
          canDelete: p.can_delete || false,
          siloName: p.silo_name,
          siloId: p.group_id, // temporarily store to filter
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.error('Failed to fetch global feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Filter logic
  const displayedPosts = activeFilterId === 'all' 
    ? posts 
    : posts.filter((p: any) => p.siloId === activeFilterId);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* ── Filters ── */}
      {silos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
          <button
            onClick={() => setActiveFilterId('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilterId === 'all'
                ? 'bg-[#191c1e] text-white shadow-md'
                : 'bg-white border border-[#f2f4f6] text-[#777587] hover:border-[#c7c4d8]'
            }`}
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            All Updates
          </button>
          {silos.map((silo: any) => (
            <button
              key={silo.id}
              onClick={() => setActiveFilterId(silo.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilterId === silo.id
                  ? 'bg-[#191c1e] text-white shadow-md'
                  : 'bg-white border border-[#f2f4f6] text-[#777587] hover:border-[#c7c4d8]'
              }`}
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              {silo.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[#0434c6]" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && displayedPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-2">
            <Zap size={28} className="text-[#b5b3c3]" />
          </div>
          <p className="text-lg font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Nothing to see here
          </p>
          <p className="text-sm text-[#777587] font-medium max-w-xs">
            There are no public posts in your silos matching this filter.
          </p>
        </div>
      )}

      {/* ── Feed ── */}
      <div className="flex flex-col gap-8 pb-32">
        {!isLoading && displayedPosts.map(post => (
          <FeedCard 
            key={post.id} 
            post={post} 
            showOriginSilo={true} 
            onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} 
          />
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}