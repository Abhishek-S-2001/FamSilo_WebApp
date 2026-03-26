'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '@/lib/axios';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSaved: () => void; // triggers SWR revalidation
}

const inputClass = "w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-[#0434c6] outline-none transition-all";
const toggleClass = "w-11 h-6 bg-[#e0e3e5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0434c6]";

export default function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    display_name: '', username: '', bio: '', location: '', pronouns: '',
    family_role: '', dob: '', hobbies: '',
    show_location: true, show_dob: true, show_hobbies: true,
  });

  // Populate form from profile on mount
  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name || profile.username || '',
      username: profile.username || '',
      bio: profile.bio || '',
      location: profile.location || '',
      pronouns: profile.pronouns || '',
      family_role: profile.family_role || '',
      dob: profile.dob ? profile.dob.split('T')[0] : '',
      hobbies: profile.hobbies?.length ? profile.hobbies.join(', ') : '',
      show_location: profile.show_location ?? true,
      show_dob: profile.show_dob ?? true,
      show_hobbies: profile.show_hobbies ?? true,
    });
  }, [profile]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const hobbies = form.hobbies.split(',').map(h => h.trim()).filter(Boolean);
      await api.put('/users/me', { ...form, hobbies, dob: form.dob || null });
      onSaved(); // tell SWR to revalidate
      onClose();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#191c1e]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#f2f4f6] flex items-center justify-between bg-white/50">
          <h2 className="text-xl font-extrabold text-[#191c1e]">Edit Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#777587] hover:text-[#191c1e] hover:bg-[#e0e3e5] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 max-h-[70vh] no-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">{errorMsg}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Display Name</label>
              <input type="text" value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="e.g. Abhishek Sharma" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Username</label>
                <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">1 change per week</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5b3c3] font-bold text-sm">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  className="w-full bg-[#f2f4f6] border border-transparent rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-[#0434c6] focus:bg-white focus:border-[#0434c6] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Family Role</label>
              <input type="text" value={form.family_role} onChange={e => set('family_role', e.target.value)} placeholder="e.g. The Tech Guy" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">Pronouns</label>
              <input type="text" value={form.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="e.g. He/Him" className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#777587] uppercase tracking-widest">About Me</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} className="w-full bg-[#f2f4f6] border border-transparent rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:bg-white focus:border-[#0434c6] transition-all" />
          </div>

          {/* Privacy Toggles */}
          <div className="flex flex-col gap-5 pt-4 border-t border-[#f2f4f6]">
            <h4 className="text-sm font-extrabold text-[#191c1e]">Profile Privacy</h4>

            {[
              { label: 'Location', field: 'location', toggleField: 'show_location', type: 'text', placeholder: 'Noida, UP' },
              { label: 'Date of Birth', field: 'dob', toggleField: 'show_dob', type: 'date', placeholder: '' },
              { label: 'Hobbies', field: 'hobbies', toggleField: 'show_hobbies', type: 'text', placeholder: 'Python, Hiking' },
            ].map(({ label, field, toggleField, type, placeholder }) => (
              <div key={field} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#464555]">{label}</span>
                  <input
                    type={type}
                    value={(form as any)[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className="mt-1 bg-[#f2f4f6] rounded-md px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <label className="flex items-center cursor-pointer relative">
                  <input
                    type="checkbox"
                    checked={(form as any)[toggleField]}
                    onChange={e => set(toggleField, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={toggleClass} />
                </label>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#f2f4f6] bg-white/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full bg-white text-[#464555] font-bold text-sm hover:bg-[#f2f4f6] transition-colors shadow-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0434c6] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(4,52,198,0.25)] hover:bg-[#3050de] hover:scale-105 active:scale-95 transition-all">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}