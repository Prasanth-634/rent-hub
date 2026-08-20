import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export function LandlordVerificationNew() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);

  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [leaseId, setLeaseId] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-03-31');
  const [purpose, setPurpose] = useState('Verify tenant rental payment history.');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    Promise.all([
      fetch('/api/v1/landlord/tenants', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/landlord/properties', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/landlord/leases', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([tData, pData, lData]) => {
      if (Array.isArray(tData) && tData.length > 0) {
        setTenants(tData);
        setTenantId(tData[0].id);
      }
      if (Array.isArray(pData) && pData.length > 0) {
        setProperties(pData);
        setPropertyId(pData[0].id);
      }
      if (Array.isArray(lData) && lData.length > 0) {
        setLeases(lData);
        setLeaseId(lData[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    if (!tenantId || !propertyId || !leaseId) {
      setError('Please select a valid tenant, property, and active lease.');
      setSubmitting(false);
      return;
    }

    if (new Date(periodEnd) <= new Date(periodStart)) {
      setError('Verification period end date must be strictly after start date.');
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          property_id: propertyId,
          lease_id: leaseId,
          period_start: periodStart,
          period_end: periodEnd,
          purpose
        })
      });

      const json = await res.json();
      setSubmitting(false);

      if (res.ok) {
        setSuccessMsg(json.message || 'Verification request created successfully');
        setTimeout(() => {
          navigate('/landlord/verifications');
        }, 1500);
      } else {
        const errDetail = typeof json.detail === 'string' ? json.detail : (json.detail?.[0]?.msg || 'Failed to create verification request');
        setError(errDetail);
      }
    } catch (err) {
      setSubmitting(false);
      setError('Unable to create verification request. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/landlord/verifications')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Verification Request</h1>
          <p className="text-xs text-slate-500">Send an automated rental payment verification disclosure request to a tenant.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-danger-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Tenant</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                {tenants.length === 0 && <option value="">No Tenants Found</option>}
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Property</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                {properties.length === 0 && <option value="">No Properties Found</option>}
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.address_line1}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Active Lease</label>
              <select
                value={leaseId}
                onChange={(e) => setLeaseId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                {leases.length === 0 && <option value="">No Active Leases Found</option>}
                {leases.map(l => (
                  <option key={l.id} value={l.id}>{l.property_name} - {l.tenant_name} ({l.monthly_rent_formatted}/mo)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Verification Period Start</label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Verification Period End</label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Request Purpose</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Verify tenant rental payment history."
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/landlord/verifications')} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-8 shadow-md shadow-primary-600/20"
            >
              Send Verification Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
