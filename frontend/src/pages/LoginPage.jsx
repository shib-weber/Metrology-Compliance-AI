import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate(data.role === 'inspector' ? '/inspector' : '/citizen');
      } else {
        setErrorMessage(data.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('Network error: Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full flex items-center justify-center px-4 py-12 overflow-hidden bg-[radial-gradient(65%_55%_at_50%_25%,rgba(99,102,241,0.35)_0%,rgba(30,27,75,0)_100%),radial-gradient(120%_90%_at_50%_10%,#1e1b4b_0%,#0f172a_100%)]">
      
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
        <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_45%,rgba(15,23,42,0.1)_20%,rgba(15,23,42,0.65)_100%),linear-gradient(180deg,rgba(15,23,42,0.5)_0%,rgba(15,23,42,0.05)_30%,rgba(15,23,42,0.25)_70%,rgba(15,23,42,0.85)_100%)]" />
      </div>

      <div className="w-full max-w-md bg-slate-900/70 border border-white/20 backdrop-blur-2xl p-7 sm:p-9 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-300/40 text-[11px] font-semibold tracking-wider text-indigo-200 uppercase shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Statutory Session
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Access <span className="bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">Portal</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1">
              Sign in to your Metronox compliance workstation
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-200 font-semibold uppercase tracking-wider pl-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-slate-950/60 border border-white/15 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition backdrop-blur-md"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-200 font-semibold uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-slate-950/60 border border-white/15 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition backdrop-blur-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-3 rounded-full text-sm transition-all duration-300 shadow-[0_8px_24px_rgba(99,102,241,0.45)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-slate-300">
            Don't have an enforcement account?{' '}
            <Link to="/signup" className="text-indigo-300 hover:text-white font-semibold transition underline underline-offset-4 decoration-indigo-400/40 hover:decoration-indigo-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}