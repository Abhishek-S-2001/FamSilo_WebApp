'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        // Step 1: Try to extract tokens from the URL hash manually
        // Next.js App Router strips the hash before the Supabase SDK can read it,
        // so we grab it ourselves from window.location.href
        const href = window.location.href;
        const hashIndex = href.indexOf('#');

        if (hashIndex !== -1) {
          const hashString = href.substring(hashIndex + 1);
          const params = new URLSearchParams(hashString);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Manually inject the session into Supabase
            const { data: { session }, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error || !session) {
              throw new Error(error?.message || 'Supabase rejected the session tokens.');
            }

            await reconcileAndRedirect(session);
            return;
          }
        }

        // Step 2: Fallback — maybe it's a PKCE code flow with ?code= param
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          throw new Error(error?.message || 'No session found. Please try logging in again.');
        }

        await reconcileAndRedirect(session);
      } catch (err: any) {
        setErrorMsg(err.message || 'An unknown error occurred.');
      }
    };

    // Small delay to ensure the browser has fully committed the URL
    const timer = setTimeout(handleAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  async function reconcileAndRedirect(session: any) {
    // Ensure profile exists in the database for the Python backend
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id);

    if (!profiles || profiles.length === 0) {
      const name =
        session.user.user_metadata?.full_name
          ?.replace(/\s/g, '')
          .toLowerCase() ||
        session.user.email?.split('@')[0] ||
        'user';
      await supabase.from('profiles').insert({
        id: session.user.id,
        username: name + Math.floor(1000 + Math.random() * 9000),
        email: session.user.email,
        terms_accepted: false,
      });
    }

    // Save token for the Python backend axios interceptor
    localStorage.setItem('family_app_token', session.access_token);
    if (session.user?.id) localStorage.setItem('user_id', session.user.id);

    // Redirect
    const pendingInvite = sessionStorage.getItem('pending_invite_token');
    if (pendingInvite) {
      sessionStorage.removeItem('pending_invite_token');
      window.location.href = `/join?token=${pendingInvite}`;
    } else {
      window.location.href = '/';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center text-center">
        {!errorMsg ? (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-[#0434c6] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
            <p className="text-gray-500 text-sm">Please wait while we securely log you in.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-6 w-full break-words">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 bg-[#191c1e] text-white font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
