import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Plus, ShieldCheck, Mail, Phone, Building2, Eye, X } from 'lucide-react';

interface LandlordTenantItem {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  property_name: string;
  property_id: string;
  lease_id?: string;
  monthly_rent_formatted: string;
  lease_status: string;
  verification_status: string;
  created_at?: string;
}

export function LandlordTenants() {
  const navigate = useNavigate();
  const { id: routeTenantId } = useParams<{ id?: string }>();
  const [tenants, setTenants] = useState<LandlordTenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<LandlordTenantItem | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (routeTenantId && tenants.length > 0) {
      const found = tenants.find(t => t.id === routeTenantId);
      if (found) setSelectedTenant(found);
    }
  }, [routeTenantId, tenants]);

  const fetchTenants = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/tenants', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTenants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
          <p className="text-xs text-slate-500 mt-1">Tenants associated with your properties and active leases.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/landlord/tenants/new')}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Tenants Added</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Associate a tenant with your properties to issue lease agreements and request rental payment verifications.</p>
            <Button variant="outline" onClick={() => navigate('/landlord/tenants/new')} className="text-xs">
              Add Tenant Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Tenant Name</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Monthly Rent</th>
                  <th className="p-3.5">Lease Status</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{t.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.email}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{t.property_name}</td>
                    <td className="p-3.5 font-bold text-slate-900">{t.monthly_rent_formatted}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {t.lease_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.verification_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTenant(t)}
                        className="text-xs text-slate-700 border-surface-300 hover:bg-surface-100 h-8 px-3"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/landlord/verifications/new')}
                        className="text-xs bg-primary-600 hover:bg-primary-500 text-white h-8 px-3"
                      >
                        Create Verification
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-surface-200 relative">
            <button onClick={() => setSelectedTenant(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTenant.full_name}</h3>
                <p className="text-xs text-slate-500">Tenant Details & Associated Property</p>
              </div>
            </div>

            <div className="p-4 bg-surface-50 rounded-2xl space-y-2 text-xs border border-surface-200">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email</span>
                <span className="font-semibold text-slate-800">{selectedTenant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Phone</span>
                <span className="font-semibold text-slate-800">{selectedTenant.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Property</span>
                <span className="font-bold text-slate-900">{selectedTenant.property_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Monthly Rent</span>
                <span className="font-extrabold text-slate-900">{selectedTenant.monthly_rent_formatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Lease Status</span>
                <span className="font-bold text-blue-700">{selectedTenant.lease_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Verification</span>
                <span className="font-bold text-emerald-700">{selectedTenant.verification_status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTenant(null)} className="text-xs">
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedTenant(null);
                  navigate('/landlord/verifications/new');
                }}
                className="bg-primary-600 text-white text-xs"
              >
                Create Verification Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

