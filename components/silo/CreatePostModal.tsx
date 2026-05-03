'use client';

import { useState, useRef } from 'react';
import { X, ImagePlus, Type, UploadCloud, Loader2, Megaphone, Globe, Lock, Video, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface NewPostPayload {
  type: 'photo' | 'text' | 'proposal' | 'video';
  caption: string;
  imageFile?: File;
  videoFile?: File;
  gradient?: string;
  isPublic: boolean;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (post: NewPostPayload) => Promise<void>;
}

const GRADIENT_SWATCHES = [
  'bg-gradient-to-br from-blue-500 to-purple-600',
  'bg-gradient-to-br from-orange-400 to-pink-500',
  'bg-gradient-to-br from-emerald-400 to-cyan-500',
  'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  'bg-gradient-to-br from-amber-400 to-red-500',
];

const SWATCH_PREVIEW_COLORS = [
  'from-blue-500 to-purple-600',
  'from-orange-400 to-pink-500',
  'from-emerald-400 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
  'from-amber-400 to-red-500',
];

// File size limits
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;  // 10 MB
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

type PostMode = 'photo' | 'text' | 'proposal' | 'video';

type UploadStage = 'idle' | 'uploading' | 'saving' | 'done';

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [mode, setMode] = useState<PostMode>('photo');
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);

  // Upload progress states
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [uploadProgress, setUploadProgress] = useState(0); // 0–100

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isPosting = uploadStage !== 'idle';

  // ─── Validate & Set File ───
  const applyFile = (file: File, type: 'image' | 'video') => {
    setFileError(null);
    const limit = type === 'image' ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
    const limitLabel = type === 'image' ? '10 MB' : '100 MB';

    if (file.size > limit) {
      setFileError(`File too large. Maximum size for ${type}s is ${limitLabel}.`);
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file, 'image');
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file, 'video');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (mode === 'photo' && file.type.startsWith('image/')) {
      applyFile(file, 'image');
    } else if (mode === 'video' && file.type.startsWith('video/')) {
      applyFile(file, 'video');
    } else {
      setFileError(`Please drop a ${mode === 'photo' ? 'image' : 'video'} file.`);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setFileError(null);
  };

  // ─── Validation ───
  const canPost = () => {
    if (fileError) return false;
    if (mode === 'photo') return !!selectedFile;
    if (mode === 'video') return !!selectedFile;
    if (mode === 'text') return !!textContent.trim();
    if (mode === 'proposal') return !!proposalText.trim();
    return false;
  };

  // ─── Submit ───
  const handlePost = async () => {
    if (!onSubmit) return;
    setUploadStage('uploading');
    setUploadProgress(0);

    // Simulate progress during the upload phase
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 85) { clearInterval(progressInterval); return p; }
        return p + (mode === 'video' ? 3 : 8);
      });
    }, 250);

    const payload: NewPostPayload = {
      type: mode,
      caption:
        mode === 'photo' ? caption :
        mode === 'video' ? caption :
        mode === 'text' ? textContent :
        proposalText,
      imageFile: mode === 'photo' ? selectedFile || undefined : undefined,
      videoFile: mode === 'video' ? selectedFile || undefined : undefined,
      gradient: mode === 'text' ? GRADIENT_SWATCHES[selectedGradient] : undefined,
      isPublic,
    };

    try {
      await onSubmit(payload);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStage('done');
      setTimeout(() => {
        resetAndClose();
      }, 600);
    } catch {
      clearInterval(progressInterval);
      setUploadStage('idle');
      setUploadProgress(0);
    }
  };

  const resetAndClose = () => {
    setCaption('');
    setTextContent('');
    setProposalText('');
    clearFile();
    setMode('photo');
    setSelectedGradient(0);
    setIsPublic(true);
    setUploadStage('idle');
    setUploadProgress(0);
    onClose();
  };

  const MODES: { key: PostMode; label: string; icon: React.ReactNode }[] = [
    { key: 'photo', label: 'Photo', icon: <ImagePlus size={15} /> },
    { key: 'video', label: 'Video', icon: <Video size={15} /> },
    { key: 'text', label: 'Text', icon: <Type size={15} /> },
    { key: 'proposal', label: 'Proposal', icon: <Megaphone size={15} /> },
  ];

  const progressLabel =
    uploadStage === 'uploading' ? (mode === 'video' ? 'Uploading video…' : 'Uploading…') :
    uploadStage === 'saving' ? 'Saving post…' :
    uploadStage === 'done' ? 'Posted!' : '';

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#191c1e]/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={isPosting ? undefined : resetAndClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_40px_80px_rgba(25,28,30,0.15)] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <h2 className="text-xl font-extrabold text-[#191c1e] tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Create Post
          </h2>
          <button
            onClick={resetAndClose}
            disabled={isPosting}
            className="w-9 h-9 bg-[#f2f4f6] text-[#777587] rounded-full flex items-center justify-center hover:bg-[#e0e3e5] hover:text-[#191c1e] transition-colors disabled:opacity-40"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Mode Toggle (4 tabs) ── */}
        <div className="px-8 pb-5">
          <div className="flex items-center bg-[#f2f4f6] p-1 rounded-xl w-fit gap-0.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); clearFile(); }}
                disabled={isPosting}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m.key
                    ? 'bg-white text-[#0434c6] shadow-sm'
                    : 'text-[#777587] hover:text-[#464555]'
                }`}
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="px-8 pb-4 flex flex-col gap-4 max-h-[55vh] overflow-y-auto">

          {/* ─ PHOTO MODE ─ */}
          {mode === 'photo' && (
            <>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#f2f4f6]">
                  <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                  <button
                    onClick={clearFile}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e0e3e5] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0434c6]/30 hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0434c6]/10 transition-colors">
                    <UploadCloud size={24} className="text-[#777587] group-hover:text-[#0434c6] transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-[#464555] mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs text-[#b5b3c3] font-medium">JPEG · PNG · WebP · Max 10 MB</span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[#191c1e] text-sm font-medium resize-none outline-none placeholder-[#b5b3c3] px-1"
                placeholder="Write a caption…"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              />
            </>
          )}

          {/* ─ VIDEO MODE ─ */}
          {mode === 'video' && (
            <>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#f2f4f6] bg-black">
                  <video
                    src={preview}
                    controls
                    className="w-full max-h-72 object-contain"
                    preload="metadata"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e0e3e5] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0434c6]/30 hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0434c6]/10 transition-colors">
                    <Video size={24} className="text-[#777587] group-hover:text-[#0434c6] transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-[#464555] mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs text-[#b5b3c3] font-medium">MP4 · WebM · Max 100 MB</span>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </div>
              )}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-[#191c1e] text-sm font-medium resize-none outline-none placeholder-[#b5b3c3] px-1"
                placeholder="Write a caption…"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              />
            </>
          )}

          {/* ─ TEXT MODE ─ */}
          {mode === 'text' && (
            <>
              <div className={`relative aspect-square rounded-2xl ${GRADIENT_SWATCHES[selectedGradient]} flex items-center justify-center p-8 overflow-hidden`}>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value.slice(0, 200))}
                  maxLength={200}
                  className="w-full h-full bg-transparent text-white text-xl sm:text-2xl font-extrabold text-center resize-none outline-none placeholder-white/50"
                  placeholder="What's on your mind?"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                />
                <span className="absolute bottom-3 right-4 text-white/40 text-xs font-bold">{textContent.length}/200</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1">
                {SWATCH_PREVIEW_COLORS.map((grad, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGradient(idx)}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex-shrink-0 transition-all border-2 ${
                      selectedGradient === idx ? 'border-[#0434c6] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* ─ PROPOSAL MODE ─ */}
          {mode === 'proposal' && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone size={18} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Democratic Proposal</span>
                </div>
                <p className="text-xs text-amber-600/80 font-medium leading-relaxed mb-4">
                  If ≥ 40% of the silo members upvote this proposal, the action will be considered passed.
                </p>
                <textarea
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-white text-[#191c1e] text-sm font-medium resize-none outline-none placeholder-[#b5b3c3] p-4 rounded-xl border border-amber-200/60 focus:ring-2 focus:ring-amber-300/50"
                  placeholder="Describe your proposal…"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                />
                <span className="text-[10px] text-amber-500 font-bold mt-1 block text-right">{proposalText.length}/500</span>
              </div>
            </div>
          )}

          {/* ─ File Error ─ */}
          {fileError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200/60 rounded-xl">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-semibold">{fileError}</p>
            </div>
          )}
        </div>

        {/* ── Progress Bar (shown during upload) ── */}
        {isPosting && (
          <div className="px-8 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#464555] flex items-center gap-1.5">
                {uploadStage === 'done'
                  ? <><CheckCircle2 size={13} className="text-green-500" /> {progressLabel}</>
                  : <><Loader2 size={13} className="animate-spin text-[#0434c6]" /> {progressLabel}</>
                }
              </span>
              <span className="text-xs text-[#b5b3c3] font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  uploadStage === 'done'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-[#0434c6] to-[#3050de]'
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Privacy Toggle + Post Button ── */}
        <div className="px-8 pb-8 pt-2 flex flex-col gap-3">
          {/* Privacy Pill */}
          {!isPosting && (
            <button
              onClick={() => setIsPublic(!isPublic)}
              className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#f2f4f6] text-xs font-bold transition-colors hover:bg-[#e0e3e5]"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              {isPublic ? (
                <><Globe size={13} className="text-[#0434c6]" /> <span className="text-[#0434c6]">Public</span></>
              ) : (
                <><Lock size={13} className="text-[#777587]" /> <span className="text-[#777587]">Private</span></>
              )}
            </button>
          )}

          <button
            onClick={handlePost}
            disabled={isPosting || !canPost()}
            className="w-full py-3.5 bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold rounded-full shadow-[0_10px_25px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100 border-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {isPosting ? (
              <><Loader2 size={18} className="animate-spin" /> {progressLabel || 'Posting…'}</>
            ) : (
              mode === 'proposal' ? 'Submit Proposal' : 'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
