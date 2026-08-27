import React from 'react';
import { HeartPulse, AlertCircle, Sparkles } from 'lucide-react';

export default function HealthBadge({ health }) {
  if (!health) return null;

  const getBadgeStyle = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', progress: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400', progress: 'bg-lime-500' };
    if (score >= 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', progress: 'bg-amber-500' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', progress: 'bg-rose-500' };
  };

  const style = getBadgeStyle(health.health_score);

  return (
    <div className={`p-5 rounded-2xl border ${style.border} ${style.bg} space-y-4`}>
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <HeartPulse className={`w-4 h-4 ${style.text}`} /> Nutri-Score & Processing Index
        </h4>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${style.border} ${style.text}`}>
          Grade {health.grade.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className={`text-4xl font-black ${style.text} tracking-tight`}>
          {health.health_score}<span className="text-sm text-slate-400">/100</span>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Processing Penalty</span>
            <span className="font-mono">{100 - health.health_score}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div className={`h-full ${style.progress} transition-all duration-500`} style={{ width: `${health.health_score}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-slate-400">Added Sugar</p>
          <p className="font-bold text-slate-200 mt-0.5">{health.breakdown?.sugar_g || 0} g</p>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-slate-400">Saturated Fat</p>
          <p className="font-bold text-slate-200 mt-0.5">{health.breakdown?.sat_fat_g || 0} g</p>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-slate-400">Sodium</p>
          <p className="font-bold text-slate-200 mt-0.5">{health.breakdown?.sodium_mg || 0} mg</p>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-slate-400">INS Additives</p>
          <p className="font-bold text-slate-200 mt-0.5">{health.breakdown?.additives_detected || 0} detected</p>
        </div>
      </div>
    </div>
  );
}