import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, ArrowLeft } from 'lucide-react';

export function LandlordTenantNew() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitNumber, setUnitNumber] = useState('Flat 402');
  const [leaseStartDate, setLeaseStartDate] = useState('2026-01-01');
  const [leaseEndDate, setLeaseEndDate] = useState('2026-12-31');
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
          setPropertyId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError('Please select a valid property.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          property_id: propertyId,
          unit_number: unitNumber,
          lease_start_date: leaseStartDate,
          lease_end_date: leaseEndDate,
          monthly_rent_minor_units: monthlyRent * 100
        })
      });

      const json = await res.json();
      setSubmitting(false);

      if (res.ok) {
        navigate('/landlord/tenants');
      } else {
        setError(json.detail || 'Failed to add tenant');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Connection error creating tenant.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/landlord/tenants')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Tenant</h1>
          <p className="text-xs text-slate-500">Associate a tenant with a property and create a lease relationship.</p>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tenant Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tenant Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@example.com"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Property</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                {properties.length === 0 && <option value="">No Properties Found - Add Property First</option>}
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.address_line1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Unit Number</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Flat 402"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lease Start Date</label>
              <input
                type="date"
                required
                value={leaseStartDate}
                onChange={(e) => setLeaseStartDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lease End Date</label>
              <input
                type="date"
                required
                value={leaseEndDate}
                onChange={(e) => setLeaseEndDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/landlord/tenants')} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-8 shadow-md shadow-primary-600/20"
            >
              Add Tenant
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
