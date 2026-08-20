import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ShieldCheck, Landmark, Users, BarChart3, CreditCard, Clock, AlertTriangle, ArrowUpRight, Plus, CheckCircle2, Cpu, Activity, RefreshCw 
} from 'lucide-react';

interface DashboardMetrics {
  total_verification_requests: number;
  verified: number;
  pending_consent: number;
  processing: number;
  needs_review: number;
  api_usage_current: number;
  api_usage_limit: number;
}

export function LenderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_verification_requests: 248,
    verified: 192,
    pending_consent: 34,
    processing: 12,
    needs_review: 10,
    api_usage_current: 8420,
    api_usage_limit: 10000
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.total_verification_requests !== undefined) {
          setMetrics(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const lenderName = user?.name || 'Partner';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, {lenderName}</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor your rental verification requests and reports.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/lender/verification-requests/new')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Verification Request
          </Button>
        </div>
      </div>

      {/* 6 FinTech Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Requests</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.total_verification_requests}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Verified</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{metrics.verified}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending Consent</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-600">{metrics.pending_consent}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Processing</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-blue-600">{metrics.processing}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Needs Review</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-rose-600">{metrics.needs_review}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">API Usage</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-extrabold text-purple-700">{metrics.api_usage_current.toLocaleString()} / {metrics.api_usage_limit.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Underwriting Verification Activity */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Verification Requests</h3>
            <p className="text-xs text-slate-500">Rental payment reliability reports for loan underwriting.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/lender/verification-requests')} className="text-xs">
            View All Requests
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Verification ID</th>
                <th className="p-3">Applicant/Tenant</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Consent Status</th>
                <th className="p-3">Verification Status</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              <tr className="hover:bg-surface-50 transition-colors">
                <td className="p-3 font-mono font-bold text-slate-900">vr-101</td>
                <td className="p-3 font-semibold text-slate-900">Rahul Kumar</td>
                <td className="p-3">Loan Application</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ APPROVED</span>
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">VERIFIED</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => navigate('/lender/verification-requests/vr-101')}
                    className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                  >
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-50 transition-colors">
                <td className="p-3 font-mono font-bold text-slate-900">vr-102</td>
                <td className="p-3 font-semibold text-slate-900">Priya Sharma</td>
                <td className="p-3">Mortgage Application</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">PENDING</span>
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">PENDING_CONSENT</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => navigate('/lender/verification-requests/vr-102')}
                    className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                  >
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

