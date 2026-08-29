import React, { useState, useEffect } from 'react';
import TurntableScanner from '../components/TurntableScanner';
import ProductViewer3D from '../components/ProductViewer3D';
import HealthBadge from '../components/HealthBadge';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Terminal, 
  Eye, 
  Layers, 
  Building2, 
  Calendar, 
  IndianRupee, 
  Scale, 
  Globe2, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  AlertOctagon, 
  History, 
  Send, 
  Download, 
  RefreshCw, 
  Check 
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [personalHistory, setPersonalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [reportSuccess, setReportSuccess] = useState('');

  const fetchPersonalHistory = async () => {
    const userEmail = user?.email || localStorage.getItem('user_email');
    if (!userEmail) return;

    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/list?email=${encodeURIComponent(userEmail)}&role=citizen`);
      const list = await res.json();
      setPersonalHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPersonalHistory();
  }, [user]);

  const handleForwardToInspector = async (reportId) => {
    setReportingId(reportId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          report_id: reportId, 
          notes: 'Citizen reported statutory violation to Legal Metrology Inspectorate.' 
        })
      });
      if (res.ok) {
        setReportSuccess(`Scan #${reportId} successfully reported to Enforcement Officers!`);
        fetchPersonalHistory();
        setTimeout(() => setReportSuccess(''), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportingId(null);
    }
  };

  const handleDownloadPDF = (reportId) => {
    window.open(`${API_BASE_URL}/api/reports/${reportId}/pdf`, '_blank');
  };

  const panelTexts = data?.panel_texts || data?.raw_ocr_logs || {};
  const declarations = data?.declarations_summary || data?.raw_declarations || {};
  const compliance = data?.compliance || { status: 'PENDING', compliance_score: 0, violations: [], compliances: [] };
  const panelKeys = Object.keys(panelTexts);
  const passedRules = compliance.compliances || [];
  const failedRules = compliance.violations || [];

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Left Column: Scanner, 3D Twin & Personal Log */}
      <div className="lg:col-span-5 space-y-6">
        <TurntableScanner 
          onComplete={(res) => {
            setData(res);
            setActiveTab('all');
            fetchPersonalHistory();
          }} 
        />

        {(data?.textures || data?.clean_textures) && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> 3D Digital Twin Evidence
              </h4>
              <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                {data.geometry || 'Box'}
              </span>
            </div>
            
            <ProductViewer3D
              textures={data.textures || data.clean_textures}
              geometryType={data.geometry || 'box'}
            />
          </div>
        )}

        {/* Personal Scan History */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              My Audit History ({personalHistory.length})
            </h3>
            <button 
              onClick={fetchPersonalHistory}
              className="text-slate-400 hover:text-slate-200 transition"
              title="Refresh my history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {reportSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{reportSuccess}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2">Item</th>
                  <th className="p-2">Verdict</th>
                  <th className="p-2">Action Taken</th>
                  <th className="p-2 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {personalHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">
                      No inspections scanned yet.
                    </td>
                  </tr>
                ) : (
                  personalHistory.slice(0, 5).map((h) => (
                    <tr key={h.id} className="hover:bg-slate-950/50 transition">
                      <td className="p-2 font-semibold text-white max-w-[100px] truncate">{h.product_name}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          h.status === 'COMPLIANT' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          h.inspector_action === 'NOTICE_ISSUED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          h.inspector_action === 'SEIZED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          h.inspector_action === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {h.inspector_action || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-2 text-right space-x-1.5">
                        <button
                          onClick={() => handleDownloadPDF(h.id)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                          title="Download Notice"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {h.status !== 'COMPLIANT' && !h.flagged_for_review && (
                          <button
                            onClick={() => handleForwardToInspector(h.id)}
                            disabled={reportingId === h.id}
                            className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-950 transition"
                            title="Report Violation to Inspector"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Optical Evidence & Compliance Report */}
      <div className="lg:col-span-7 space-y-6">
        {data ? (
          <>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-slate-400">Scanned Item</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {data.category || 'NON_FOOD'}
                    </span>
                    {data.id && <span className="text-[10px] font-mono text-slate-500">ID: #{data.id}</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {data.product_name || declarations.product_name || 'Packaged Commodity'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                    compliance.status === 'COMPLIANT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {compliance.status === 'COMPLIANT' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {compliance.status} ({compliance.compliance_score}/100)
                  </span>

                  {data.id && compliance.status !== 'COMPLIANT' && (
                    <button
                      type="button"
                      onClick={() => handleForwardToInspector(data.id)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Report Infraction
                    </button>
                  )}
                </div>
              </div>
            </div>

            {panelKeys.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Multi-Face Optical Extraction Evidence
                  </h3>
                  <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {panelKeys.length} Faces Captured
                  </span>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                      activeTab === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> All Faces
                  </button>
                  {panelKeys.map((faceId) => (
                    <button
                      key={faceId}
                      type="button"
                      onClick={() => setActiveTab(faceId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
                        activeTab === faceId
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {faceId}
                    </button>
                  ))}
                </div>

                {activeTab === 'all' ? (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-mono font-semibold text-indigo-400 block">
                      Consolidated Package Corpus:
                    </span>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {panelKeys.map((pKey) => (
                        <div key={pKey} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block mb-1">
                            [{pKey} Face]
                          </span>
                          <pre className="font-mono text-slate-300 whitespace-pre-wrap leading-relaxed font-normal">
                            {panelTexts[pKey] || 'No text detected'}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-black/40 rounded-lg p-2 border border-slate-800/80">
                      <img
                        src={data.clean_textures?.[activeTab] || data.textures?.[activeTab]}
                        alt={activeTab}
                        className="max-h-40 object-contain rounded"
                      />
                      <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase font-bold">
                        Segmented {activeTab} Face
                      </span>
                    </div>
                    <div className="md:col-span-8 space-y-1.5">
                      <span className="text-xs font-mono font-semibold text-emerald-400 block">
                        Extracted Text Lines:
                      </span>
                      <pre className="text-xs font-mono text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-y-auto max-h-36 whitespace-pre-wrap leading-relaxed">
                        {panelTexts[activeTab] || 'No text detected on this face.'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Statutory Declarations (Legal Metrology Rules, 2011)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {passedRules.length} Compliant / {failedRules.length} Infractions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <IndianRupee className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Maximum Retail Price (MRP)</span>
                    <span className="font-mono text-white text-sm font-semibold mt-0.5 block">
                      {declarations.mrp || 'Not Declared (Violation)'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Unit Sale Price (USP)</span>
                    <span className="font-mono text-indigo-300 text-sm font-semibold mt-0.5 block">
                      {declarations.unit_sale_price || 'Missing / Not Stated'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Net Quantity</span>
                    <span className="font-mono text-white text-sm font-semibold mt-0.5 block">
                      {declarations.net_quantity || 'Not Declared'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Mfg / Expiry Dates</span>
                    <span className="font-mono text-white text-sm font-semibold mt-0.5 block">
                      {declarations.mfg_date ? `MFD: ${declarations.mfg_date}` : 'MFD: Missing'} | {declarations.expiry_date ? `EXP: ${declarations.expiry_date}` : 'EXP: Missing'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3 sm:col-span-2">
                  <Building2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Manufacturer / Packer Details</span>
                    <span className="font-mono text-slate-200 text-xs mt-0.5 block">
                      {declarations.manufacturer_details || 'Not Declared / Incomplete'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Consumer Care</span>
                    <span className="font-mono text-white text-xs mt-0.5 block">
                      {declarations.consumer_care || 'Not Provided'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <Globe2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Country of Origin</span>
                    <span className="font-mono text-white text-xs mt-0.5 block">
                      {declarations.country_of_origin || 'Not Stated'}
                    </span>
                  </div>
                </div>
              </div>

              {passedRules.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-slate-800">
                  <h4 className="text-xs uppercase font-semibold text-emerald-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    Satisfied Legal Metrology Laws ({passedRules.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {passedRules.map((c, i) => (
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

              {failedRules.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-slate-800">
                  <h4 className="text-xs uppercase font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    Identified Infractions & Faults ({failedRules.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {failedRules.map((v, i) => (
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

            {data.health && data.category === 'FOOD' && <HealthBadge health={data.health} />}
          </>
        ) : (
          <div className="h-96 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500 text-sm">
            <p className="font-semibold text-slate-400 mb-1">Awaiting Inspection</p>
            <p className="text-xs max-w-sm">
              Capture or upload package faces on the left to synthesize multi-face text and verify compliance against Legal Metrology Rules 2011.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}