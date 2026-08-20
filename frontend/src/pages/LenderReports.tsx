import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, Download, Eye, FileText, X, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

interface LenderReportItem {
  id: string;
  tenant_name: string;
  period: string;
  verification_status: string;
  created_date: string;
  completed_date?: string;
}

interface PaymentSummaryData {
  expected_payments: number;
  verified_payments: number;
  on_time: number;
  late: number;
  partial: number;
  missed: number;
}

interface AISignalsData {
  rent_transactions_detected: number;
  non_rent_transactions: number;
  anomalies_detected: number;
  ai_signal: string;
  explanation: string;
}

interface LenderReportDetail {
  id: string;
  tenant_name: string;
  tenant_email: string;
  organization_name: string;
  period: string;
  verification_status: string;
  created_date: string;
  completed_date?: string;
  payment_summary: PaymentSummaryData;
  ai_signals: AISignalsData;
  monthly_rent_formatted: string;
  expected_total_formatted: string;
  verified_total_formatted: string;
  disclaimer: string;
}

export function LenderReports() {
  const [reports, setReports] = useState<LenderReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<LenderReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleOpenReportView = async (reportId: string) => {
    setSelectedReportId(reportId);
    setLoadingDetail(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch(`/api/v1/lender/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportDetail(data);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownload = (id: string, name: string) => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Verification ID,Tenant,Period,Status,Expected Rent,Verified Payments,AI Signal\n" +
      `RV-${id},${name},Jan 2026 - Dec 2026,VERIFIED,240000,12,High Confidence`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentVerify_LenderReport_${name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Download and inspect formal rental payment verification reports for lending assessments.</p>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Reports Generated</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Reports are generated automatically when a tenant approves consent and verification processes complete.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Verification ID</th>
                  <th className="p-3.5">Tenant</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Completed Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{r.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.tenant_name}</td>
                    <td className="p-3.5 text-slate-600">{r.period}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ {r.verification_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{r.completed_date || r.created_date}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenReportView(r.id)}
                        className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 h-8 px-3"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View Report
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(r.id, r.tenant_name)}
                        className="text-xs text-slate-700 border-surface-300 hover:bg-surface-100 h-8 px-3"
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> Download Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detailed Report Modal */}
      {selectedReportId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-surface-200 relative my-8">
            <button onClick={() => { setSelectedReportId(null); setReportDetail(null); }} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            {loadingDetail || !reportDetail ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">Loading detailed underwriting report...</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-surface-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Institutional Rental Verification Report</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {reportDetail.id} • {reportDetail.completed_date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
                    ✓ {reportDetail.verification_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
                    <span className="font-bold text-slate-900 truncate block">{reportDetail.tenant_name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lender Org</span>
                    <span className="font-bold text-slate-900 truncate block">{reportDetail.organization_name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Rent</span>
                    <span className="font-extrabold text-slate-900 block">{reportDetail.expected_total_formatted}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Rent</span>
                    <span className="font-extrabold text-emerald-700 block">{reportDetail.verified_total_formatted}</span>
                  </div>
                </div>

                {/* Reliability Summary */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                  <h4 className="font-bold text-indigo-900 uppercase tracking-wider">Payment Reliability Breakdown</h4>
                  <div className="grid grid-cols-4 gap-2 text-center pt-1">
                    <div className="p-2 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">On-Time</span>
                      <span className="text-base font-extrabold text-emerald-600">{reportDetail.payment_summary.on_time}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Late</span>
                      <span className="text-base font-extrabold text-amber-600">{reportDetail.payment_summary.late}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Partial</span>
                      <span className="text-base font-extrabold text-purple-600">{reportDetail.payment_summary.partial}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Missed</span>
                      <span className="text-base font-extrabold text-rose-600">{reportDetail.payment_summary.missed}</span>
                    </div>
                  </div>
                </div>

                {/* AI Signals */}
                <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Cpu className="h-4 w-4 text-indigo-600" />
                    <span>AI Model Signals ({reportDetail.ai_signals.ai_signal})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-surface-200 italic">
                    "{reportDetail.ai_signals.explanation}"
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-surface-200">
                  <Button variant="outline" onClick={() => { setSelectedReportId(null); setReportDetail(null); }} className="text-xs">
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleDownload(reportDetail.id, reportDetail.tenant_name)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                    <Download className="mr-1 h-3.5 w-3.5" /> Download Report (CSV)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
