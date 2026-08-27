import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import '../styles/Landing.css';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}