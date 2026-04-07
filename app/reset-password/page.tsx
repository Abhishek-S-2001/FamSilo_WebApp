'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if we arrived via a recovery link
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        console.log("Password recovery mode active");
      }
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccessMessage('Password has been successfully updated. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update password. Ensure your reset link is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans bg-gradient-to-br from-[#f7f9fb] to-[#dee1ff] text-[#191c1e] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-[0_30px_60px_rgba(25,28,30,0.06)] border border-white/60 z-10">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#0434c6] flex items-center justify-center text-white shadow-md mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-[#191c1e] tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            New Password
          </h2>
          <p className="text-[#464555] font-medium text-sm mt-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Almost there! Enter your new secure password below to regain access to your silo.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#464555] ml-1" style={{ fontFamily: '"Manrope", sans-serif' }}>New Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 pl-12 pr-12 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/50 focus:bg-white transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587]"
                placeholder="••••••••"
              />
              <Lock size={18} className="absolute left-4 top-4 text-[#777587]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-[#777587] hover:text-[#191c1e] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-[#93000a] text-sm text-center bg-[#ffdad6]/80 p-3 rounded-xl font-bold border-none backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="text-[#0e5c2e] text-sm text-center bg-[#c4eed0]/80 p-3 rounded-xl font-bold border-none backdrop-blur-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="w-full py-3.5 bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold rounded-full shadow-[0_10px_25px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {isLoading ? 'Updating...' : 'Set Password'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

      </div>
    </div>
  );
}
