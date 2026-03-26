'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';

// We wrap the component in Suspense because we are reading URL parameters
function JoinHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('Verifying your invitation...');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid invitation link.');
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    const processInvite = async () => {
      // 1. Get token and ensure it's not the string "undefined"
      const authToken = localStorage.getItem('family_app_token');

      if (!authToken || authToken === 'undefined') {
        console.log("No valid auth token found. Redirecting to login...");
        setStatus('Please log in or sign up to accept this invite...');
        sessionStorage.setItem('pending_invite_token', token);
        
        // Hard redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return;
      }

      // 2. LOGGED IN: Hit the backend to join!
      try {
        console.log("Auth token found! Attempting to join silo...");
        setStatus('Adding you to the family vault...');
        
        const response = await api.post('/silos/join', { token });
        console.log("Successfully joined!", response.data);
        
        // Success! Redirect them straight into their new Silo dashboard
        const siloId = response.data.silo_id;
        window.location.href = `/silo/${siloId}`;
        
      } catch (error: any) {
        console.error("Join Error:", error.response?.data || error);
        setStatus(error.response?.data?.detail || 'This invitation is invalid or has already been used.');
        
        // Send them to the dashboard after a few seconds so they aren't stuck
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    processInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="animate-spin text-[#0434c6]" size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#191c1e] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          FamSilo
        </h1>
        <p className="text-[#464555] font-medium">{status}</p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fb]" />}>
      <JoinHandler />
    </Suspense>
  );
}