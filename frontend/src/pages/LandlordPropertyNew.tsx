import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function LandlordPropertyNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('400001');
  const [numberOfUnits, setNumberOfUnits] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name || addressLine1,
          property_type: propertyType,
          address_line1: addressLine1,
          city,
          state,
          postal_code: postalCode,
          number_of_units: Number(numberOfUnits)
        })
      });

      const json = await res.json();
      setSubmitting(false);

      if (res.ok) {
        navigate('/landlord/properties');
      } else {
        setError(json.detail || 'Failed to create property');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Connection error creating property.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/landlord/properties')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Property</h1>
          <p className="text-xs text-slate-500">Register a new property to start allocating units and leases.</p>
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Property Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunrise Heights Villa"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="SINGLE_FAMILY">Single Family Villa</option>
                <option value="COMMERCIAL">Commercial Office</option>
                <option value="MULTI_FAMILY">Multi-Family Complex</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Address Line 1</label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Flat 402, 12 Lake View Road"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Postal Code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="400001"
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Number of Units</label>
              <input
                type="number"
                min={1}
                required
                value={numberOfUnits}
                onChange={(e) => setNumberOfUnits(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/landlord/properties')} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-8 shadow-md shadow-primary-600/20"
            >
              Add Property
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
