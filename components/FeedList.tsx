'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import FeedCard, { Post } from './FeedCard';
import { Zap } from 'lucide-react';
import api from '@/lib/axios';
import { supabase } from '@/lib/supabase';

const fetcher = (url: string) => api.get(url).then(r => r.data);

interface FeedListProps {
  endpoint?: string;
  hideFilters?: boolean;
}

// ── Shimmer Skeleton Card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-default)] p-5 flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
      {/* Media placeholder */}
      <div className="skeleton w-full aspect-[4/3] rounded-xl" />
      {/* Caption */}
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <div className="skeleton h-8 w-16 rounded-xl" />
        <div className="skeleton h-8 w-16 rounded-xl" />
        <div className="skeleton h-8 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export default function FeedList({ endpoint = '/posts/feed/home', hideFilters = false }: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilterId, setActiveFilterId] = useState<string>('all');

  const { data: silos = [] } = useSWR(hideFilters ? null : '/silos', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get(endpoint);
      const raw = res.data?.posts || [];

      const mapped: Post[] = raw.map((p: any) => {
        const profile = p.profiles || {};
        const rawType = p.post_type || 'photo';
        const isTextPost = rawType === 'text' || p.image_path === '__text__';
        const isProposal = rawType === 'proposal' || p.image_path === '__proposal__';
        const isVideo = rawType === 'video' || p.image_path === '__video__';
        const postType = isTextPost ? 'text' : isProposal ? 'proposal' : isVideo ? 'video' : 'photo';

        let imageUrl: string | undefined;
        let videoUrl: string | undefined;
        const hasRealPath = p.image_path && !p.image_path.startsWith('__');

        if (hasRealPath) {
          const { data } = supabase.storage.from('group-media').getPublicUrl(p.image_path);
          if (postType === 'video') videoUrl = data?.publicUrl;
          else imageUrl = data?.publicUrl;
        }

        return {
          id: p.id,
          type: postType as 'photo' | 'text' | 'proposal' | 'video',
          author: {
            name: profile.username || 'Family Member',
            avatar: profile.avatar_url || undefined,
          },
          timestamp: p.created_at ? timeAgo(p.created_at) : 'Just now',
          imageUrl,
          videoUrl,
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
          siloId: p.group_id,
          moderationStatus: p.moderation_status || 'approved',
        };
      });

      setPosts(mapped);
    } catch (err: any) {
      console.error('Failed to fetch global feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const displayedPosts = activeFilterId === 'all' || hideFilters
    ? posts
    : posts.filter((p: any) => p.siloId === activeFilterId);

  const filterBtnBase = 'flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all';
  const filterActive = `${filterBtnBase} bg-[var(--text-primary)] text-white scale-105`;
  const filterInactive = `${filterBtnBase} bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]`;

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full pt-4 md:pt-6">

      {/* ── Filter Pills ── */}
      {!hideFilters && silos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
          <button onClick={() => setActiveFilterId('all')}
            className={activeFilterId === 'all' ? filterActive : filterInactive}>
            All Updates
          </button>
          {silos.map((silo: any) => (
            <button key={silo.id} onClick={() => setActiveFilterId(silo.id)}
              className={activeFilterId === silo.id ? filterActive : filterInactive}>
              {silo.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Shimmer Skeleton Loading ── */}
      {isLoading && (
        <div className="flex flex-col gap-8 pb-32">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && displayedPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center mb-2">
            <Zap size={28} className="text-[var(--text-faint)]" />
          </div>
          <p className="text-lg font-extrabold text-[var(--text-primary)]">Nothing to see here</p>
          <p className="text-sm text-[var(--text-muted)] font-medium max-w-xs">
            There are no public posts in your silos matching this filter.
          </p>
        </div>
      )}

      {/* ── Feed Cards ── */}
      {!isLoading && (
        <div className="flex flex-col gap-8 pb-32">
          {displayedPosts.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
              <FeedCard
                post={post}
                showOriginSilo={true}
                onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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