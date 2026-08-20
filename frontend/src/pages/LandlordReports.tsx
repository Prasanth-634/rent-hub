import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart3, Download, Eye, FileText, X, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface LandlordReportItem {
  id: string;
  tenant_name: string;
  property_name: string;
  period: string;
  status: string;
  created_date: string;
}

interface PaymentHistoryItem {
  month: string;
  expected: string;
  paid: string;
  date_paid: string;
  status: string;
}

interface LandlordReportDetail {
  id: string;
  tenant_name: string;
  tenant_email: string;
  property_name: string;
  property_address: string;
  lease_period: string;
  expected_rent_formatted: string;
  verification_summary: string;
  payment_history: PaymentHistoryItem[];
  ai_findings: {
    confidence_score: number;
    data_integrity_score: number;
    timeliness_rate: string;
    summary_note: string;
  };
  anomaly_indicators: string[];
  final_verification_status: string;
  created_date: string;
}

export function LandlordReports() {
  const [reports, setReports] = useState<LandlordReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Report Modal State
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<LandlordReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/reports', {
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
      const res = await fetch(`/api/v1/landlord/reports/${reportId}`, {
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
      "Verification ID,Tenant,Property,Period,Status,Expected Rent,Verified Payments,AI Confidence\n" +
      `RV-${id},${name},Sunrise Heights Villa,Jan 2026 - Mar 2026,VERIFIED,75000,3,98%`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RentVerify_Report_${name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Download and inspect formal rental payment verification reports.</p>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Reports Generated</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Reports are generated automatically when a tenant completes a verification request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Report ID</th>
                  <th className="p-3.5">Tenant</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">REP-{r.id.substring(0, 8)}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.tenant_name}</td>
                    <td className="p-3.5 text-slate-700">{r.property_name}</td>
                    <td className="p-3.5 text-slate-600">{r.period}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenReportView(r.id)}
                        className="text-xs text-primary-700 border-primary-200 hover:bg-primary-50 h-8 px-3"
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

      {/* Report Modal */}
      {selectedReportId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-surface-200 relative my-8">
            <button onClick={() => { setSelectedReportId(null); setReportDetail(null); }} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            {loadingDetail || !reportDetail ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">Loading detailed report analysis...</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-surface-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Verification Report</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: REP-{reportDetail.id.substring(0, 8)} • {reportDetail.created_date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    reportDetail.final_verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {reportDetail.final_verification_status}
                  </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenant</span>
                    <span className="font-bold text-slate-900 truncate block">{reportDetail.tenant_name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Property</span>
                    <span className="font-bold text-slate-900 truncate block">{reportDetail.property_name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Rent</span>
                    <span className="font-extrabold text-slate-900 block">{reportDetail.expected_rent_formatted}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Period</span>
                    <span className="font-semibold text-slate-800 block">{reportDetail.lease_period}</span>
                  </div>
                </div>

                {/* Verification Summary Paragraph */}
                <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-1">
                  <h4 className="text-xs font-bold text-primary-900 uppercase tracking-wider">Verification Summary</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{reportDetail.verification_summary}</p>
                </div>

                {/* Payment History Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verified Payment History</h4>
                  <div className="overflow-x-auto rounded-xl border border-surface-200">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-surface-100 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="p-2.5">Month</th>
                          <th className="p-2.5">Expected</th>
                          <th className="p-2.5">Paid</th>
                          <th className="p-2.5">Payment Date</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {reportDetail.payment_history.map((p, idx) => (
                          <tr key={idx} className="hover:bg-surface-50">
                            <td className="p-2.5 font-bold text-slate-900">{p.month}</td>
                            <td className="p-2.5">{p.expected}</td>
                            <td className="p-2.5 font-bold text-slate-900">{p.paid}</td>
                            <td className="p-2.5">{p.date_paid}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Findings */}
                <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Cpu className="h-4 w-4 text-primary-600" />
                    <span>AI Model Findings & Integrity Metrics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-white rounded-xl border border-surface-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Confidence Score</span>
                      <span className="text-base font-extrabold text-emerald-600">{reportDetail.ai_findings.confidence_score}%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-surface-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Data Integrity</span>
                      <span className="text-base font-extrabold text-primary-600">{reportDetail.ai_findings.data_integrity_score}%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-surface-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Timeliness Rate</span>
                      <span className="text-base font-extrabold text-indigo-600">{reportDetail.ai_findings.timeliness_rate}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-surface-200 italic">
                    "{reportDetail.ai_findings.summary_note}"
                  </p>
                </div>

                {/* Anomaly Indicators */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Anomaly Indicators</h4>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{reportDetail.anomaly_indicators[0] || 'No payment anomalies or mismatched bank records detected.'}</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-surface-200">
                  <Button variant="outline" onClick={() => { setSelectedReportId(null); setReportDetail(null); }} className="text-xs">
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleDownload(reportDetail.id, reportDetail.tenant_name)} className="bg-primary-600 text-white text-xs">
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

