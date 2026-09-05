import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
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
  User,
  FileText,
  IndianRupee,
  Scale,
  Calendar,
  Building2,
  PhoneCall,
  Globe2,
  FileCheck2,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Tag,
  Barcode
} from 'lucide-react';
import HealthBadge from '../components/HealthBadge';
import ProductViewer3D from '../components/ProductViewer3D';

export default function ReportDetails() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports/list`);
        const list = await res.json();
        const found = list.find((item) => String(item.id) === String(reportId));
        setReport(found);
      } catch (err) {
        console.error('Failed to retrieve inspection report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleDownloadPDF = () => {
    window.open(`${API_BASE_URL}/api/reports/${reportId}/pdf`, '_blank');
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
          <p className="text-xs text-slate-400 mt-1">
            Inspection dossier #{reportId} could not be located in the enforcement database.
          </p>
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

  const declarations = report.raw_declarations || report.declarations_summary || {};
  const compliances = Array.isArray(report.compliances) ? report.compliances : [];
  const violations = Array.isArray(report.violations) ? report.violations : [];
  const isCompliant = report.status === 'COMPLIANT';

  // Resolved Nutrition payload if applicable
  const nutrition = declarations.nutrition || {};
  const hasNutrition = declarations.category === 'FOOD' || nutrition.is_applicable;
  const healthPayload = report.health_score !== undefined ? {
    health_score: report.health_score,
    grade: report.health_score >= 80 ? 'A (Nutritious)' : report.health_score >= 50 ? 'B (Moderate)' : 'D (Processed)',
    breakdown: {
      sugar_g: nutrition.sugar_per_100g !== undefined ? `${nutrition.sugar_per_100g}g` : '--',
      sat_fat_g: nutrition.saturated_fat_per_100g !== undefined ? `${nutrition.saturated_fat_per_100g}g` : '--',
      sodium_mg: nutrition.sodium_per_100g !== undefined ? `${nutrition.sodium_per_100g}mg` : '--',
      additives_detected: nutrition.ins_additives_count !== undefined ? String(nutrition.ins_additives_count) : '--'
    }
  } : null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header Navigation */}
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

      {/* Main Dossier Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-indigo-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Enforcement Dossier
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                ID: #{String(reportId).slice(0, 10)}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 uppercase">
                {report.category || declarations.category || 'NON_FOOD'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1">
                <User className="w-2.5 h-2.5" /> Officer/User: {report.created_by || 'citizen'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              {report.product_name || declarations.product_name || 'Packaged Commodity'}
            </h2>
            {declarations.generic_name && declarations.generic_name !== report.product_name && (
              <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Generic: {declarations.generic_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border ${
              isCompliant
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}>
              {isCompliant ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {report.status} ({report.compliance_score}/100)
            </span>
          </div>
        </div>

        {/* Legal Action / Inspection Flagging Banner */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
              Enforcement Status / Legal Disposition
            </span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border inline-block ${
              report.inspector_action === 'NOTICE_ISSUED' ? 'bg-amber-950/60 border-amber-500 text-amber-300' :
              report.inspector_action === 'SEIZED' ? 'bg-rose-950/60 border-rose-500 text-rose-300' :
              report.inspector_action === 'RESOLVED' || report.inspector_action === 'VERIFIED' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' :
              'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {report.inspector_action || (isCompliant ? 'VERIFIED' : 'PENDING INSPECTION')}
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

      {/* 3D Digital Twin Model Evidence (if textures are preserved) */}
      {report.textures && Object.keys(report.textures).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Preserved 3D Evidence Mesh
            </h4>
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
              {report.geometry || 'Box'}
            </span>
          </div>
          <ProductViewer3D
            textures={report.textures}
            geometryType={report.geometry || 'box'}
          />
        </div>
      )}

      {/* Extracted Statutory Declarations Summary Grid */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Statutory Declarations (Legal Metrology Rules, 2011)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {compliances.length} Verified / {violations.length} Infractions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          
          {/* MRP */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <IndianRupee className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Maximum Retail Price (MRP)</span>
              <span className="font-mono text-white text-sm font-semibold mt-0.5 block">
                {declarations.mrp || 'Not Declared (Missing)'}
              </span>
            </div>
          </div>

          {/* USP */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Unit Sale Price (USP)</span>
              <span className="font-mono text-indigo-300 text-sm font-semibold mt-0.5 block">
                {declarations.unit_sale_price || 'Not Declared'}
              </span>
            </div>
          </div>

          {/* Net Quantity */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Net Quantity</span>
              <span className="font-mono text-white text-sm font-semibold mt-0.5 block">
                {declarations.net_quantity || 'Not Declared'}
              </span>
            </div>
          </div>

          {/* Mfg / Expiry Dates */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Mfg &amp; Expiry Dates</span>
              <span className="font-mono text-white text-xs font-semibold mt-0.5 block">
                {declarations.mfg_date ? `MFD: ${declarations.mfg_date}` : 'MFD: Missing'} | {declarations.expiry_date ? `EXP: ${declarations.expiry_date}` : 'EXP: Missing'}
              </span>
            </div>
          </div>

          {/* Batch Number */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <Tag className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Batch / Lot Identifier</span>
              <span className="font-mono text-white text-xs font-semibold mt-0.5 block">
                {declarations.batch_number || 'Not Declared'}
              </span>
            </div>
          </div>

          {/* Country of Origin */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <Globe2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Country of Origin</span>
              <span className="font-mono text-white text-xs mt-0.5 block">
                {declarations.country_of_origin || 'Not Stated'}
              </span>
            </div>
          </div>

          {/* Consumer Helpline */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3 sm:col-span-2 lg:col-span-1">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Consumer Care Helpline</span>
              <span className="font-mono text-white text-xs mt-0.5 block truncate max-w-[280px]">
                {declarations.consumer_care || 'Not Provided'}
              </span>
            </div>
          </div>

          {/* Barcode & GS1 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3 sm:col-span-2 lg:col-span-2">
            <Barcode className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Detected Barcodes / GS1 Codes</span>
              <span className="font-mono text-purple-300 text-xs mt-0.5 block">
                {declarations.barcodes_detected && declarations.barcodes_detected.length > 0 
                  ? declarations.barcodes_detected.join(', ')
                  : 'No Barcode detected'}
              </span>
            </div>
          </div>

          {/* Manufacturer / Packer Details */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3 sm:col-span-2 lg:col-span-3">
            <Building2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block">Manufacturer / Packer Complete Address</span>
              <span className="font-mono text-slate-200 text-xs mt-0.5 block">
                {declarations.manufacturer_details || 'Not Declared / Incomplete'}
              </span>
            </div>
          </div>
        </div>

        {/* Satisfied Legal Metrology Rules */}
        {compliances.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            <h4 className="text-xs uppercase font-semibold text-emerald-400 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Satisfied Legal Metrology Mandates ({compliances.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {compliances.map((c, i) => (
                <div key={i} className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300 font-mono">{c.section}</span>
                      <span className="text-[11px] font-semibold text-emerald-200">{c.title}</span>
                    </div>
                    <p className="text-emerald-300/80 leading-relaxed">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Identified Infractions & Faults */}
        {violations.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            <h4 className="text-xs uppercase font-semibold text-rose-400 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Identified Infractions &amp; Faults ({violations.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {violations.map((v, i) => (
                <div key={i} className="bg-rose-950/30 border border-rose-900/40 p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300 font-mono">{v.section || `Rule ${i + 1}`}</span>
                      {v.severity && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-200 border border-rose-800/60">
                          {v.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-rose-200/90 leading-relaxed">{v.detail || v.violation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nutritional Evaluation Badge if food commodity */}
      {hasNutrition && healthPayload && (
        <HealthBadge health={healthPayload} />
      )}
    </div>
  );
}