import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TurntableScanner from '../components/TurntableScanner';
import ProductViewer3D from '../components/ProductViewer3D';
import ComplianceReport from '../components/ComplianceReport';
import HealthBadge from '../components/HealthBadge';
import { History, Download, ExternalLink, Ruler, Layers } from 'lucide-react';

export default function InspectorDashboard() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/reports/list');
      const json = await res.json();
      setHistory(json);
    } catch (err) {
      console.error('Failed to load inspection history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDownloadPDF = (reportId) => {
    window.open(`http://localhost:8000/api/reports/${reportId}/pdf`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: 6-Axis Scanner & 3D WebGL Digital Twin */}
      <div className="lg:col-span-5 space-y-6">
        <TurntableScanner onComplete={(res) => { setData(res); loadHistory(); }} />
        
        {data?.textures && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Statutory Evidence 3D Mesh
              </h4>
              <span className="text-[11px] font-mono text-indigo-300 uppercase font-bold">
                {data.geometry || 'Box'}
              </span>
            </div>
            <ProductViewer3D 
              textures={data.textures} 
              geometryType={data.geometry || 'box'} 
            />
          </div>
        )}
      </div>

      {/* Right Column: Statutory Audit, Rule 7 Metrics & Repository */}
      <div className="lg:col-span-7 space-y-6">
        {data && (
          <>
            {/* Primary Statutory Compliance Report */}
            <ComplianceReport
              compliance={data.compliance}
              productName={data.product_name}
              onDownloadPdf={() => handleDownloadPDF(data.id)}
            />

            {/* Rule 7 PDP Area & Font Height Audit Card */}
            {data.font_audit && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-indigo-400" />
                  Rule 7 Table 1 Font Height & PDP Ratio Audit
                </h4>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Principal Display Area</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">
                      {data.font_audit.pdp_area_sq_cm} cm²
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Prescribed Min Font</p>
                    <p className="font-mono font-bold text-indigo-400 text-sm mt-0.5">
                      ≥ {data.font_audit.prescribed_minimum_font_mm} mm
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Measured Font</p>
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

            {/* Health Score Summary */}
            <HealthBadge health={data.health} />
          </>
        )}

        {/* Repository of Enforcement Inspections */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Statutory Inspection History
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {history.length} Audits Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No inspections recorded in the repository yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-950/50 transition">
                      <td className="p-3 font-semibold text-white">{h.product_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          h.status === 'COMPLIANT' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{h.compliance_score}%</td>
                      <td className="p-3 flex items-center gap-3">
                        <Link 
                          to={`/reports/${h.id}`}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Details
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(h.id)}
                          className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}