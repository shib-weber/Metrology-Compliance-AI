import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 text-white font-bold tracking-tight text-lg">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Scale className="w-5 h-5" />
          </div>
          MetrologyLens AI
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === 'inspector' ? (
                <Link to="/inspector" className="flex items-center gap-1 text-slate-300 hover:text-white">
                  <LayoutDashboard className="w-4 h-4" /> Enforcement Portal
                </Link>
              ) : (
                <Link to="/citizen" className="flex items-center gap-1 text-slate-300 hover:text-white">
                  <UserCheck className="w-4 h-4" /> Citizen Scanner
                </Link>
              )}
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full uppercase font-mono">
                {user.role}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-slate-400 hover:text-rose-400">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}