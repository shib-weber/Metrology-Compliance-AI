import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Download, 
  ExternalLink, 
  Ruler, 
  Gavel, 
  RefreshCw, 
  User, 
  Filter,
  Flag,
  UserCheck
} from 'lucide-react';

export default function InspectorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [queueFilter, setQueueFilter] = useState('all_relevant'); // 'all_relevant' | 'citizen_reports' | 'my_scans'
  const [selectedActionRecord, setSelectedActionRecord] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionType, setActionType] = useState('NOTICE_ISSUED');

  const loadHistory = async () => {
    const inspectorEmail = user?.email || localStorage.getItem('user_email') || 'inspector@metronox.gov.in';
    setLoadingHistory(true);
    try {
      // Fetch role-isolated enforcement queue
      const res = await fetch(`${API_BASE_URL}/api/reports/list?email=${encodeURIComponent(inspectorEmail)}&role=inspector`);
      const json = await res.json();
      setHistory(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Failed to load inspection history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleApplyAction = async (reportId) => {
    try {
      const inspectorEmail = user?.email || localStorage.getItem('user_email') || 'inspector@metronox.gov.in';
      const res = await fetch(`${API_BASE_URL}/api/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notes: actionNotes,
          inspector_email: inspectorEmail
        })
      });
      if (res.ok) {
        setSelectedActionRecord(null);
        setActionNotes('');
        loadHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = (reportId) => {
    if (!reportId) return;
    window.open(`${API_BASE_URL}/api/reports/${reportId}/pdf`, '_blank');
  };

  // Filter queue strictly to Citizen Reports OR Inspector's Own Scans
  const currentInspectorEmail = (user?.email || '').toLowerCase().trim();
  const filteredHistory = history.filter((item) => {
    const isMyScan = item.created_by && item.created_by.toLowerCase().trim() === currentInspectorEmail;
    const isCitizenReport = item.flagged_for_review === true;

    if (queueFilter === 'citizen_reports') return isCitizenReport;
    if (queueFilter === 'my_scans') return isMyScan;
    // Default 'all_relevant': only show citizen reports and my own scans
    return isCitizenReport || isMyScan;
  });

  const panelTexts = data?.panel_texts || data?.raw_ocr_logs || {};
  const declarations = data?.declarations_summary || data?.raw_declarations || {};
  const compliance = data?.compliance || { status: 'PENDING', compliance_score: 0, violations: [], compliances: [] };
  const panelKeys = Object.keys(panelTexts);
  const passedRules = compliance.compliances || [];
  const failedRules = compliance.violations || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* LEFT COLUMN: Scanner, 3D Twin & Enforcement Queue */}
      <div className="lg:col-span-5 space-y-6">
        <TurntableScanner 
          email={user?.email || 'inspector@metronox.gov.in'}
          onComplete={(res) => {
            setData(res);
            setActiveTab('all');
            loadHistory();
          }} 
        />

        {(data?.textures || data?.clean_textures) && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Statutory Evidence 3D Mesh
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

        {/* Restricted Enforcement Queue (Citizen Reports + Own Scans) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-indigo-400" />
              Enforcement Docket ({filteredHistory.length})
            </h3>
            
            <button 
              onClick={loadHistory}
              className="text-slate-400 hover:text-slate-200 transition"
              title="Refresh repository"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Queue Filter Segment */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setQueueFilter('all_relevant')}
              className={`py-1.5 rounded-lg transition ${
                queueFilter === 'all_relevant' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Queue
            </button>
            <button
              type="button"
              onClick={() => setQueueFilter('citizen_reports')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                queueFilter === 'citizen_reports' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Flag className="w-3 h-3" /> Reported
            </button>
            <button
              type="button"
              onClick={() => setQueueFilter('my_scans')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                queueFilter === 'my_scans' ? 'bg-indigo-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" /> My Audits
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2">Item / Source</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Legal Action</th>
                  <th className="p-2 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 text-xs">
                      No citizen reports or personal inspections found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.slice(0, 8).map((h) => {
                    const isCitizen = h.flagged_for_review;
                    return (
                      <tr key={h.id} className="hover:bg-slate-950/50 transition">
                        <td className="p-2 max-w-[120px]">
                          <span className="font-semibold text-white block truncate">{h.product_name}</span>
                          <span className={`text-[9px] font-mono flex items-center gap-1 truncate ${
                            isCitizen ? 'text-rose-400 font-bold' : 'text-indigo-300'
                          }`}>
                            {isCitizen ? <Flag className="w-2.5 h-2.5 shrink-0" /> : <User className="w-2.5 h-2.5 shrink-0" />}
                            {isCitizen ? 'Citizen Report' : 'My Audit'}
                          </span>
                        </td>
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
                            onClick={() => setSelectedActionRecord(h)}
                            className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800"
                            title="Issue Enforcement Order"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                          </button>
                          <Link 
                            to={`/reports/${h.id}`}
                            className="text-slate-400 hover:text-slate-200 inline-flex items-center p-1"
                            title="View Full Case File"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(h.id)}
                            className="text-slate-400 hover:text-white inline-flex items-center p-1"
                            title="Download Form V Notice"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Action Modal & Statutory Audit Details */}
      <div className="lg:col-span-7 space-y-6">
        {selectedActionRecord && (
          <div className="bg-indigo-950/40 border-2 border-indigo-500/60 p-5 rounded-2xl shadow-2xl space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-indigo-400" />
                Statutory Order for Scan #{selectedActionRecord.id} ({selectedActionRecord.product_name})
              </h4>
              <button 
                onClick={() => setSelectedActionRecord(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <select 
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-indigo-400 font-medium"
              >
                <option value="NOTICE_ISSUED">Issue Form V Notice (Rule 24)</option>
                <option value="SEIZED">Seize Commodity Batch (Section 15)</option>
                <option value="PENALTY_IMPOSED">Impose Compounding Penalty (Section 36)</option>
                <option value="RESOLVED">Mark Compliant / Rectified</option>
                <option value="DISMISSED">Dismiss Complaint</option>
              </select>

              <input 
                type="text"
                placeholder="Order reference / enforcement remarks"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-indigo-400 text-xs"
              />
            </div>

            <button
              onClick={() => handleApplyAction(selectedActionRecord.id)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
            >
              Sign & Execute Enforcement Order
            </button>
          </div>
        )}

        {data ? (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-indigo-400 flex items-center gap-1">
                      <Gavel className="w-3.5 h-3.5" /> Enforcement Dossier
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {data.category || 'NON_FOOD'}
                    </span>
                    {data.id && (
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: #{data.id}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {data.product_name || declarations.product_name || 'Packaged Commodity'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    compliance.status === 'COMPLIANT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {compliance.status === 'COMPLIANT' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {compliance.status} ({compliance.compliance_score}/100)
                  </span>

                  {data.id && (
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(data.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Form V Notice (PDF)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Rule 7 Font Height & PDP Ratio Audit */}
            {data.font_audit && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-indigo-400" />
                    Rule 7 Table 1 Font Height & PDP Metrology Verification
                  </h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    data.font_audit.font_compliance_status === 'COMPLIANT'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500 text-rose-300'
                  }`}>
                    {data.font_audit.font_compliance_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Principal Display Area (PDP)</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">
                      {data.font_audit.pdp_area_sq_cm} cm²
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Prescribed Min Font (Table 1)</p>
                    <p className="font-mono font-bold text-indigo-400 text-sm mt-0.5">
                      ≥ {data.font_audit.prescribed_minimum_font_mm} mm
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Measured Optical Height</p>
                    <p className={`font-mono font-bold text-sm mt-0.5 ${
                      data.font_audit.font_compliance_status === 'COMPLIANT' 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`}>
                      {data.font_audit.measured_font_mm} mm
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Face Optical Extraction Evidence */}
            {panelKeys.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Multi-Face Optical Extraction Evidence
                  </h3>
                  <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {panelKeys.length} Faces Captured
                  </span>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shrink-0 ${
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shrink-0 ${
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

            {/* Consolidated Declarations */}
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-xl">
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
                    Satisfied Legal Metrology Rules ({passedRules.length})
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
                    Identified Infractions & Enforcement Breaches ({failedRules.length})
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
            <Gavel className="w-10 h-10 text-indigo-500/40 mb-3" />
            <p className="font-semibold text-slate-300 mb-1">Awaiting Inspection Dossier</p>
            <p className="text-xs max-w-md text-slate-500">
              Capture or upload package faces on the left to initiate multi-face optical extraction, evaluate Rule 7 Table 1 font compliance, and generate a statutory Form V notice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}