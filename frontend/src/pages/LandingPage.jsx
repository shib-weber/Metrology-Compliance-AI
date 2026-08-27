import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Box, FileCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6">
      <div className="max-w-4xl text-center space-y-6">
        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
          SIH 2026 Statutory Innovation
        </span>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Automated Statutory Compliance & <span className="text-indigo-400">3D Digital Twins</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Enforce the Legal Metrology (Packaged Commodities) Rules, 2011 with AI label scanning, automatic PDF evidence issuance, and instant citizen health transparency.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition">
            Launch Platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <Shield className="w-8 h-8 text-indigo-400" />
          <h3 className="font-bold text-white">Rules 2011 Audit Engine</h3>
          <p className="text-sm text-slate-400">Automated verification of MRP, Net Qty, USP, and Rule 7 minimum font heights.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <Box className="w-8 h-8 text-indigo-400" />
          <h3 className="font-bold text-white">Client-Side 3D Digital Twin</h3>
          <p className="text-sm text-slate-400">0% GPU server load. Projects captured panels into WebGL meshes in real time.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <h3 className="font-bold text-white">Citizen Health Scoring</h3>
          <p className="text-sm text-slate-400">Automated processing penalties, sugar, sodium, and additive hazard ratings.</p>
        </div>
      </div>
    </div>
  );
}