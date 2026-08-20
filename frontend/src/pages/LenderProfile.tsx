import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Landmark, Mail, Phone, Lock, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LenderProfileData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  organization_name: string;
  organization_type: string;
  role: string;
}

export function LenderProfile() {
  const [profile, setProfile] = useState<LenderProfileData>({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    organization_name: '',
    organization_type: 'LENDER',
    role: 'LENDER'
  });
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setProfile(data);
          setFullName(data.full_name || '');
          setOrgName(data.organization_name || '');
          setPhone(data.phone || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/lender/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          organization_name: orgName,
          phone,
          new_password: newPassword || undefined
        })
      });

      if (res.ok) {
        setMsg('Profile updated successfully.');
        setNewPassword('');
        fetchProfile();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lender Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage institutional details and account authentication security.</p>
      </div>

      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading profile...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Business Email (Read-Only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="h-10 w-full rounded-xl border border-surface-200 bg-surface-100 pl-10 pr-3 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Financial Organization / Lender Name</label>
              <div className="relative">
                <Landmark className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role Designation</label>
                <input
                  type="text"
                  disabled
                  value={profile.role}
                  className="h-10 w-full rounded-xl border border-surface-200 bg-surface-100 px-3 font-bold text-indigo-700 cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Change Password (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password to update"
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 shadow-md shadow-indigo-600/20"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
