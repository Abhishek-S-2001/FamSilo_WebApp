'use client';

import { useState } from 'react';
import axios from 'axios';
import { X, Users, AlignLeft, ArrowRight } from 'lucide-react';
import api from '../lib/axios';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Trigger a feed refresh after creation
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/silos/', { name, description });
      
      setName('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create Silo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The Backdrop: Heavy blur overlay, clickable to close
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#191c1e]/30 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      
      {/* The Modal: Pure white, rounded-[3rem], massive ambient shadow. onClick stopPropagation prevents closing when clicking inside the modal */}
      <div 
        className="w-full max-w-[440px] bg-white p-10 rounded-[3rem] shadow-[0_40px_80px_rgba(25,28,30,0.15)] relative border-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-[#f2f4f6] text-[#777587] rounded-full flex items-center justify-center hover:bg-[#e0e3e5] hover:text-[#191c1e] transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mb-8 pr-8">
          <h2 className="text-3xl font-extrabold text-[#191c1e] tracking-tight mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Create a New Silo
          </h2>
          <p className="text-[#464555] font-medium text-sm leading-relaxed" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Set up a secure, private space for a specific group of family or friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#464555] ml-1" style={{ fontFamily: '"Manrope", sans-serif' }}>Silo Name</label>
            <div className="relative group">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-[#f2f4f6] border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/20 focus:bg-[#f7f9fb] transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587]"
                placeholder="e.g. The Miller Family"
              />
              <Users size={20} className="absolute left-4 top-4 text-[#777587]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#464555] ml-1" style={{ fontFamily: '"Manrope", sans-serif' }}>Short Description</label>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 pl-12 bg-[#f2f4f6] border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/20 focus:bg-[#f7f9fb] transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587] resize-none"
                placeholder="A place for our Thanksgiving recipes and summer trip photos..."
              />
              <AlignLeft size={20} className="absolute left-4 top-4 text-[#777587]" />
            </div>
          </div>

          {error && (
            <div className="text-[#93000a] text-sm text-center bg-[#ffdad6] p-3 rounded-xl font-bold border-none mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !name}
            className="w-full py-4 mt-4 bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold rounded-full shadow-[0_10px_25px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {isLoading ? 'Creating...' : 'Create Silo'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

      </div>
    </div>
  );
}