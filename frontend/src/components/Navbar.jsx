import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  LogOut, 
  LayoutDashboard, 
  UserCheck, 
  Menu, 
  X, 
  ArrowRight 
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Overview', href: '/overview' },
  { label: 'Rules 2011 Engine', href: '/rules' },
  { label: '3D Digital Twins', href: '/twins' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isDashboardRoute = location.pathname.startsWith('/inspector') || 
                           location.pathname.startsWith('/citizen');

  const isAuthenticated = Boolean(
    user && 
    (user.role || user.email || user.name || user.token || user.id)
  );

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout();
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      setOpen(false);
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 text-white font-bold tracking-tight text-base shrink-0 group"
        >
          <div className="p-2 bg-indigo-600/90 group-hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 border border-indigo-400/30 transition-all">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-base font-extrabold tracking-tight">Metronox</span>
            {isDashboardRoute && (
              <span className="text-[9px] text-indigo-400 font-mono font-semibold tracking-wider uppercase mt-0.5">
                Portal
              </span>
            )}
          </div>
        </Link>

        {/* Center Navigation Rail */}
        {!isDashboardRoute && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 border border-white/10 p-1 rounded-full backdrop-blur-md" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role && (
                <span className="text-[11px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full uppercase font-mono font-semibold">
                  {user.role}
                </span>
              )}
              
              {!isDashboardRoute && (
                user?.role === 'inspector' ? (
                  <Link 
                    to="/inspector" 
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold hover:border-indigo-400/40 transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" /> 
                    <span>Enforcement Portal</span>
                  </Link>
                ) : (
                  <Link 
                    to="/citizen" 
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold hover:border-indigo-400/40 transition-all shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> 
                    <span>Citizen Scanner</span>
                  </Link>
                )
              )}

              <button 
                type="button"
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold transition-all shadow-sm"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link 
                to="/login" 
                className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                <span>Launch Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl border border-white/10 bg-slate-900/80 focus:outline-none"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden w-full px-4 pt-2 pb-6 bg-slate-950/95 border-b border-white/10 backdrop-blur-2xl space-y-3">
          {!isDashboardRoute && NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30' : 'text-slate-300 hover:text-white'
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
              {!isDashboardRoute && (
                user?.role === 'inspector' ? (
                  <Link
                    to="/inspector"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-indigo-300 py-1.5 px-2 text-sm font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Enforcement Portal
                  </Link>
                ) : (
                  <Link
                    to="/citizen"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-indigo-300 py-1.5 px-2 text-sm font-semibold"
                  >
                    <UserCheck className="w-4 h-4" /> Citizen Scanner
                  </Link>
                )
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-rose-400 py-1.5 px-2 text-left text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" /> Logout ({user?.role || 'User'})
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
              <Link 
                to="/login" 
                onClick={() => setOpen(false)} 
                className="text-slate-300 py-1.5 px-2 text-sm"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setOpen(false)} 
                className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}