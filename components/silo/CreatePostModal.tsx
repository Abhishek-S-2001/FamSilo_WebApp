'use client';

import { useState, useRef } from 'react';
import { X, ImagePlus, Type, UploadCloud, Loader2, Megaphone, Globe, Lock } from 'lucide-react';

export interface NewPostPayload {
  type: 'photo' | 'text' | 'proposal';
  caption: string;
  imageFile?: File;
  gradient?: string;
  isPublic: boolean;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (post: NewPostPayload) => void;
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

type PostMode = 'photo' | 'text' | 'proposal';

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [mode, setMode] = useState<PostMode>('photo');
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const canPost = () => {
    if (mode === 'photo') return !!selectedFile;
    if (mode === 'text') return !!textContent.trim();
    if (mode === 'proposal') return !!proposalText.trim();
    return false;
  };

  const handlePost = async () => {
    setIsPosting(true);
    const payload: NewPostPayload = {
      type: mode,
      caption:
        mode === 'photo' ? caption :
        mode === 'text' ? textContent :
        proposalText,
      imageFile: mode === 'photo' ? selectedFile || undefined : undefined,
      gradient: mode === 'text' ? GRADIENT_SWATCHES[selectedGradient] : undefined,
      isPublic,
    };
    onSubmit?.(payload);
    // The parent (SiloFeed) handles the async — we just reset
    setTimeout(() => {
      setIsPosting(false);
      resetAndClose();
    }, 600);
  };

  const resetAndClose = () => {
    setCaption('');
    setTextContent('');
    setProposalText('');
    setSelectedFile(null);
    setPreview(null);
    setMode('photo');
    setSelectedGradient(0);
    setIsPublic(true);
    onClose();
  };

  const MODES: { key: PostMode; label: string; icon: React.ReactNode }[] = [
    { key: 'photo', label: 'Photo', icon: <ImagePlus size={15} /> },
    { key: 'text', label: 'Text', icon: <Type size={15} /> },
    { key: 'proposal', label: 'Proposal', icon: <Megaphone size={15} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#191c1e]/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={resetAndClose}
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
          <button onClick={resetAndClose} className="w-9 h-9 bg-[#f2f4f6] text-[#777587] rounded-full flex items-center justify-center hover:bg-[#e0e3e5] hover:text-[#191c1e] transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Mode Toggle (3 tabs) ── */}
        <div className="px-8 pb-5">
          <div className="flex items-center bg-[#f2f4f6] p-1 rounded-xl w-fit">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
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
        <div className="px-8 pb-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {/* ─ PHOTO MODE ─ */}
          {mode === 'photo' && (
            <>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#f2f4f6]">
                  <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e0e3e5] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0434c6]/30 hover:bg-[#f7f9fb] transition-all group"
                >
                  <div className="w-14 h-14 bg-[#f2f4f6] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0434c6]/10 transition-colors">
                    <UploadCloud size={24} className="text-[#777587] group-hover:text-[#0434c6] transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-[#464555] mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    Drag & drop or click to upload
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5b3c3] bg-[#f2f4f6] px-2 py-0.5 rounded">16:9</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5b3c3] bg-[#f2f4f6] px-2 py-0.5 rounded">4:5</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
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
                  placeholder="Describe your proposal… e.g. 'Let's plan a family trip to Rajasthan this December!'"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                />
                <span className="text-[10px] text-amber-500 font-bold mt-1 block text-right">{proposalText.length}/500</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Privacy Toggle + Post Button ── */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          {/* Privacy Pill */}
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

          <button
            onClick={handlePost}
            disabled={isPosting || !canPost()}
            className="w-full py-3.5 bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold rounded-full shadow-[0_10px_25px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100 border-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {isPosting ? (
              <><Loader2 size={18} className="animate-spin" /> Posting…</>
            ) : (
              mode === 'proposal' ? 'Submit Proposal' : 'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
