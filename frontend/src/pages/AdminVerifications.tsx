import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ShieldCheck, RefreshCw, Eye, Download, XCircle, Search, Filter, 
  Sparkles, AlertTriangle, FileText, CheckCircle2, Clock, RotateCw
} from 'lucide-react';
import { PdfPreviewModal } from '../components/modals/PdfPreviewModal';

interface AdminVerificationItem {
  id: string;
  external_id: string;
  requester_organization_id: string;
  landlord_name: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  property_name: string;
  period: string;
  monthly_rent_formatted: string;
  consent_status: string;
  verification_status: string;
  ai_status: string;
  ai_confidence_formatted: string;
  anomaly_count: number;
  rent_transactions_count: number;
  non_rent_transactions_count: number;
  expected_payments: number;
  verified_payments: number;
  report_status?: string;
  last_updated_at?: string;
  created_at: string;
}

export function AdminVerifications() {
  const [verifications, setVerifications] = useState<AdminVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [previewPdfId, setPreviewPdfId] = useState<string | null>(null);
  const [previewExternalId, setPreviewExternalId] = useState<string | undefined>(undefined);

  const fetchVerifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch('http://localhost:8000/api/v1/admin/verifications/detail', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setVerifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin verifications', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial load + 5-second short polling real-time synchronization
  useEffect(() => {
    fetchVerifications(false);
    const timer = setInterval(() => {
      fetchVerifications(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchVerifications]);

  const handleReprocessAI = async (id: string) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8000/api/v1/admin/verifications/${id}/reprocess-ai`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        await fetchVerifications(true);
      } else {
        alert('Failed to reprocess AI engine');
      }
    } catch (err) {
      alert('Error reprocessing AI engine');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelVerification = async (id: string) => {
    if (!window.confirm('Cancel this verification request?')) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8000/api/v1/admin/verifications/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        await fetchVerifications(true);
      }
    } catch (err) {
      alert('Failed to cancel verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (id: string, extId: string) => {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8000/api/v1/verifications/${id}/report/pdf?download=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to download PDF');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RentVerify_Report_${extId || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      fetchVerifications(true);
    } catch (err) {
      alert('Unable to download PDF report');
    }
  };

  const filtered = verifications.filter(v => {
    const matchesSearch = 
      v.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.landlord_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && (v.verification_status === statusFilter || v.consent_status === statusFilter);
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Verifications & AI Monitoring</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status sync, AI anomaly detection, and report management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchVerifications(false)}
            className="text-xs font-semibold"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh Now
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, tenant, landlord, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved / Verified</option>
              <option value="PENDING_CONSENT">Pending Consent</option>
              <option value="PROCESSING">Processing</option>
              <option value="REQUIRES_REVIEW">Requires Review</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Verification ID</th>
                <th className="px-4 py-3.5">Landlord</th>
                <th className="px-4 py-3.5">Tenant</th>
                <th className="px-4 py-3.5">Property</th>
                <th className="px-4 py-3.5">Consent</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">AI Engine</th>
                <th className="px-4 py-3.5">Anomalies</th>
                <th className="px-4 py-3.5">Report Status</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && verifications.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400">Loading verifications...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400">No verifications found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.external_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.landlord_name}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.tenant_name}</div>
                      <div className="text-[10px] text-slate-400">{item.tenant_email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.property_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.consent_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.consent_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.verification_status === 'VERIFIED' || item.verification_status === 'COMPLETED' || item.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        item.verification_status === 'REQUIRES_REVIEW' ? 'bg-amber-100 text-amber-800' :
                        item.verification_status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                        <span>{item.ai_status}</span>
                        {item.ai_confidence_formatted && item.ai_status === 'COMPLETED' && (
                          <span className="text-[10px] text-slate-400">({item.ai_confidence_formatted})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.anomaly_count > 0 ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 flex items-center gap-1 w-max">
                          <AlertTriangle className="h-3 w-3" /> {item.anomaly_count} Anomaly
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">0 Anomalies</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.report_status === 'DOWNLOADED' ? 'bg-blue-100 text-blue-800' :
                        item.report_status === 'SHARED' ? 'bg-purple-100 text-purple-800' :
                        item.report_status === 'GENERATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.report_status || 'NOT_GENERATED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">{item.last_updated_at || item.created_at}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewPdfId(item.id);
                            setPreviewExternalId(item.external_id);
                          }}
                          title="View PDF Report"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-600" />
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(item.id, item.external_id)}
                          title="Download PDF"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => handleReprocessAI(item.id)}
                          disabled={actionLoading === item.id}
                          title="Reprocess AI Engine"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <RotateCw className={`h-3.5 w-3.5 text-primary-600 ${actionLoading === item.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PDF Preview Modal */}
      {previewPdfId && (
        <PdfPreviewModal
          verificationId={previewPdfId}
          externalId={previewExternalId}
          onClose={() => {
            setPreviewPdfId(null);
            setPreviewExternalId(undefined);
          }}
        />
      )}
    </div>
  );
}
