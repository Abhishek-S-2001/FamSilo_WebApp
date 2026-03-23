'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
// ADDED: Eye and EyeOff icons
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ADDED: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear old errors

    if (!isLogin) {
      // Regex: 3-20 characters, only letters, numbers, and underscores
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        setErrorMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores (no spaces).');
        setIsLoading(false);
        return; // Stops the form from submitting!
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${apiUrl}/auth/login`, { identifier: email, password });
      } else {
        response = await axios.post(`${apiUrl}/auth/signup`, { email, password, username });
        
        if (!response.data.access_token) {
          response = await axios.post(`${apiUrl}/auth/login`, { email, password });
        }
      }

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error("Failed to retrieve access token.");
      }

      localStorage.setItem('family_app_token', access_token);
      
      const pendingInviteToken = sessionStorage.getItem('pending_invite_token');
      
      if (pendingInviteToken) {
        sessionStorage.removeItem('pending_invite_token'); 
        window.location.href = `/join?token=${pendingInviteToken}`;
      } else {
        window.location.href = '/';
      }
      
    } catch (error: any) {
      // 1. Next.js will still log this in the console, which is normal for dev!
      console.log("This error",error);
      console.error("Auth Request Failed:", error?.response?.status); 
      
      
      // 2. Extract the exact error message your Python backend sent over
      const message = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      
      // 3. Set it to your React state so the user sees it!
      setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Base: Global Gradient (Light Blue to Indigo) as per Atmospheric Layering
    <div className="font-sans bg-gradient-to-br from-[#f7f9fb] to-[#dee1ff] text-[#191c1e] min-h-screen flex flex-col relative overflow-hidden">
      <div className="hidden" aria-hidden="true">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC84zZnOJ92tw9elXuSSuUeCUOh9k7ipvR7GDivGyOWjvySf30SUmtxhVVBGtJGAF0rAi1yHYHRIZmvzAm_oVoLF9CnRHmryolhhZX6JVWSSQ2Z4fyKZjX4imUJ_7BgaID9PIVLKciz4RiqH9c7NIZ3_8CWL4W4yturzp--atC-R10YlHvxtGv447H6IibaP8d8R9onsDGyqwkZmfN5tL_isZf5pgP-_ZaSXPHGV5IgdVrIBkCxcgAUGyvzclDHFVwsTViS6sMCngVR" alt="preload" />
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1WHsGuZO9B9TXGBq_s4OIgdBfTeJS_vHk8Fq9fjxW1YpX0VZE2k15FHaWzO-U7y7VB_OiPbRIa0YV7M0SZwnZaaaSEaaCsFsRiGPF1UYR9yxrd7fZcBZe6v_vtg-P61DPTBTrQ6wXRYCLh4L63GXPG_o-Ph0P1sqxR7DBLvT75MburHf1yJEjNrjgBtmiw6Dy_XQZWd9ShvvW58H__xCb57Rt-GYDB3jIood8IFK3Eq8WANzuqQ8qUPRNSi6eSp7iZa2bISUGXSf8" alt="preload" />
      </div>
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="w-full absolute top-0 left-14 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-extrabold tracking-tight text-[#0434c6]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          FamSilo
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-[#464555] font-medium text-sm tracking-wide" style={{ fontFamily: '"Manrope", sans-serif' }}>
            {isLogin ? "New to FamSilo?" : "Already a member?"}
          </span>
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }}
            className="text-[#0434c6] font-bold hover:text-[#3050de] transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow flex flex-col md:flex-row min-h-screen pt-6 z-10 max-w-7xl mx-auto w-full items-stretch">
        
        {/* --- LEFT SECTION: VISUALS --- */}
        <section className="hidden md:flex md:w-1/2 relative p-6 lg:p-12">
          {isLogin ? (
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(25,28,30,0.1)] flex flex-col justify-end p-12">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC84zZnOJ92tw9elXuSSuUeCUOh9k7ipvR7GDivGyOWjvySf30SUmtxhVVBGtJGAF0rAi1yHYHRIZmvzAm_oVoLF9CnRHmryolhhZX6JVWSSQ2Z4fyKZjX4imUJ_7BgaID9PIVLKciz4RiqH9c7NIZ3_8CWL4W4yturzp--atC-R10YlHvxtGv447H6IibaP8d8R9onsDGyqwkZmfN5tL_isZf5pgP-_ZaSXPHGV5IgdVrIBkCxcgAUGyvzclDHFVwsTViS6sMCngVR" 
                alt="Family Gathering" 
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0434c6]/90 via-[#0434c6]/20 to-transparent"></div>
              
              <div className="relative z-10 max-w-lg w-full">
                <blockquote className="text-white">
                  <p className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 tracking-tight drop-shadow-md" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    "The best thing about memories is making them with people you love."
                  </p>
                  <cite className="text-[#c3e9f1] text-sm tracking-widest uppercase font-bold not-italic" style={{ fontFamily: '"Manrope", sans-serif' }}>
                    — Your Digital Heirloom
                  </cite>
                </blockquote>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(25,28,30,0.1)] flex flex-col justify-center p-12">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1WHsGuZO9B9TXGBq_s4OIgdBfTeJS_vHk8Fq9fjxW1YpX0VZE2k15FHaWzO-U7y7VB_OiPbRIa0YV7M0SZwnZaaaSEaaCsFsRiGPF1UYR9yxrd7fZcBZe6v_vtg-P61DPTBTrQ6wXRYCLh4L63GXPG_o-Ph0P1sqxR7DBLvT75MburHf1yJEjNrjgBtmiw6Dy_XQZWd9ShvvW58H__xCb57Rt-GYDB3jIood8IFK3Eq8WANzuqQ8qUPRNSi6eSp7iZa2bISUGXSf8" 
                alt="Multi-generational family" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0434c6]/60 via-[#0434c6]/20 to-transparent mix-blend-multiply"></div>
              
              <div className="relative z-10 max-w-lg w-full mt-auto">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 drop-shadow-md" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Preserve your <br/><span className="text-[#c3e9f1]">family legacy</span> for generations.
                </h1>
                
                <div className="mt-8 p-6 bg-white/20 backdrop-blur-[20px] rounded-2xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-white/30">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#0434c6] flex items-center justify-center text-white shadow-md">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: '"Manrope", sans-serif' }}>Private & Encrypted</span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-medium" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    Your memories stay within your circle. End-to-end security designed for family privacy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- RIGHT SECTION: THE FORM --- */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12">
          
          <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-10 lg:p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(25,28,30,0.06)] border border-white/60">
            
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-extrabold text-[#191c1e] tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {isLogin ? 'Welcome to your inner circle' : 'Create your account'}
              </h2>
              <p className="text-[#464555] font-medium text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {isLogin ? "Preserve your family's legacy in a safe space." : "Join FamSilo and start capturing the moments that matter."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Username Input (Signup Only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#464555] ml-1" style={{ fontFamily: '"Manrope", sans-serif' }}>Full Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-5 py-3.5 pl-12 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/50 focus:bg-white transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587]"
                      placeholder="Johnathan Doe"
                    />
                    <User size={18} className="absolute left-4 top-4 text-[#777587]" />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#464555] ml-1" style={{ fontFamily: '"Manrope", sans-serif' }}>
                  {isLogin ? "Email or Username" : "Email Address"}
                </label>
                <div className="relative group">
                  <input
                    type={isLogin ? "text" : "email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 pl-12 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/50 focus:bg-white transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587]"
                    placeholder={isLogin ? "sarah_miller OR name@family.com" : "name@family.com"}
                  />
                  <Mail size={18} className="absolute left-4 top-4 text-[#777587]" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-[#464555]" style={{ fontFamily: '"Manrope", sans-serif' }}>Password</label>
                  {isLogin && <a href="#" className="text-xs font-bold text-[#0434c6] hover:text-[#3050de] transition-colors" style={{ fontFamily: '"Manrope", sans-serif' }}>Forgot password?</a>}
                </div>
                <div className="relative group">
                  <input
                    // ADDED: Dynamic type based on state
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // ADDED: pr-12 to prevent text overlapping with the eye icon
                    className="w-full px-5 py-3.5 pl-12 pr-12 bg-white/50 border-none rounded-xl focus:ring-2 focus:ring-[#0434c6]/50 focus:bg-white transition-all text-[#191c1e] outline-none font-medium placeholder-[#777587]"
                    placeholder="••••••••"
                  />
                  <Lock size={18} className="absolute left-4 top-4 text-[#777587]" />
                  
                  {/* ADDED: Eye toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-[#777587] hover:text-[#191c1e] transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin && <p className="text-xs font-medium text-[#777587] px-1 mt-1" style={{ fontFamily: '"Manrope", sans-serif' }}>Must be at least 8 characters.</p>}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-[#93000a] text-sm text-center bg-[#ffdad6] p-3 rounded-xl font-bold border-none">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-gradient-to-br from-[#0434c6] to-[#3050de] text-white font-extrabold rounded-full shadow-[0_10px_25px_rgba(4,52,198,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-none"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!isLogin && !isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-4 mt-4">
              <div className="flex-grow border-t border-[#c7c4d8]/40"></div>
              <span className="flex-shrink-0 mx-4 text-[#777587] text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: '"Manrope", sans-serif' }}>or continue with</span>
              <div className="flex-grow border-t border-[#c7c4d8]/40"></div>
            </div>

            {/* Google Button - Glassmorphic */}
            <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/40 backdrop-blur-sm border border-white/60 rounded-full hover:bg-white/70 transition-colors text-sm font-bold text-[#191c1e] shadow-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}