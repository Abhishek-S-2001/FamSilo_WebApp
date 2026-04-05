'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ImagePlus, User as UserIcon, Loader2 } from 'lucide-react';
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

  // ── Fetch Feed ──
  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.get(`/posts/group/${siloId}`);
      const raw = res.data?.posts || [];

      const mapped: Post[] = raw.map((p: any) => {
        const profile = p.profiles || {};
        // Detect post type — fallback to old __text__ convention for pre-migration posts
        const postType = p.post_type || ((!p.image_path || p.image_path === '__text__') ? 'text' : 'photo');
        const isTextPost = postType === 'text';
        const isProposal = postType === 'proposal';

        // Build public URL for photo posts
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
          commentCount: p.comment_count || 0,
          isPublic: p.is_public ?? true,
          isAuthor: p.is_author || false,
          canDelete: p.can_delete || false,
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
  }, [fetchFeed]);

  // ── Create Post Handler ──
  const handleCreatePost = async (newPost: NewPostPayload) => {
    try {
      const token = localStorage.getItem('family_app_token');
      if (!token) return;

      if (newPost.type === 'photo' && newPost.imageFile) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (!userData?.user) throw new Error('Auth failed');

        const fileExt = newPost.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
        const filePath = `${userData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('group-media')
          .upload(filePath, newPost.imageFile);
        if (uploadError) throw uploadError;

        await api.post('/posts/', {
          group_id: siloId,
          post_type: 'photo',
          image_path: filePath,
          caption: newPost.caption || null,
          is_public: newPost.isPublic,
        });
      } else if (newPost.type === 'text') {
        await api.post('/posts/', {
          group_id: siloId,
          post_type: 'text',
          caption: newPost.caption,
          gradient: newPost.gradient || null,
          is_public: newPost.isPublic,
        });
      } else if (newPost.type === 'proposal') {
        await api.post('/posts/', {
          group_id: siloId,
          post_type: 'proposal',
          caption: newPost.caption,
          is_public: newPost.isPublic,
        });
      }

      // Refresh the feed
      setIsLoading(true);
      await fetchFeed();
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 py-6">
      {/* ── Create Post Trigger ── */}
      <div
        onClick={() => setShowCreateModal(true)}
        className="bg-white rounded-2xl border border-[#f2f4f6] shadow-[0_4px_24px_rgba(25,28,30,0.04)] p-5 flex items-center gap-4 cursor-pointer hover:shadow-[0_8px_30px_rgba(25,28,30,0.07)] transition-shadow group"
      >
        <div className="w-11 h-11 rounded-full bg-[#f2f4f6] flex items-center justify-center flex-shrink-0">
          <UserIcon size={20} className="text-[#777587]" />
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-medium text-[#b5b3c3] group-hover:text-[#777587] transition-colors"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Share a memory or thought with your silo…
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-[#f7f9fb] flex items-center justify-center text-[#777587] hover:text-[#0434c6] hover:bg-blue-50 transition-colors">
            <ImagePlus size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0434c6] to-[#3050de] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
            <PlusCircle size={18} />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[#0434c6]" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-2">
            <ImagePlus size={28} className="text-[#b5b3c3]" />
          </div>
          <p className="text-lg font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            No posts yet
          </p>
          <p className="text-sm text-[#777587] font-medium max-w-xs">
            Be the first to share a memory with your silo — photos, thoughts, or proposals!
          </p>
        </div>
      )}

      {/* ── Feed ── */}
      {!isLoading && posts.map((post) => (
        <FeedCard key={post.id} post={post} onDelete={(id) => setPosts((prev) => prev.filter(p => p.id !== id))} />
      ))}

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
