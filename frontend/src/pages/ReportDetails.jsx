import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ShieldCheck, ShieldAlert, FileText, Calendar, Database } from 'lucide-react';
import ComplianceReport from '../components/ComplianceReport';
import HealthBadge from '../components/HealthBadge';

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
    return <div className="p-8 text-center text-slate-400 text-sm">Retrieving statutory audit records...</div>;
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <p className="text-slate-400">Inspection record #{reportId} not found.</p>
        <Link to="/inspector" className="inline-flex items-center gap-2 text-indigo-400 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Enforcement Portal
        </Link>
      </div>
    );
  }

  const compliancePayload = {
    status: report.status,
    compliance_score: report.compliance_score,
    violations: report.violations
  };

  const healthPayload = {
    health_score: report.health_score,
    grade: report.health_score >= 80 ? 'A (Nutritious)' : report.health_score >= 50 ? 'B (Moderate)' : 'D (Processed)',
    breakdown: { sugar_g: '--', sat_fat_g: '--', sodium_mg: '--', additives_detected: '--' }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/inspector" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Inspections Repository
        </Link>
        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
          <Calendar className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleString()}
        </span>
      </div>

      <ComplianceReport
        compliance={compliancePayload}
        productName={report.product_name}
        onDownloadPdf={handleDownloadPDF}
      />

      <HealthBadge health={healthPayload} />
    </div>
  );
}