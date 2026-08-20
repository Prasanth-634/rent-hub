import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, ArrowLeft } from 'lucide-react';

export function LandlordLeaseNew() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [dueDay, setDueDay] = useState(5);
  const [paymentFrequency, setPaymentFrequency] = useState('MONTHLY');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    Promise.all([
      fetch('/api/v1/landlord/tenants', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/landlord/properties', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([tData, pData]) => {
      if (Array.isArray(tData) && tData.length > 0) {
        setTenants(tData);
        setTenantId(tData[0].id);
      }
      if (Array.isArray(pData) && pData.length > 0) {
        setProperties(pData);
        setPropertyId(pData[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }

    if (monthlyRent <= 0) {
      setError('Monthly rent must be positive.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('rv_token');

    try {
      const res = await fetch('/api/v1/landlord/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          property_id: propertyId,
          monthly_rent_minor_units: monthlyRent * 100,
          security_deposit_minor_units: securityDeposit * 100,
          due_day: Number(dueDay),
          payment_frequency: paymentFrequency,
          start_date: startDate,
          end_date: endDate
        })
      });

      const json = await res.json();
      setSubmitting(false);

      if (res.ok) {
        navigate('/landlord/leases');
      } else {
        setError(json.detail || 'Failed to create lease.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Connection error creating lease.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/landlord/leases')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Lease Agreement</h1>
          <p className="text-xs text-slate-500">Formulate a formal rental lease agreement for verification tracking.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold">
          {error}
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
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.address_line1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monthly Rent (₹)</label>
              <input
                type="number"
                required
                min={1}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lease Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lease End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rent Due Day of Month</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Frequency</label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/landlord/leases')} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-8 shadow-md shadow-primary-600/20"
            >
              Create Lease
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
