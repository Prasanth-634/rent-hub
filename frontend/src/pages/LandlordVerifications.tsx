import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Plus, CheckCircle2, Clock, AlertTriangle, Eye, Sparkles } from 'lucide-react';

interface LandlordVerifItem {
  id: string;
  external_id: string;
  tenant_name: string;
  property_name: string;
  period: string;
  monthly_rent_formatted: string;
  consent_status: string;
  verification_status: string;
  created_date: string;
  ai_result_summary?: string;
  ai_status?: string;
}

export function LandlordVerifications() {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<LandlordVerifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/verifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVerifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Verifications</h1>
          <p className="text-xs text-slate-500 mt-1">Issue verification requests to tenants and monitor consent & AI matching status.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/landlord/verifications/new')}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Create Verification Request
        </Button>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading verifications...</div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Verification Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a verification request to prompt tenants for rental payment history confirmation.</p>
            <Button variant="outline" onClick={() => navigate('/landlord/verifications/new')} className="text-xs">
              Create Request Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Verification ID</th>
                  <th className="p-3.5">Tenant</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Monthly Rent</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Consent Status</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">AI Result</th>
                  <th className="p-3.5">Credit Used</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">RV-{v.external_id}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{v.tenant_name}</td>
                    <td className="p-3.5 text-slate-700">{v.property_name}</td>
                    <td className="p-3.5 font-bold text-slate-900">{v.monthly_rent_formatted}</td>
                    <td className="p-3.5 text-slate-600">{v.period}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.consent_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        v.consent_status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.consent_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.verification_status === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.verification_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {v.ai_status === 'PENDING_CONSENT' || v.consent_status !== 'APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Waiting for Consent
                        </span>
                      ) : v.ai_status === 'PROCESSING' || v.verification_status === 'PROCESSING' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
                          Processing...
                        </span>
                      ) : v.ai_result_summary?.includes('Review') || v.verification_status === 'REQUIRES_REVIEW' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          {v.ai_result_summary || '⚠ Review Recommended'}
                        </span>
                      ) : v.ai_status === 'COMPLETED' || v.verification_status === 'VERIFIED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {v.ai_result_summary || '✓ Verified'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {v.ai_result_summary || 'Waiting for Consent'}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">1 Credit</td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/landlord/verifications/${v.id}`)}
                        className="text-xs text-primary-600 border-primary-200 hover:bg-primary-50 h-8 px-3 font-semibold"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View Details
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
