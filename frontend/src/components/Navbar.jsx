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
  LogIn, 
  Sparkles,
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
  const location = useLocation();
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
    <header className="nav">
      <div className="nav__inner shell">
        
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
        <nav className="nav__rail" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={active === link.label ? 'is-active' : ''}
              onClick={() => setActive(link.label)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="nav__actions">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[11px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full uppercase font-mono font-medium">
                {user.role}
              </span>
              {user.role === 'inspector' ? (
                <Link to="/inspector" className="btn btn--glass">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Enforcement Portal
                </Link>
              ) : (
                <Link to="/citizen" className="btn btn--glass">
                  <UserCheck className="w-4 h-4 text-indigo-400" /> Citizen Scanner
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn--glass text-rose-300 hover:text-rose-200">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition">
                Sign In
              </Link>
              <Link to="/login" className="btn btn--primary">
                Launch Platform <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="nav__sheet">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setActive(link.label);
                setOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <div className="flex flex-col gap-2 pt-3">
              {user.role === 'inspector' ? (
                <Link
                  to="/inspector"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-indigo-300"
                >
                  <LayoutDashboard className="w-4 h-4" /> Enforcement Portal
                </Link>
              ) : (
                <Link
                  to="/citizen"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-indigo-300"
                >
                  <UserCheck className="w-4 h-4" /> Citizen Scanner
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-rose-400 pt-2"
              >
                <LogOut className="w-4 h-4" /> Logout ({user.role})
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3">
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="btn btn--primary justify-center mt-2">
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}