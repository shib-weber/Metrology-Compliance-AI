import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  { label: 'Overview', href: '#overview' },
  { label: 'Rules 2011 Engine', href: '#rules' },
  { label: '3D Digital Twins', href: '#twins' },
  { label: 'Citizen Portal', href: '#health' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('Overview');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header 
      style={{ position: 'relative', zIndex: 50, flexShrink: 0 }}
      className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 text-white font-bold tracking-tight text-base shrink-0 group"
        >
          <div className="p-2 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-base">Metronox</span>
            <span className="text-[9px] text-indigo-400 font-mono font-normal tracking-wider"></span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active === link.label 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              onClick={() => setActive(link.label)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[11px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full uppercase font-mono font-medium">
                {user.role}
              </span>
              {user.role === 'inspector' ? (
                <Link to="/inspector" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-200 text-sm font-medium hover:bg-slate-800 transition">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Enforcement Portal
                </Link>
              ) : (
                <Link to="/citizen" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-200 text-sm font-medium hover:bg-slate-800 transition">
                  <UserCheck className="w-4 h-4 text-indigo-400" /> Citizen Scanner
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center p-2 rounded-lg border border-slate-700/60 bg-slate-800/40 text-rose-300 hover:text-rose-200 hover:bg-slate-800 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition">
                Sign In
              </Link>
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-md shadow-indigo-600/20">
                Launch Platform <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-slate-950 border-b border-slate-800 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-slate-300 hover:text-white text-base"
              onClick={() => {
                setActive(link.label);
                setOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
              {user.role === 'inspector' ? (
                <Link
                  to="/inspector"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-indigo-300 py-1"
                >
                  <LayoutDashboard className="w-4 h-4" /> Enforcement Portal
                </Link>
              ) : (
                <Link
                  to="/citizen"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-indigo-300 py-1"
                >
                  <UserCheck className="w-4 h-4" /> Citizen Scanner
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-rose-400 py-1 text-left"
              >
                <LogOut className="w-4 h-4" /> Logout ({user.role})
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
              <Link to="/login" onClick={() => setOpen(false)} className="text-slate-300 py-1">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium mt-2">
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}