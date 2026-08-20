import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserCheck, CheckCircle2, AlertTriangle, Building2, Mail, Phone, Lock } from 'lucide-react';

export function LandlordProfile() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setFullName(data.full_name || '');
          setBusinessName(data.business_name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          business_name: businessName,
          phone: phone,
          password: password || undefined
        })
      });

      const json = await res.json();
      setSubmitting(false);
      if (res.ok) {
        setMessage('✓ Landlord profile updated successfully.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(json.detail || 'Failed to update profile.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Connection error updating profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Landlord Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your landlord profile, organization details, and account credentials.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger-600" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-surface-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base">
              {fullName ? fullName.substring(0, 2).toUpperCase() : 'LL'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{fullName || 'Landlord'}</h3>
              <p className="text-xs text-slate-500">{businessName || 'Property Management Firm'}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 text-[10px] font-bold uppercase tracking-wider">
            Verified Landlord Account
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Business / Company Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="h-11 w-full rounded-xl border border-surface-200 bg-surface-100 px-3 text-sm text-slate-500 outline-none cursor-not-allowed"
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
          </div>

          <div className="pt-4 border-t border-surface-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-8 shadow-md shadow-primary-600/20"
            >
              Update Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
