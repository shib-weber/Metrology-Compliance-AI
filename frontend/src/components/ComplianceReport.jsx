import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, Download, FileText } from 'lucide-react';

export default function ComplianceReport({ compliance, productName, onDownloadPdf }) {
  if (!compliance) return null;

  const isCompliant = compliance.status === 'COMPLIANT';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Statutory Assessment</span>
          <h2 className="text-xl font-bold text-white mt-0.5">{productName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isCompliant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {isCompliant ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {compliance.status} (Score: {compliance.compliance_score}/100)
            </span>
          </div>
        </div>

        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition"
          >
            <Download className="w-4 h-4" /> Issue Statutory Notice (PDF)
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Detected Non-Compliances ({compliance.violations?.length || 0})
        </h4>

        {compliance.violations?.length === 0 ? (
          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300">
              Zero infractions found. Package fully complies with Rule 6 (Mandatory Declarations) and Rule 7 (Font Legibility) of Legal Metrology Rules, 2011.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {compliance.violations.map((v, idx) => (
              <div key={idx} className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-300">{v.section}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {v.severity || 'CRITICAL'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200">{v.clause}</p>
                <p className="text-xs text-slate-400">{v.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}