'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import SiloChatPanel from '@/components/SiloChatPanel';
import ViewProfileModal from '@/components/ViewProfileModal';
import { MapPin, Calendar, Edit3, Grid, List, Plus, Users, Network, Image as ImageIcon, Heart, X, Save, MessageCircle } from 'lucide-react';
import api from '@/lib/api';

import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import type { Area } from 'react-easy-crop';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ silos_joined: 0, known_members: 0, media_posts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [silosList, setSilosList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

//   Image Cropper
  const [cropModal, setCropModal] = useState<{ active: boolean; type: 'avatar' | 'cover'; image: string | null }>({
    active: false,
    type: 'avatar',
    image: null,
    });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // --- NEW: FLOATING CHAT STATE ---
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [activeDmName, setActiveDmName] = useState<string | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // --- EDIT MODAL & POPOVER STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<'members' | 'silos' | 'gallery' | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [isUploading, setIsUploading] = useState<'avatar' | 'cover' | null>(null);

  const [editForm, setEditForm] = useState({
    display_name: '', username: '', bio: '', location: '', pronouns: '', family_role: '', dob: '', hobbies: '',
    show_location: true, show_dob: true, show_hobbies: true,
    avatar_base64: '', cover_base64: ''
  });


// 1. Initial Selection
const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
  if (e.target.files && e.target.files.length > 0) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropModal({ active: true, type, image: reader.result as string });
      e.target.value = "";
    });
    reader.readAsDataURL(e.target.files[0]);
  }
};

// 2. Finalize Crop and Upload
const handleDoneCropping = async () => {
  try {
    const croppedImage = await getCroppedImg(cropModal.image!, croppedAreaPixels);
    
    // Call your existing upload logic with the PERFECTLY CROPPED image
    const response = await api.post('/users/me/image', {
      image_base64: croppedImage,
      type: cropModal.type
    });
    
    setProfile((prev: any) => ({
      ...prev,
      [cropModal.type === 'avatar' ? 'avatar_url' : 'cover_photo_url']: response.data.url
    }));
    setCropModal({ active: false, type: 'avatar', image: null });
  } catch (e) {
    console.error(e);
  }
};

  const handleInstantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(type);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const response = await api.post('/users/me/image', {
          image_base64: base64,
          type: type
        });
        
        // Update local state so the picture changes instantly
        setProfile((prev: any) => ({
          ...prev,
          [type === 'avatar' ? 'avatar_url' : 'cover_photo_url']: response.data.url
        }));
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };


// --- THE BULLETPROOF DM ALGORITHM ---
  const handleStartDM = (peerId: string, peerName: string) => {
    // FIX: We pull the ID straight from the securely fetched profile state!
    const currentUserId = profile?.id;
    
    if (!currentUserId) {
      console.error("Profile hasn't fully loaded yet!");
      return;
    }

    const ids = [currentUserId, peerId].sort();
    const dmRoomId = `dm_${ids[0]}_${ids[1]}`;
    
    // Open the floating drawer
    setActiveDmId(dmRoomId);
    setActiveDmName(peerName);
    setIsGlobalChatOpen(true);
    setActivePopover(null); // Close the popover for a clean UI
  };

  // --- CHECK FOR UNREAD MESSAGES ---
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const response = await api.get('/chat/inbox');
        const totalUnread = response.data.reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0);
        setHasUnreadMessages(totalUnread > 0);
      } catch (error: any) {
        // FIX: Unmask the exact error response from Python!
        console.error("Failed to check unread messages:", error.response?.data || error);
      }
    };
    
    checkUnread(); // Check instantly on load
    
    // Check again every 15 seconds in the background
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile(response.data.profile);
        setStats(response.data.stats);
        setSilosList(response.data.silos_list || []);    
        setMembersList(response.data.members_list || []); 
      } catch (error) {
        const axiosError = error as { response?: { data?: any }, message?: string };
        console.error("Failed to load profile", axiosError.response?.data || axiosError.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

const handleOpenEditModal = () => {
    setErrorMsg("");
    setEditForm({
      display_name: profile?.display_name || profile?.username || '',
      username: profile?.username || '',
      bio: profile?.bio || '', location: profile?.location || '', pronouns: profile?.pronouns || '',
      family_role: profile?.family_role || '', dob: profile?.dob ? profile.dob.split('T')[0] : '', 
      hobbies: profile?.hobbies?.length ? profile.hobbies.join(', ') : '',
      show_location: profile?.show_location ?? true,
      show_dob: profile?.show_dob ?? true,
      show_hobbies: profile?.show_hobbies ?? true,
      avatar_base64: '', cover_base64: ''
    });
    setIsEditModalOpen(true);
  };

  // Convert image file to base64 string
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_base64' | 'cover_base64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const hobbiesArray = editForm.hobbies.split(',').map(h => h.trim()).filter(h => h.length > 0);
      const payload = { ...editForm, hobbies: hobbiesArray, dob: editForm.dob || null };
      const response = await api.put('/users/me', payload);
      setProfile(response.data);
      setIsEditModalOpen(false);
    } catch (error: any) {
      // Show the Python error (like "Username taken" or "7-day rule")
      setErrorMsg(error.response?.data?.detail || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#0434c6] border-t-transparent rounded-full"></div>
      </div>
    );
  }

// Fallbacks
  const displayName = profile?.display_name || profile?.username || 'User'; 
  const userHandle = profile?.username ? `@${profile.username}` : '@user';
  const pronouns = profile?.pronouns || 'He/Him';
  const role = profile?.family_role || 'The Tech Guy';
  const bio = profile?.bio || "Software engineer by day, amateur photographer by night. Trying to document our family trips! I'm the one fixing everyone's Wi-Fi during reunions.";
  const location = profile?.location || 'Noida, UP';
  const dob = profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'August 14th';
  const hobbies = profile?.hobbies?.length > 0 ? profile.hobbies : ['Python', 'Machine Learning', 'Web Development', 'Photography'];

  const mockGalleryList = [
    "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504280390224-0062eb142f36?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop",
  ];

  return (
    <div className="bg-gradient-to-br from-[#f0f4ff] to-[#f7f9fb] min-h-screen font-sans text-[#191c1e]">
      <TopNavbar />

      <main className="pt-28 px-8 max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-24">
        <div className="col-span-1 md:col-span-3 lg:col-span-2 relative z-20">
          <Sidebar />
        </div>

        <section className="col-span-1 md:col-span-9 lg:col-span-10 flex flex-col gap-8 relative z-10">

            {/* === HERO SECTION === */}
          <div className="w-full flex flex-col">
            {/* COVER PHOTO */}
            <div className="group relative h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden shadow-sm bg-gradient-to-r from-teal-800 to-teal-600">
              {profile?.cover_photo_url ? (
                <img 
                  src={`${profile.cover_photo_url}?t=${new Date().getTime()}`} 
                  className="w-full h-full object-cover" 
                  alt="Cover" 
                />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
              )}
              
              {/* Cover Edit Overlay */}
              <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'cover')} />
                <div className="bg-white/90 p-3 rounded-full shadow-lg flex items-center gap-2">
                  {isUploading === 'cover' ? (
                    <div className="animate-spin w-5 h-5 border-2 border-[#0434c6] border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Edit3 size={18} className="text-[#0434c6]" />
                      <span className="text-xs font-bold text-[#0434c6]">Change Cover</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between px-8 -mt-12 md:-mt-16 gap-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                
                {/* AVATAR PHOTO */}
                <div className="group relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-[#f7f9fb] bg-[#e0e3e5] shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img 
                      src={`${profile.avatar_url}?t=${new Date().getTime()}`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar" 
                    />
                  ) : (
                    <span className="text-4xl md:text-5xl font-extrabold text-[#0434c6] uppercase">{displayName.charAt(0)}</span>
                  )}

                  {/* Avatar Edit Overlay */}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'avatar')} />
                    {isUploading === 'avatar' ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Edit3 size={24} className="text-white" />
                    )}
                  </label>
                </div>
                
               
                
                <div className="flex flex-col pb-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-[#464555] font-bold mt-1 text-sm md:text-base flex items-center gap-2">
                    <span className="text-[#0434c6]">{userHandle}</span> • {pronouns} • <span className="text-[#0434c6] font-extrabold">{role}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-2 flex-wrap md:flex-nowrap" ref={popoverRef}>

                {/* --- MEMBERS POPOVER --- */}
                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0434c6] flex items-center justify-center"><Users size={16} /></div>
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Members</span>
                      <span className="text-sm font-extrabold text-[#191c1e]">{stats?.known_members || 0}</span>
                    </div>
                  </button>

                  {activePopover === 'members' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-64 overflow-y-auto p-2 no-scrollbar">
                        <div className="px-3 py-2 border-b border-[#f2f4f6] mb-2">
                          <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Members</h4>
                        </div>
                        {membersList.length === 0 ? (
                           <p className="text-center text-xs text-[#b5b3c3] py-4 font-bold">No connected members yet.</p>
                        ) : (
                          membersList.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors group">
                              <div className="flex items-center gap-3">
                                
                                {/* FIX: Made the Avatar a clickable button to view the profile! */}
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setViewProfileId(member.id); 
                                    setActivePopover(null); // Optional: closes the popover when modal opens
                                  }}
                                  className="w-10 h-10 rounded-full bg-[#e0e3e5] text-[#0434c6] font-extrabold flex items-center justify-center text-sm shadow-sm border-2 border-white overflow-hidden hover:ring-2 hover:ring-[#0434c6] transition-all cursor-pointer"
                                >
                                  {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0).toUpperCase()}
                                </button>
                                
                                <div className="flex flex-col">
                                  <span className="text-sm font-extrabold text-[#191c1e]">{member.name}</span>
                                  <span className="text-[10px] font-bold text-[#777587] mt-0.5">Shared Silos: {member.shared_silos}</span>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleStartDM(member.id, member.name); }} 
                                className="w-8 h-8 rounded-full bg-white text-[#b5b3c3] hover:bg-[#0434c6] hover:text-white flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer"
                              >
                                <MessageCircle size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- SILOS POPOVER --- */}
                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === 'silos' ? null : 'silos')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Network size={16} /></div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Connected</span>
                      <span className="text-sm font-extrabold text-[#191c1e]">{stats.silos_joined} Silos Joined</span>
                    </div>
                  </button>
                
                  {activePopover === 'silos' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-64 overflow-y-auto p-2 no-scrollbar">
                        <div className="px-3 py-2 border-b border-[#f2f4f6] mb-2">
                          <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Connected Silos</h4>
                        </div>
                        {silosList.length === 0 ? (
                           <p className="text-center text-xs text-[#b5b3c3] py-4 font-bold">No Silos joined yet.</p>
                        ) : (
                          silosList.map(silo => (
                            <div key={silo.id} onClick={() => router.push(`/silo/${silo.id}`)} className="flex items-center gap-3 p-2 hover:bg-[#f2f4f6] rounded-xl transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 text-[#0434c6] font-extrabold flex items-center justify-center text-sm shadow-sm border border-white">
                                {silo.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-extrabold text-[#191c1e] truncate max-w-[160px]">{silo.name}</span>
                                <span className="text-[10px] font-bold text-[#777587] mt-0.5">{silo.members} Members Active</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- GALLERY POPOVER --- */}
                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === 'gallery' ? null : 'gallery')} className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white shadow-sm flex items-center gap-3 min-w-max hover:bg-white transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><ImageIcon size={16} /></div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-[#777587] font-bold uppercase tracking-widest">Gallery</span>
                      <span className="text-sm font-extrabold text-[#191c1e]">{stats.media_posts} Posts</span>
                    </div>
                  </button>

                  {activePopover === 'gallery' && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-[0_20px_60px_rgba(25,28,30,0.15)] border border-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-64 overflow-y-auto p-3 no-scrollbar">
                        <div className="px-1 py-1 border-b border-[#f2f4f6] mb-3">
                          <h4 className="text-xs font-extrabold text-[#191c1e] uppercase tracking-widest">Recent Uploads</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {mockGalleryList.map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer">
                              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(25,28,30,0.04)] border border-white/60 relative group">
                <button onClick={handleOpenEditModal} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#777587] hover:text-[#0434c6] opacity-0 group-hover:opacity-100 transition-all">
                  <Edit3 size={14} />
                </button>
                <h3 className="text-lg font-extrabold text-[#191c1e] mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>About Me</h3>
                <p className="text-[#464555] font-medium text-sm leading-relaxed mb-8 whitespace-pre-wrap">{bio}</p>

                <div className="flex flex-col gap-5 mb-8">
                  {/* Location (Only show if Toggle is ON AND data exists) */}
                  {profile?.show_location && profile?.location && (
                    <div className="flex items-center gap-4 text-[#464555] animate-in fade-in duration-300">
                      <MapPin size={18} className="text-[#b5b3c3]" />
                      <span className="text-sm font-bold">{profile.location}</span>
                    </div>
                  )}

                  {/* Birthday (Only show if Toggle is ON AND data exists) */}
                  {profile?.show_dob && profile?.dob && (
                    <div className="flex items-center gap-4 text-[#464555] animate-in fade-in duration-300">
                      <Calendar size={18} className="text-[#b5b3c3]" />
                      <span className="text-sm font-bold">Born {dob}</span>
                    </div>
                  )}
                </div>

                {/* Hobbies (Only show if Toggle is ON AND there are items) */}
                {profile?.show_hobbies && hobbies.length > 0 && (
                  <div className="flex flex-col gap-3 animate-in fade-in duration-500">
                    <h4 className="text-xs font-bold text-[#777587] uppercase tracking-widest">Hobbies & Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {hobbies.map((hobby: string, idx: number) => (
                        <span key={idx} className="px-4 py-2 rounded-full bg-[#f2f4f6] text-[#464555] text-xs font-extrabold border border-white hover:bg-white hover:text-[#0434c6] transition-colors cursor-default shadow-sm">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-[#191c1e]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Recent Memories</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative h-64 rounded-[2rem] overflow-hidden group shadow-sm">
                  <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Memory" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Nainital • Oct 2025</p>
                      <h3 className="text-white text-lg font-extrabold">Family Hiking Trip</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* === THE NEW FLOATING CHAT DRAWER OVERLAY === */}
      {isGlobalChatOpen && (
        <div className="fixed top-24 right-8 w-full max-w-[400px] z-[60] shadow-2xl rounded-[3rem] animate-in slide-in-from-right-8 duration-300">
          <SiloChatPanel isGlobal={true} preSelectedChatId={activeDmId} preSelectedChatName={activeDmName} />
        </div>
      )}

    {/* === GLOBAL FLOATING CHAT BUTTON === */}
      <button 
        onClick={() => {
          setIsGlobalChatOpen(!isGlobalChatOpen);
          setActiveDmId(null);
          if (!isGlobalChatOpen) setHasUnreadMessages(false);
        }} 
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#0434c6] rounded-full shadow-[0_10px_40px_rgba(4,52,198,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-[70] group"
      >
        {isGlobalChatOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} className="group-hover:animate-pulse" />
            
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
              </span>
            )}
          </div>
        )}
      </button>

      {/* === EDIT PROFILE MODAL === */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#191c1e]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-[#f2f4f6] flex items-center justify-between bg-white/50">
              <h2 className="text-xl font-extrabold text-[#191c1e]">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#777587] hover:text-[#191c1e] hover:bg-[#e0e3e5] transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 max-h-[70vh] no-scrollbar">
              
              {/* Show error messages here */}
              {errorMsg && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">{errorMsg}</div>}

              {/* IDENTITY SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Display Name</label>
                  <input 
                    type="text" 
                    value={editForm.display_name} 
                    onChange={e => setEditForm({...editForm, display_name: e.target.value})}
                    placeholder="e.g. Abhishek Sharma" 
                    className="w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-[#0434c6] outline-none transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Username Handle</label>
                    <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">1 change per week</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5b3c3] font-bold text-sm">@</span>
                    <input 
                      type="text" 
                      value={editForm.username} 
                      onChange={e => {
                        // Automatically remove spaces and symbols for a clean handle
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                        setEditForm({...editForm, username: val});
                      }}
                      className="w-full bg-[#f2f4f6] border border-transparent rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-[#0434c6] focus:bg-white focus:border-[#0434c6] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Family Role</label>
                  <input type="text" value={editForm.family_role} onChange={e => setEditForm({...editForm, family_role: e.target.value})} placeholder="e.g. The Tech Guy" className="w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Pronouns</label>
                  <input type="text" value={editForm.pronouns} onChange={e => setEditForm({...editForm, pronouns: e.target.value})} placeholder="e.g. He/Him" className="w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">About Me</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} className="w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none" />
              </div>

              {/* PRIVACY TOGGLES FOR ABOUT ME */}
              <div className="flex flex-col gap-5 pt-4 border-t border-[#f2f4f6]">
                <h4 className="text-sm font-extrabold text-[#191c1e]">Profile Privacy (About Me)</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col"><span className="text-sm font-bold text-[#464555]">Location</span><input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Noida, UP" className="mt-1 bg-[#f2f4f6] rounded-md px-3 py-1.5 text-xs outline-none" /></div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={editForm.show_location} onChange={e => setEditForm({...editForm, show_location: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0434c6]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col"><span className="text-sm font-bold text-[#464555]">Date of Birth</span><input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="mt-1 bg-[#f2f4f6] rounded-md px-3 py-1.5 text-xs outline-none" /></div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={editForm.show_dob} onChange={e => setEditForm({...editForm, show_dob: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0434c6]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col"><span className="text-sm font-bold text-[#464555]">Hobbies</span><input type="text" value={editForm.hobbies} onChange={e => setEditForm({...editForm, hobbies: e.target.value})} placeholder="Python, Hiking" className="mt-1 bg-[#f2f4f6] rounded-md px-3 py-1.5 text-xs outline-none" /></div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={editForm.show_hobbies} onChange={e => setEditForm({...editForm, show_hobbies: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0434c6]"></div>
                  </label>
                </div>
              </div>

            </form>
            <div className="px-8 py-5 border-t border-[#f2f4f6] bg-white/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-full bg-white text-[#464555] font-bold text-sm hover:bg-[#f2f4f6] transition-colors shadow-sm">Cancel</button>
              <button onClick={handleEditSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0434c6] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(4,52,198,0.25)] hover:bg-[#3050de] hover:scale-105 active:scale-95 transition-all"><Save size={16} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {cropModal.active && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl h-[400px] bg-[#191c1e] rounded-3xl overflow-hidden shadow-2xl">
            <Cropper
                image={cropModal.image!}
                crop={crop}
                zoom={zoom}
                aspect={cropModal.type === 'avatar' ? 1 : 16 / 6} // Square for DP, Landscape for Cover
                cropShape={cropModal.type === 'avatar' ? 'round' : 'rect'} // Circle UI for DP
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
            />
            </div>
            
            <div className="mt-8 flex gap-4">
            <button 
                onClick={() => setCropModal({ active: false, type: 'avatar', image: null })}
                className="px-8 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
            >
                Cancel
            </button>
            <button 
                onClick={handleDoneCropping}
                className="px-8 py-3 rounded-full bg-[#0434c6] text-white font-bold hover:bg-[#3050de] shadow-lg transition-all"
            >
                Save Crop
            </button>
            </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      <ViewProfileModal 
        userId={viewProfileId} 
        isOpen={!!viewProfileId} 
        onClose={() => setViewProfileId(null)} 
      />

    </div>
  );
}