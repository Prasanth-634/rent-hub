import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, FileText, ShieldCheck, CheckCircle2, Clock, 
  CreditCard, Plus, ArrowUpRight, BarChart3, RefreshCw
} from 'lucide-react';

export function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>({
    total_properties: 0,
    active_tenants: 0,
    active_leases: 0,
    pending_verifications: 0,
    verified_tenants: 0,
    monthly_rent_formatted: '₹0.00'
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    const token = localStorage.getItem('rv_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('/api/v1/landlord/dashboard', { headers }).then(r => r.json()),
      fetch('/api/v1/landlord/properties', { headers }).then(r => r.json()),
      fetch('/api/v1/landlord/verifications', { headers }).then(r => r.json())
    ]).then(([dData, pData, vData]) => {
      if (dData && dData.total_properties !== undefined) setMetrics(dData);
      if (Array.isArray(pData)) setRecentProperties(pData.slice(0, 3));
      if (Array.isArray(vData)) setRecentVerifications(vData.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-surface-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-semibold">Property Management Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Good Morning, {user?.name || 'Landlord'}</h1>
          <p className="text-xs md:text-sm text-slate-500">Here's what's happening with your rental properties.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            className="text-xs text-slate-700 border-surface-300 hover:bg-surface-50 font-medium"
          >
            <RefreshCw className="mr-1.5 h-4 w-4 text-slate-500" /> Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/landlord/properties/new')}
            className="text-xs text-slate-700 border-surface-300 hover:bg-surface-50 font-medium"
          >
            <Plus className="mr-1.5 h-4 w-4 text-slate-500" /> Add Property
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/landlord/verifications/new')}
            className="bg-primary-600 hover:bg-primary-500 text-white shadow-sm text-xs font-semibold"
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" /> Create Verification Request
          </Button>
        </div>
      </div>

      {/* 6 FinTech / PropTech Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Properties</span>
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-2xl font-extrabold text-slate-900">{metrics.total_properties}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Tenants</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-2xl font-extrabold text-slate-900">{metrics.active_tenants}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Leases</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-2xl font-extrabold text-slate-900">{metrics.active_leases}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pending Verification</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-2xl font-extrabold text-amber-600">{metrics.pending_verifications}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Verified</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-2xl font-extrabold text-emerald-600">{metrics.verified_tenants}</span>
            )}
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Monthly Rent</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
            ) : (
              <span className="text-xl font-extrabold text-slate-900 truncate block">{metrics.monthly_rent_formatted}</span>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Access Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Properties Overview</h3>
              <p className="text-xs text-slate-500">Quick property status and tenant allocations.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/landlord/properties')} className="text-xs">
              Manage Properties
            </Button>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          ) : recentProperties.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-surface-200 rounded-2xl">
              No properties registered yet. Click "Add Property" to begin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentProperties.map(p => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{p.name || p.address_line1}</span>
                    <span className="text-[11px] text-slate-500">{p.city}, {p.state} | {p.tenants_count} Tenants | {p.status}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{p.monthly_rent_formatted}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Verifications</h3>
              <p className="text-xs text-slate-500">Latest tenant rental payment disclosures.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/landlord/verifications')} className="text-xs">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
          ) : recentVerifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-surface-200 rounded-2xl">
              No verification requests submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentVerifications.map(v => (
                <div key={v.id} className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">{v.tenant_name}</span>
                    <span className="text-[11px] text-slate-500">Period: {v.period} | {v.property_name}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    v.verification_status === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {v.verification_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
