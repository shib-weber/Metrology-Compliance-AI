import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Database,
  Clock,
  Loader2,
  AlertCircle,
  Layers,
  User
} from 'lucide-react';
import ComplianceReport from '../components/ComplianceReport';
import HealthBadge from '../components/HealthBadge';
import ProductViewer3D from '../components/ProductViewer3D';

export default function ReportDetails() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/reports/list');
        const list = await res.json();
        const found = list.find((item) => String(item.id) === String(reportId));
        setReport(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleDownloadPDF = () => {
    window.open(`http://localhost:8000/api/reports/${reportId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider">Retrieving statutory audit dossier...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Record Not Found</h3>
          <p className="text-xs text-slate-400 mt-1">Inspection dossier #{reportId} could not be located in the enforcement database.</p>
        </div>
        <Link 
          to="/inspector" 
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Enforcement Portal
        </Link>
      </div>
    );
  }

  const compliancePayload = {
    status: report.status,
    compliance_score: report.compliance_score,
    violations: report.violations || []
  };

  const healthPayload = {
    health_score: report.health_score,
    grade: report.health_score >= 80 ? 'A (Nutritious)' : report.health_score >= 50 ? 'B (Moderate)' : 'D (Processed)',
    breakdown: { sugar_g: '--', sat_fat_g: '--', sodium_mg: '--', additives_detected: '--' }
  };

  const isCompliant = report.status === 'COMPLIANT';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <Link 
          to="/inspector" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition group w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" /> 
          Back to Inspections Repository
        </Link>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {report.created_at ? new Date(report.created_at).toLocaleString() : 'Recent Audit'}
          </span>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" /> Form V PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-indigo-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Enforcement Dossier
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                ID: #{String(reportId).slice(0, 10)}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> Scanned by: {report.created_by || 'citizen'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
              {report.product_name || 'Packaged Commodity'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
              isCompliant
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}>
              {isCompliant ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {report.status} ({report.compliance_score}/100)
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
              Enforcement Status / Legal Action
            </span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border inline-block ${
              report.inspector_action === 'NOTICE_ISSUED' ? 'bg-amber-950/60 border-amber-500 text-amber-300' :
              report.inspector_action === 'SEIZED' ? 'bg-rose-950/60 border-rose-500 text-rose-300' :
              report.inspector_action === 'RESOLVED' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' :
              'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {report.inspector_action || 'PENDING INSPECTION'}
            </span>
            {report.action_notes && (
              <p className="text-xs text-slate-300 mt-1 italic">"{report.action_notes}"</p>
            )}
          </div>

          {report.action_by && (
            <div className="text-right text-[11px] text-slate-400 font-mono">
              <span>Authorized Officer: <strong className="text-slate-200">{report.action_by}</strong></span>
              {report.action_taken_at && (
                <span className="block text-[10px] text-slate-500">
                  {new Date(report.action_taken_at).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {report.textures && Object.keys(report.textures).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Preserved 3D Evidence Mesh
          </h4>
          <ProductViewer3D
            textures={report.textures}
            geometryType="box"
          />
        </div>
      )}

      <ComplianceReport
        compliance={compliancePayload}
        productName={report.product_name}
        onDownloadPdf={handleDownloadPDF}
      />

      {report.health_score !== undefined && (
        <HealthBadge health={healthPayload} />
      )}
    </div>
  );
}