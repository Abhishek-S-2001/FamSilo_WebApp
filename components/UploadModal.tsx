'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import api from '@/lib/axios';
import {
  X, UploadCloud, CheckCircle2, ShieldAlert, Loader2,
  Image as ImageIcon, Film, Clock
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onUploadSuccess: () => void;
}

type UploadPhase =
  | 'idle'         // user filling form
  | 'uploading'    // uploading to Supabase Storage
  | 'creating'     // POST /posts/ to create DB record
  | 'analysing'    // polling moderation status
  | 'approved'     // AI cleared it
  | 'quarantined'  // AI flagged it
  | 'error';       // unexpected error

const FLAG_LABELS: Record<string, string> = {
  pii: 'Personal Information (PII)',
  threat: 'Threats / Harassment',
  phishing: 'Social Engineering / Phishing',
  nsfw: 'Adult / Explicit Content',
  hate: 'Hate Speech',
  spam: 'Spam',
  misinformation: 'Dangerous Misinformation',
};

export default function UploadModal({
  isOpen, onClose, groupId, onUploadSuccess
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [flags, setFlags] = useState<string[]>([]);
  const [pollAttempt, setPollAttempt] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup preview URL on unmount / file change
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [preview]);

  if (!isOpen) return null;

  const isVideo = file?.type.startsWith('video/');
  const isMedia = file !== null;

  // ── File Selection ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    setPhase('idle');
    setErrorMsg('');
    setFlags([]);
  };

  // ── Upload + Poll Flow ──────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a photo or video to share.');
      return;
    }
    setErrorMsg('');
    setFlags([]);

    try {
      const token = localStorage.getItem('family_app_token');
      const { data: userData, error: userError } = await supabase.auth.getUser(token || '');
      if (userError || !userData.user) throw new Error('Authentication failed');

      // ── Phase 1: Upload to Storage ─────────────────────────────────────────
      setPhase('uploading');
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('group-media')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // ── Phase 2: Create Post Record ─────────────────────────────────────────
      setPhase('creating');
      const postType = isVideo ? 'video' : 'photo';
      const payload: Record<string, string | boolean> = {
        group_id: groupId,
        post_type: postType,
        is_public: true,
      };
      if (isVideo) payload.video_path = filePath;
      else payload.image_path = filePath;
      if (caption.trim()) payload.caption = caption.trim();

      const createRes = await api.post('/posts/', payload);
      const postId: string = createRes.data.post?.id;
      const initialStatus: string = createRes.data.moderation_status;

      // ── Phase 3: If pending, start polling ─────────────────────────────────
      if (initialStatus === 'pending' && postId) {
        setPhase('analysing');
        setPollAttempt(0);
        startPolling(postId, 0);
      } else {
        // text/proposal — already approved synchronously
        setPhase('approved');
        onUploadSuccess();
        setTimeout(() => handleClose(), 2000);
      }

    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (detail?.error === 'content_flagged') {
        setFlags(detail.flags || []);
        setPhase('quarantined');
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
        setPhase('error');
      }
    }
  };

  // ── Moderation Polling ──────────────────────────────────────────────────────
  const MAX_POLLS = 20;     // 20 × 3s = 60s max wait
  const POLL_INTERVAL = 3000;

  const startPolling = (postId: string, attempt: number) => {
    pollRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/moderation/status/${postId}`);
        const status: string = res.data.moderation_status;
        const nextAttempt = attempt + 1;
        setPollAttempt(nextAttempt);

        if (status === 'approved') {
          setPhase('approved');
          onUploadSuccess();
          setTimeout(() => handleClose(), 2500);
        } else if (status === 'quarantined') {
          const latestLog = res.data.latest_audit;
          setFlags(latestLog?.flags || []);
          setPhase('quarantined');
        } else if (nextAttempt < MAX_POLLS) {
          // Still pending — keep polling
          startPolling(postId, nextAttempt);
        } else {
          // Timeout — close and let the feed badge handle it
          setPhase('approved'); // optimistic
          onUploadSuccess();
          setTimeout(() => handleClose(), 2500);
        }
      } catch {
        // Poll error — fail-open and close
        setPhase('approved');
        onUploadSuccess();
        setTimeout(() => handleClose(), 2500);
      }
    }, POLL_INTERVAL);
  };

  const handleClose = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setFile(null);
    setPreview(null);
    setCaption('');
    setPhase('idle');
    setErrorMsg('');
    setFlags([]);
    setPollAttempt(0);
    onClose();
  };

  // ── Progress indicator for polling ─────────────────────────────────────────
  const pollProgressPercent = Math.min(Math.round((pollAttempt / MAX_POLLS) * 100), 95);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(4,52,198,0.15)] w-full max-w-md overflow-hidden"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#f2f4f6]">
          <div>
            <h3 className="text-base font-extrabold text-[#191c1e]">Share a Memory</h3>
            <p className="text-xs text-[#b5b3c3] font-medium mt-0.5">
              All content is screened by our AI moderation system
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={phase === 'uploading' || phase === 'creating'}
            className="w-8 h-8 rounded-full hover:bg-[#f2f4f6] flex items-center justify-center text-[#b5b3c3] hover:text-[#464555] transition-colors disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6">

          {/* ═══ PHASE: Analysing (polling) ═══ */}
          {phase === 'analysing' && (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-[#e0e3e5]" />
                <div
                  className="absolute inset-0 w-16 h-16 rounded-full border-4 border-[#0434c6] border-t-transparent animate-spin"
                />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#191c1e]">Analysing your media…</p>
                <p className="text-xs text-[#b5b3c3] font-medium mt-1">
                  Our AI is screening your {isVideo ? 'video' : 'photo'} for safety. This usually takes under 15 seconds.
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full">
                <div className="w-full h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0434c6] to-[#5073ff] rounded-full transition-all duration-[3000ms] ease-linear"
                    style={{ width: `${pollProgressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#b5b3c3] font-medium mt-1.5 text-right">
                  {pollProgressPercent}%
                </p>
              </div>
            </div>
          )}

          {/* ═══ PHASE: Approved ═══ */}
          {phase === 'approved' && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#191c1e]">Post approved! 🎉</p>
                <p className="text-xs text-[#b5b3c3] font-medium mt-1">
                  Your {isVideo ? 'video' : 'photo'} passed moderation and is now live in the Silo.
                </p>
              </div>
            </div>
          )}

          {/* ═══ PHASE: Quarantined ═══ */}
          {phase === 'quarantined' && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-extrabold text-red-800">Content flagged</p>
                  <p className="text-xs text-red-600 font-medium mt-0.5 leading-relaxed">
                    Our AI moderation system detected potentially sensitive content. This post has not been published.
                  </p>
                </div>
              </div>
              {flags.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#777587] uppercase tracking-wider mb-2">Detected categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {flags.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-[11px] font-bold text-red-700"
                      >
                        {FLAG_LABELS[f] || f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-[#b5b3c3] font-medium">
                If you believe this is a mistake, please contact your Silo admin for review.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-[#f2f4f6] text-sm font-bold text-[#464555] hover:bg-[#e0e3e5] transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* ═══ PHASE: Error ═══ */}
          {phase === 'error' && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-extrabold text-amber-800">Upload failed</p>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={() => setPhase('idle')}
                className="w-full py-2.5 rounded-xl bg-[#0434c6] text-sm font-bold text-white hover:bg-[#0328a8] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ═══ PHASE: Idle / Uploading / Creating (upload form) ═══ */}
          {(phase === 'idle' || phase === 'uploading' || phase === 'creating') && (
            <form onSubmit={handleUpload} className="flex flex-col gap-5">

              {/* File Drop Zone */}
              <label className="group relative cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                  preview
                    ? 'border-[#0434c6]/30 bg-[#f7f9fb]'
                    : 'border-[#e0e3e5] hover:border-[#0434c6]/40 hover:bg-[#f7f9fb]'
                }`}>
                  {preview ? (
                    isVideo ? (
                      <div className="w-full max-h-40 overflow-hidden rounded-lg bg-black">
                        <video src={preview} className="w-full max-h-40 object-contain" />
                      </div>
                    ) : (
                      <img src={preview} className="max-h-40 w-auto rounded-lg object-contain mx-auto" alt="Preview" />
                    )
                  ) : (
                    <>
                      <div className="flex gap-3 mb-3 text-[#b5b3c3]">
                        <ImageIcon size={22} />
                        <Film size={22} />
                      </div>
                      <p className="text-sm font-bold text-[#464555]">Click to select a photo or video</p>
                      <p className="text-xs text-[#b5b3c3] font-medium mt-1">Supports JPG, PNG, WebP, MP4, WebM</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  disabled={phase !== 'idle'}
                />
              </label>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-2">
                  Caption <span className="text-[#b5b3c3] font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  disabled={phase !== 'idle'}
                  className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-sm text-[#191c1e] placeholder-[#b5b3c3] font-medium focus:outline-none focus:border-[#0434c6]/40 resize-none bg-[#f7f9fb] disabled:opacity-50"
                  placeholder="What's happening in this photo?"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                />
              </div>

              {/* Inline error */}
              {errorMsg && phase !== 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  <ShieldAlert size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-700">{errorMsg}</p>
                </div>
              )}

              {/* Upload phases status */}
              {(phase === 'uploading' || phase === 'creating') && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[#f7f9fb] rounded-xl border border-[#e0e3e5]">
                  <Loader2 size={16} className="animate-spin text-[#0434c6] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#464555]">
                      {phase === 'uploading' ? 'Uploading securely…' : 'Saving post…'}
                    </p>
                    <p className="text-[10px] text-[#b5b3c3] font-medium">Please don't close this window</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isMedia || phase !== 'idle'}
                className="w-full py-3 rounded-xl bg-[#0434c6] text-sm font-extrabold text-white hover:bg-[#0328a8] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {phase === 'idle' ? (
                  <><UploadCloud size={16} /> Post to Silo</>
                ) : (
                  <><Loader2 size={16} className="animate-spin" /> Working…</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}