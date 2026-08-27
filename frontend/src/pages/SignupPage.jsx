import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, AlertCircle, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setVideoReady(true);
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both a username and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate(data.role === 'inspector' ? '/inspector' : '/citizen');
      } else {
        setError(data.detail || 'Failed to register account');
      }
    } catch (err) {
      setError('Unable to reach backend server. Please ensure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full flex items-center justify-center px-4 py-12 overflow-hidden bg-[radial-gradient(65%_55%_at_50%_25%,rgba(99,102,241,0.35)_0%,rgba(30,27,75,0)_100%),radial-gradient(120%_90%_at_50%_10%,#1e1b4b_0%,#0f172a_100%)]">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? 'opacity-50' : 'opacity-0'
          }`}
        />
        
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_45%,rgba(15,23,42,0.1)_20%,rgba(15,23,42,0.65)_100%),linear-gradient(180deg,rgba(15,23,42,0.5)_0%,rgba(15,23,42,0.05)_30%,rgba(15,23,42,0.25)_70%,rgba(15,23,42,0.85)_100%)]" />
      </div>

      {/* Floating Glassmorphism Container */}
      <div className="w-full max-w-md bg-slate-900/70 border border-white/20 backdrop-blur-2xl p-7 sm:p-9 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-300/40 text-[11px] font-semibold tracking-wider text-indigo-200 uppercase shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Statutory Registration
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create <span className="bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">Account</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1">
              Join as a citizen auditor or statutory inspector
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-200 font-semibold uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                autoComplete="username"
                className="w-full bg-slate-950/60 border border-white/15 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition backdrop-blur-md"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-200 font-semibold uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="w-full bg-slate-950/60 border border-white/15 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition backdrop-blur-md"
              />
            </div>
          </div>

          {/* Role Selector Grid */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs text-slate-200 font-semibold uppercase tracking-wider pl-1 block">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3 !m-5">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md ${
                  role === 'citizen'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-slate-950/70'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" /> Citizen
              </button>

              <button
                type="button"
                onClick={() => setRole('inspector')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md ${
                  role === 'inspector'
                    ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-slate-950/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Inspector
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-3 rounded-full text-sm transition-all duration-300 shadow-[0_8px_24px_rgba(99,102,241,0.45)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-slate-300">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-300 hover:text-white font-semibold transition underline underline-offset-4 decoration-indigo-400/40 hover:decoration-indigo-300">
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}