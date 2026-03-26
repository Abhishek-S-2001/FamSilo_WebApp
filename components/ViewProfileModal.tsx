'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Calendar } from 'lucide-react';
import api from '@/lib/axios';

interface ViewProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewProfileModal({ userId, isOpen, onClose }: ViewProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      api.get(`/users/${userId}`)
        .then(res => setProfile(res.data))
        .catch(err => console.error("Failed to load profile", err))
        .finally(() => setLoading(false));
    } else {
      setProfile(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
          <X size={20} />
        </button>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#0434c6] border-t-transparent rounded-full" />
          </div>
        ) : profile ? (
          <>
            {/* Cover Photo */}
            <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-teal-800 to-teal-600 relative">
              {profile.cover_photo_url && (
                <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover opacity-90" />
              )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-8 relative -mt-12 sm:-mt-16 flex flex-col">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-[#e0e3e5] shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#0434c6] uppercase">
                    {(profile.display_name || profile.username || 'U').charAt(0)}
                  </span>
                )}
              </div>

              {/* Names */}
              <div className="mt-4 flex flex-col">
                <h2 className="text-2xl font-extrabold text-[#191c1e] tracking-tight">
                  {profile.display_name || profile.username || 'User'}
                </h2>
                <p className="text-[#464555] font-bold text-sm mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[#0434c6]">@{profile.username}</span> 
                  {profile.pronouns && <>• <span>{profile.pronouns}</span></>} 
                  {profile.family_role && <>• <span className="text-[#0434c6] font-extrabold">{profile.family_role}</span></>}
                </p>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-sm text-[#464555] font-medium leading-relaxed bg-[#f2f4f6] p-4 rounded-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Private / Scrubbed Details */}
              <div className="flex flex-col gap-3 mt-6">
                {profile.location && (
                  <div className="flex items-center gap-3 text-[#464555]">
                    <MapPin size={16} className="text-[#b5b3c3]" />
                    <span className="text-sm font-bold">{profile.location}</span>
                  </div>
                )}
                {profile.dob && (
                  <div className="flex items-center gap-3 text-[#464555]">
                    <Calendar size={16} className="text-[#b5b3c3]" />
                    <span className="text-sm font-bold">Born {profile.dob.split('T')[0]}</span>
                  </div>
                )}
              </div>

              {/* Hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="mt-6 flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Hobbies</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.hobbies.map((hobby: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-[#f2f4f6] text-[#464555] text-[11px] font-extrabold border border-white shadow-sm">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-[#777587] font-bold">Profile unavailable</div>
        )}
      </div>
    </div>
  );
}