import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, LayoutDashboard, UserCheck, Menu, X, UserPlus, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-white font-bold tracking-tight text-base sm:text-lg shrink-0"
        >
          <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg shrink-0">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="truncate">Metronox</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <>
              {user.role === 'inspector' ? (
                <Link to="/inspector" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition mr-2">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Enforcement Portal
                </Link>
              ) : (
                <Link to="/citizen" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition mr-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" /> Citizen Scanner
                </Link>
              )}
              <span className="text-[11px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase font-mono font-medium">
                {user.role}
              </span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition ml-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition hover:bg-slate-900 border border-transparent hover:border-slate-800"
              >
                <LogIn className="w-4 h-4 text-slate-400" /> Sign In
              </Link>
              <Link 
                to="/register" 
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition shadow-sm shadow-indigo-500/30"
              >
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md uppercase font-mono">
              {user.role}
            </span>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white focus:outline-none rounded-lg bg-slate-900 border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-slate-800/80 mt-3 space-y-2">
          {user ? (
            <div className="flex flex-col gap-2">
              {user.role === 'inspector' ? (
                <Link
                  to="/inspector"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Enforcement Portal
                </Link>
              ) : (
                <Link
                  to="/citizen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900 text-sm"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400" /> Citizen Scanner
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-sm transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 py-2.5 rounded-xl font-medium text-xs transition"
              >
                <LogIn className="w-4 h-4 text-slate-400" /> Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium text-xs transition shadow-sm shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}