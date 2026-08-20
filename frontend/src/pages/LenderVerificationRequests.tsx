import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Plus, Search, Filter, Eye, ArrowRight, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface VerificationRequestItem {
  id: string;
  tenant_name: string;
  tenant_email: string;
  verification_period: string;
  purpose: string;
  consent_status: string;
  verification_status: string;
  created_at: string;
}

export function LenderVerificationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/verification-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.tenant_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.verification_status === statusFilter || r.consent_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Track applicant rental payment verification requests and consent statuses.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/lender/verification-requests/new')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Create Verification Request
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant name or Verification ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_CONSENT">Pending Consent</option>
            <option value="CONSENT_GRANTED">Consent Granted</option>
            <option value="PROCESSING">Processing</option>
            <option value="VERIFIED">Verified</option>
            <option value="REVIEW">Needs Review</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading verification requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Verification Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a rental verification request to send a consent prompt to loan applicants.</p>
            <Button variant="outline" onClick={() => navigate('/lender/verification-requests/new')} className="text-xs">
              Create Request Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Verification ID</th>
                  <th className="p-3.5">Applicant/Tenant</th>
                  <th className="p-3.5">Verification Period</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Consent Status</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{r.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{r.tenant_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.tenant_email}</div>
                    </td>
                    <td className="p-3.5 text-slate-700">{r.verification_period}</td>
                    <td className="p-3.5 text-slate-600">{r.purpose}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.consent_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        r.consent_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.consent_status === 'APPROVED' ? '✓ APPROVED' : r.consent_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        r.verification_status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.verification_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{r.created_at}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/lender/verification-requests/${r.id}`)}
                        className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 h-8 px-3"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
