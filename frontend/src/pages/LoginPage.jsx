import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('inspector');
  const [password, setPassword] = useState('admin123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate(data.role === 'inspector' ? '/inspector' : '/citizen');
      } else {
        alert(data.detail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Access Portal</h2>
          <p className="text-sm text-slate-400">Select demo role: <b>inspector</b> / <b>citizen</b></p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white mt-1"
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition">
            Authenticate Session
          </button>
        </form>

        <div className="text-xs text-slate-500 bg-slate-950 p-3 rounded-lg">
          <p>• Inspector: <span className="text-slate-300 font-mono">inspector</span> / <span className="text-slate-300 font-mono">admin123</span></p>
          <p>• Citizen: <span className="text-slate-300 font-mono">citizen</span> / <span className="text-slate-300 font-mono">user123</span></p>
        </div>
      </div>
    </div>
  );
}