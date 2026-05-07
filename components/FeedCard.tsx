'use client';

import { useState, useCallback } from 'react';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp, ThumbsDown,
  BadgeCheck, CheckCircle2, Send, Loader2, Trash2, ShieldAlert, MapPin,
  Lock, Clock, ShieldX
} from 'lucide-react';
import api from '@/lib/axios';
import MediaCard from './MediaCard';

export interface Post {
  id: string;
  type: 'photo' | 'text' | 'proposal' | 'video';
  author: { name: string; avatar?: string };
  timestamp: string;
  imageUrl?: string;
  caption?: string;
  videoUrl?: string;
  textContent?: string;
  gradient?: string;
  proposalText?: string;
  proposalStatus?: string;
  upvotes?: number;
  downvotes?: number;
  totalMembers?: number;
  requiredPercent?: number;
  myVote?: 'up' | 'down' | null;
  likeCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  isPublic?: boolean;
  isAuthor?: boolean;
  canDelete?: boolean;
  siloName?: string;
  siloId?: string;
  moderationStatus?: 'approved' | 'pending' | 'quarantined';
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

  // Animation states
  const [likeSpring, setLikeSpring] = useState(false);
  const [voteSpring, setVoteSpring] = useState<'up' | 'down' | null>(null);

  // Comment section state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Menu / Delete state
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Like Handler ──
  const handleLike = async () => {
    setLiked(!liked);
    setLocalLikeCount(c => liked ? c - 1 : c + 1);
    setLikeSpring(true);
    setTimeout(() => setLikeSpring(false), 500);
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(liked);
      setLocalLikeCount(c => liked ? c + 1 : c - 1);
    }
  };

  // ── Vote Handler ──
  const handleVote = async (dir: 'up' | 'down') => {
    if (localStatus === 'passed') return;
    const prevVote = voted;
    const prevUpvotes = localUpvotes;
    if (prevVote === dir) return;
    let newUpvotes = localUpvotes;
    if (prevVote === 'up') newUpvotes -= 1;
    if (dir === 'up') newUpvotes += 1;
    setVoted(dir);
    setLocalUpvotes(newUpvotes);
    setVoteSpring(dir);
    setTimeout(() => setVoteSpring(null), 500);
    try {
      const res = await api.post(`/posts/${post.id}/vote`, { vote: dir });
      setLocalUpvotes(res.data.upvotes);
      if (res.data.proposal_status === 'passed') setLocalStatus('passed');
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
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data.comments || []);
      setCommentText('');
      setLocalCommentCount(c => c + 1);
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

  const votePercent = post.totalMembers && post.totalMembers > 0
    ? Math.round((localUpvotes / post.totalMembers) * 100)
    : 0;

  return (
    <div className="
      bg-[var(--bg-card)] rounded-2xl overflow-hidden flex flex-col relative
      border border-[var(--border-subtle)]
      shadow-[var(--shadow-card)]
      dark:border-[var(--border-default)]
      animate-feed-card
      transition-colors duration-200
    ">

      {/* ── Moderation Banners ── */}
      {post.moderationStatus === 'pending' && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/40">
          <Loader2 size={13} className="animate-spin text-amber-500 flex-shrink-0" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Pending Review — visible only to you until approved
          </span>
        </div>
      )}
      {post.moderationStatus === 'quarantined' && post.isAuthor && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/40">
          <ShieldX size={13} className="text-red-500 flex-shrink-0" />
          <span className="text-xs font-bold text-red-700 dark:text-red-400">
            Flagged by content moderation — this post is not visible to others
          </span>
        </div>
      )}

      {/* ── Origin Silo Badge ── */}
      {showOriginSilo && post.siloName && (
        <div className="px-5 pt-4 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--brand-soft)] rounded-full">
            <MapPin size={12} className="text-[var(--brand)]" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {post.siloName}
            </span>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-5 ${showOriginSilo ? 'pt-2' : 'pt-5'} pb-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300 uppercase">
                {post.author.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-[var(--text-primary)]">{post.author.name}</span>
              {post.type === 'proposal' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  <BadgeCheck size={12} /> Proposal
                </span>
              )}
              {localStatus === 'passed' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Passed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[var(--text-faint)] font-medium">{post.timestamp}</span>
              {showPrivacyLock && !post.isPublic && (
                <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--bg-input)] px-1.5 py-0.5 rounded">
                  <Lock size={10} /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full hover:bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-default)] py-1.5 z-50 shadow-[var(--shadow-float)] dark:shadow-none animate-slide-up-fade overflow-hidden">
                {post.canDelete ? (
                  <button onClick={() => { setShowMenu(false); handleDelete(); }} disabled={isDeleting}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50">
                    {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                      : post.isAuthor ? <><Trash2 size={16} /> Delete Post</>
                      : <><ShieldAlert size={16} /> Delete (Moderator)</>}
                  </button>
                ) : (
                  <div className="px-4 py-2 text-xs font-medium text-[var(--text-faint)] text-center">No actions available</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {post.type === 'photo' && post.imageUrl && (
        <div className="px-5">
          <MediaCard>
            <img src={post.imageUrl} alt={post.caption || 'Post'} className="w-full object-cover max-h-[480px]" />
          </MediaCard>
        </div>
      )}

      {post.type === 'video' && post.videoUrl && (
        <div className="px-5">
          <MediaCard maxTilt={4}>
            <video src={post.videoUrl} controls preload="metadata" className="w-full max-h-[480px] object-contain bg-black" />
          </MediaCard>
        </div>
      )}

      {post.type === 'text' && post.textContent && (
        <div className="px-5">
          <div className={`aspect-square rounded-xl ${post.gradient || 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center p-8`}>
            <p className="text-white text-xl sm:text-2xl font-extrabold text-center leading-snug">
              {post.textContent}
            </p>
          </div>
        </div>
      )}

      {post.type === 'proposal' && post.proposalText && (
        <div className="px-5">
          <div className={`rounded-xl p-5 ${localStatus === 'passed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
            <p className={`text-sm font-bold leading-relaxed ${localStatus === 'passed' ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'}`}>
              {post.proposalText}
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 pb-5 pt-4 flex flex-col gap-3">
        {post.type === 'proposal' ? (
          <>
            {/* Vote Buttons */}
            <div className="flex items-center gap-3">
              {(['up', 'down'] as const).map(dir => (
                <button key={dir} onClick={() => handleVote(dir)} disabled={localStatus === 'passed'}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50 ${
                    voteSpring === dir ? 'animate-spring' : ''
                  } ${
                    voted === dir
                      ? dir === 'up' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                                     : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                      : dir === 'up' ? 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
                                     : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                  }`}>
                  {dir === 'up' ? <><ThumbsUp size={16} /> Approve</> : <><ThumbsDown size={16} /> Reject</>}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text-secondary)]">{votePercent}% approval</span>
                <span className="text-xs text-[var(--text-faint)] font-medium">{post.requiredPercent || 40}% required</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${localStatus === 'passed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-[var(--brand)] to-[var(--brand-medium)]'}`}
                  style={{ width: `${Math.min(votePercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-faint)] font-medium mt-1.5">
                {localUpvotes} of {post.totalMembers} members approved
              </p>
            </div>

            <button onClick={toggleComments}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-secondary)] transition-all self-start">
              <MessageCircle size={16} /> {localCommentCount} Comments
            </button>
          </>
        ) : (
          <>
            {/* Standard Like/Comment/Share */}
            <div className="flex items-center gap-1">
              <button onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${likeSpring ? 'animate-spring' : ''} ${
                  liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-secondary)]'
                }`}>
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {localLikeCount}
              </button>
              <button onClick={toggleComments}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-secondary)] transition-all">
                <MessageCircle size={18} /> {localCommentCount}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-secondary)] transition-all">
                <Share2 size={18} />
              </button>
            </div>

            {post.caption && (
              <div className="px-1">
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  <span className="font-extrabold text-[var(--text-primary)] mr-1.5">{post.author.name}</span>
                  {post.caption}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Inline Comments ── */}
        {showComments && (
          <div className="border-t border-[var(--border-subtle)] pt-3 mt-1 flex flex-col gap-3">
            {loadingComments ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map(i => <div key={i} className="skeleton h-8 w-full rounded-xl" />)}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-[var(--text-faint)] text-center py-2">No comments yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto thin-scrollbar">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2.5 animate-slide-up-fade">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {c.profiles?.avatar_url ? (
                        <img src={c.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                          {(c.profiles?.username || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)]">
                        <span className="font-extrabold text-[var(--text-primary)] mr-1">{c.profiles?.username || 'Member'}</span>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="text" value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment…"
                className="flex-1 text-sm bg-[var(--bg-input)] rounded-full px-4 py-2 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-faint)] font-medium border border-[var(--border-default)] focus:border-[var(--brand)] transition-colors"
              />
              <button onClick={handleAddComment} disabled={postingComment || !commentText.trim()}
                className="w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40">
                {postingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
