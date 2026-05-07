'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ImagePlus, User as UserIcon } from 'lucide-react';
import FeedCard, { Post } from '../FeedCard';
import CreatePostModal, { NewPostPayload } from './CreatePostModal';
import api from '@/lib/axios';
import { supabase } from '@/lib/supabase';

interface SiloFeedProps {
  siloId: string;
}

export default function SiloFeed({ siloId }: SiloFeedProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // ── Fetch Feed ──
  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get(`/posts/group/${siloId}`);
      const raw = res.data?.posts || [];

      const mapped: Post[] = raw.map((p: any) => {
        const profile = p.profiles || {};
        const rawType = p.post_type || 'photo';
        const isTextPost = rawType === 'text' || p.image_path === '__text__';
        const isProposal = rawType === 'proposal' || p.image_path === '__proposal__';
        const isVideo = rawType === 'video' || p.image_path === '__video__';
        const postType = isTextPost ? 'text' : isProposal ? 'proposal' : isVideo ? 'video' : 'photo';

        // Resolve media URLs from Supabase Storage
        let imageUrl: string | undefined;
        let videoUrl: string | undefined;
        const hasRealPath = p.image_path && !p.image_path.startsWith('__');

        if (hasRealPath) {
          const { data } = supabase.storage.from('group-media').getPublicUrl(p.image_path);
          if (postType === 'video') {
            videoUrl = data?.publicUrl;
          } else {
            imageUrl = data?.publicUrl;
          }
        }

        const createdAt = p.created_at ? timeAgo(p.created_at) : 'Just now';

        return {
          id: p.id,
          type: postType as 'photo' | 'text' | 'proposal' | 'video',
          author: {
            name: profile.username || 'Family Member',
            avatar: profile.avatar_url || undefined,
          },
          timestamp: createdAt,
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
          commentCount: p.comment_count || 0,
          isPublic: p.is_public ?? true,
          isAuthor: p.is_author || false,
          canDelete: p.can_delete || false,
          moderationStatus: p.moderation_status || 'approved',
        } as Post;
      });

      setPosts(mapped);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [siloId]);

  useEffect(() => {
    fetchFeed();

    // ── Ping Facilitator (once per day, idempotent) ──
    // Backend deduplicates via facilitator_runs table; no risk of spamming.
    api.post(`/agents/facilitator/check/${siloId}`)
      .then((res) => {
        if (res.data?.triggered) {
          // A new AI post was created — refresh the feed to show it
          setTimeout(() => fetchFeed(), 800);
        }
      })
      .catch(() => { /* non-critical — fail silently */ });
  }, [fetchFeed, siloId]);

  // ── Create Post Handler ──
  const handleCreatePost = async (newPost: NewPostPayload): Promise<void> => {
    setModerationError(null);
    const token = localStorage.getItem('family_app_token');
    if (!token) throw new Error('Not authenticated');

    try {
      if (newPost.type === 'photo' && newPost.imageFile) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData?.user) throw new Error('Auth failed');
        const fileExt = newPost.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
        const filePath = `${userData.user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('group-media').upload(filePath, newPost.imageFile);
        if (uploadError) throw uploadError;
        await api.post('/posts/', { group_id: siloId, post_type: 'photo', image_path: filePath, caption: newPost.caption || null, is_public: newPost.isPublic });

      } else if (newPost.type === 'video' && newPost.videoFile) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData?.user) throw new Error('Auth failed');
        const fileExt = newPost.videoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
        const filePath = `${userData.user.id}/videos/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('group-media').upload(filePath, newPost.videoFile);
        if (uploadError) throw uploadError;
        await api.post('/posts/', { group_id: siloId, post_type: 'video', video_path: filePath, caption: newPost.caption || null, is_public: newPost.isPublic });

      } else if (newPost.type === 'text') {
        await api.post('/posts/', { group_id: siloId, post_type: 'text', caption: newPost.caption, gradient: newPost.gradient || null, is_public: newPost.isPublic });

      } else if (newPost.type === 'proposal') {
        await api.post('/posts/', { group_id: siloId, post_type: 'proposal', caption: newPost.caption, is_public: newPost.isPublic });
      }

      setIsLoading(true);
      await fetchFeed();
      setShowCreateModal(false);

    } catch (err: any) {
      // Handle content moderation rejection (422)
      const detail = err?.response?.data?.detail;
      if (detail?.error === 'content_flagged') {
        setModerationError(detail.message || 'Your post was flagged by content moderation.');
        // Re-throw so the modal progress bar resets
        throw err;
      }
      throw err;
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 py-6">
      {/* ── Create Post Trigger ── */}
      <div
        onClick={() => setShowCreateModal(true)}
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-default)] shadow-[var(--shadow-card)] dark:shadow-none p-5 flex items-center gap-4 cursor-pointer hover:border-[var(--brand)] transition-all group"
      >
        <div className="w-11 h-11 rounded-full bg-[var(--bg-input)] flex items-center justify-center flex-shrink-0">
          <UserIcon size={20} className="text-[var(--text-muted)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-faint)] group-hover:text-[var(--text-muted)] transition-colors">
            Share a memory or thought with your silo…
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors">
            <ImagePlus size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-medium)] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
            <PlusCircle size={18} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-8">
          {[1,2].map(i => (
            <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] dark:border-[var(--border-default)] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="flex flex-col gap-1.5"><div className="skeleton h-3.5 w-28 rounded" /><div className="skeleton h-2.5 w-16 rounded" /></div></div>
              <div className="skeleton w-full aspect-[4/3] rounded-xl" />
              <div className="flex gap-3"><div className="skeleton h-8 w-14 rounded-xl" /><div className="skeleton h-8 w-14 rounded-xl" /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center mb-2">
            <ImagePlus size={28} className="text-[var(--text-faint)]" />
          </div>
          <p className="text-lg font-extrabold text-[var(--text-primary)]">No posts yet</p>
          <p className="text-sm text-[var(--text-muted)] font-medium max-w-xs">
            Be the first to share a memory with your silo — photos, thoughts, or proposals!
          </p>
        </div>
      )}

      {/* ── Feed ── */}
      {!isLoading && posts.map((post) => (
        <FeedCard key={post.id} post={post} onDelete={(id) => setPosts((prev) => prev.filter(p => p.id !== id))} />
      ))}

      {/* ── Moderation Error Toast ── */}
      {moderationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-2xl px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-500 text-base">🚫</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-red-700 dark:text-red-400">Post Blocked by Content Moderation</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium mt-0.5">{moderationError}</p>
          </div>
          <button onClick={() => setModerationError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none mt-0.5">&times;</button>
        </div>
      )}

      {/* ── Create Post Modal ── */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
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
