'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp, ThumbsDown, BadgeCheck, CheckCircle2, Send, Loader2, Trash2, ShieldAlert, MapPin, Lock } from 'lucide-react';
import api from '@/lib/axios';

export interface Post {
  id: string;
  type: 'photo' | 'text' | 'proposal';
  author: { name: string; avatar?: string };
  timestamp: string;
  // Photo
  imageUrl?: string;
  caption?: string;
  // Text
  textContent?: string;
  gradient?: string;
  // Proposal
  proposalText?: string;
  proposalStatus?: string; // "pending" | "passed" | "rejected"
  upvotes?: number;
  downvotes?: number;
  totalMembers?: number;
  requiredPercent?: number;
  myVote?: 'up' | 'down' | null;
  // Engagement
  likeCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  isPublic?: boolean;
  isAuthor?: boolean;
  canDelete?: boolean;
  siloName?: string;
}

interface FeedCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  showOriginSilo?: boolean;
  showPrivacyLock?: boolean;
}

export default function FeedCard({ post, onDelete, showOriginSilo, showPrivacyLock }: FeedCardProps) {
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  const [voted, setVoted] = useState<'up' | 'down' | null>(post.myVote || null);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes || 0);
  const [localStatus, setLocalStatus] = useState(post.proposalStatus || 'pending');
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount || 0);

  // Comment section state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Menu / Delete state
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Like Handler (API) ──
  const handleLike = async () => {
    // Optimistic update
    setLiked(!liked);
    setLocalLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      // Rollback on failure
      setLiked(liked);
      setLocalLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  // ── Vote Handler (API) ──
  const handleVote = async (dir: 'up' | 'down') => {
    if (localStatus === 'passed') return;
    const prevVote = voted;
    const prevUpvotes = localUpvotes;

    // Optimistic: calculate new state
    let newUpvotes = localUpvotes;
    if (prevVote === dir) {
      // Undo — not supported by backend (always upserts), so re-cast same vote
      return;
    }
    if (prevVote === 'up') newUpvotes -= 1;
    if (dir === 'up') newUpvotes += 1;
    setVoted(dir);
    setLocalUpvotes(newUpvotes);

    try {
      const res = await api.post(`/posts/${post.id}/vote`, { vote: dir });
      setLocalUpvotes(res.data.upvotes);
      if (res.data.proposal_status === 'passed') {
        setLocalStatus('passed');
      }
    } catch {
      setVoted(prevVote);
      setLocalUpvotes(prevUpvotes);
    }
  };

  // ── Comments ──
  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/posts/${post.id}/comments`);
        setComments(res.data.comments || []);
      } catch { /* silent */ }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      await api.post(`/posts/${post.id}/comment`, { content: commentText });
      // Re-fetch comments
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data.comments || []);
      setCommentText('');
      setLocalCommentCount((c) => c + 1);
    } catch { /* silent */ }
    setPostingComment(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      if (onDelete) onDelete(post.id);
    } catch {
      alert('Failed to delete post.');
      setIsDeleting(false);
    }
  };

  const votePercent =
    post.totalMembers && post.totalMembers > 0
      ? Math.round((localUpvotes / post.totalMembers) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#f2f4f6] shadow-[0_4px_24px_rgba(25,28,30,0.04)] overflow-hidden flex flex-col relative">
      {/* ── Origin Badge (For Aggregated Feeds) ── */}
      {showOriginSilo && post.siloName && (
        <div className="px-5 pt-4 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f2f4f6] rounded-full">
            <MapPin size={12} className="text-[#0434c6]" />
            <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider">
              {post.siloName}
            </span>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-5 ${showOriginSilo ? 'pt-2' : 'pt-5'} pb-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e0e3e5] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-extrabold text-[#0434c6] uppercase">{post.author.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {post.author.name}
              </span>
              {post.type === 'proposal' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                  <BadgeCheck size={12} /> Proposal
                </span>
              )}
              {localStatus === 'passed' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Passed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#b5b3c3] font-medium">{post.timestamp}</span>
              {showPrivacyLock && !post.isPublic && (
                <span className="flex items-center gap-1 text-[10px] text-[#777587] bg-[#f2f4f6] px-1.5 py-0.5 rounded">
                  <Lock size={10} /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Context Menu ── */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#b5b3c3] hover:text-[#777587] transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <>
              {/* Invisible backdrop to catch clicks outside */}
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(25,28,30,0.1)] border border-[#f2f4f6] py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {post.canDelete ? (
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors hover:bg-red-50 text-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                    ) : post.isAuthor ? (
                      <><Trash2 size={16} /> Delete Post</>
                    ) : (
                      <><ShieldAlert size={16} /> Delete (Moderator)</>
                    )}
                  </button>
                ) : (
                  <div className="px-4 py-2 text-xs font-medium text-[#b5b3c3] text-center">
                    No actions available
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {post.type === 'photo' && post.imageUrl && (
        <div className="px-5">
          <div className="rounded-xl overflow-hidden bg-[#f2f4f6]">
            <img src={post.imageUrl} alt={post.caption || 'Post'} className="w-full object-cover max-h-[480px]" />
          </div>
        </div>
      )}

      {post.type === 'text' && post.textContent && (
        <div className="px-5">
          <div className={`aspect-square rounded-xl ${post.gradient || 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center p-8`}>
            <p className="text-white text-xl sm:text-2xl font-extrabold text-center leading-snug" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {post.textContent}
            </p>
          </div>
        </div>
      )}

      {post.type === 'proposal' && post.proposalText && (
        <div className="px-5">
          <div className={`rounded-xl p-5 ${localStatus === 'passed' ? 'bg-green-50 border border-green-200/60' : 'bg-blue-50 border border-blue-200/60'}`}>
            <p className={`text-sm font-bold leading-relaxed ${localStatus === 'passed' ? 'text-green-800' : 'text-blue-800'}`} style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {post.proposalText}
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 pb-5 pt-4 flex flex-col gap-3">
        {post.type === 'proposal' ? (
          <>
            {/* Voting Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote('up')}
                disabled={localStatus === 'passed'}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50 ${
                  voted === 'up'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-[#f2f4f6] text-[#777587] hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <ThumbsUp size={16} /> Approve
              </button>
              <button
                onClick={() => handleVote('down')}
                disabled={localStatus === 'passed'}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50 ${
                  voted === 'down'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-[#f2f4f6] text-[#777587] hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <ThumbsDown size={16} /> Reject
              </button>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#464555]">{votePercent}% approval</span>
                <span className="text-xs text-[#b5b3c3] font-medium">{post.requiredPercent || 40}% required to pass</span>
              </div>
              <div className="w-full h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    localStatus === 'passed'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-[#0434c6] to-[#3050de]'
                  }`}
                  style={{ width: `${Math.min(votePercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#b5b3c3] font-medium mt-1.5">
                {localUpvotes} of {post.totalMembers} members approved
              </p>
            </div>

            {/* Comment toggle for proposals too */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[#777587] hover:bg-[#f7f9fb] hover:text-[#464555] transition-all self-start"
            >
              <MessageCircle size={16} /> {localCommentCount} Comments
            </button>
          </>
        ) : (
          <>
            {/* Standard Like/Comment/Share */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  liked ? 'text-red-500 bg-red-50' : 'text-[#777587] hover:bg-[#f7f9fb] hover:text-[#464555]'
                }`}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {localLikeCount}
              </button>
              <button
                onClick={toggleComments}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[#777587] hover:bg-[#f7f9fb] hover:text-[#464555] transition-all"
              >
                <MessageCircle size={18} /> {localCommentCount}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[#777587] hover:bg-[#f7f9fb] hover:text-[#464555] transition-all">
                <Share2 size={18} />
              </button>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="px-1">
                <p className="text-sm text-[#464555] font-medium leading-relaxed">
                  <span className="font-extrabold text-[#191c1e] mr-1.5">{post.author.name}</span>
                  {post.caption}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Inline Comments Section ── */}
        {showComments && (
          <div className="border-t border-[#f2f4f6] pt-3 mt-1 flex flex-col gap-3">
            {loadingComments ? (
              <div className="flex justify-center py-3">
                <Loader2 size={18} className="animate-spin text-[#b5b3c3]" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-[#b5b3c3] text-center py-2">No comments yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#e0e3e5] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {c.profiles?.avatar_url ? (
                        <img src={c.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-[10px] font-extrabold text-[#0434c6]">
                          {(c.profiles?.username || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#464555]">
                        <span className="font-extrabold text-[#191c1e] mr-1">{c.profiles?.username || 'Member'}</span>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment…"
                className="flex-1 text-sm bg-[#f7f9fb] rounded-full px-4 py-2 outline-none text-[#191c1e] placeholder-[#b5b3c3] font-medium border border-[#f2f4f6] focus:border-[#0434c6]/30"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              />
              <button
                onClick={handleAddComment}
                disabled={postingComment || !commentText.trim()}
                className="w-8 h-8 rounded-full bg-[#0434c6] text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
              >
                {postingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
