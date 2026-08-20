import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowLeft, Send, CheckCircle2, AlertTriangle, Calendar, User, Mail, Phone, FileText } from 'lucide-react';

export function LenderVerificationNew() {
  const navigate = useNavigate();
  const [tenantFullName, setTenantFullName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-12-31');
  const [purpose, setPurpose] = useState('Loan Application');
  const [referenceId, setReferenceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/lender/verification-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_full_name: tenantFullName,
          tenant_email: tenantEmail,
          tenant_phone: tenantPhone,
          period_start: periodStart,
          period_end: periodEnd,
          purpose,
          reference_id: referenceId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Verification request sent successfully.');
        setTimeout(() => {
          navigate('/lender/verification-requests');
        }, 1500);
      } else {
        setErrorMsg(data.detail || 'Failed to send verification request.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/lender/verification-requests')}
          className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Rental Verification Request</h1>
          <p className="text-xs text-slate-500 mt-0.5">Request tenant consent to verify historical rental payment reliability.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Tenant Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={tenantFullName}
                onChange={(e) => setTenantFullName(e.target.value)}
                placeholder="e.g. Rahul Kumar"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Tenant Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Tenant Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Period Start *</label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Period End *</label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Verification Purpose *</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 outline-none focus:border-indigo-500 text-slate-900"
              >
                <option value="Loan Application">Loan Application</option>
                <option value="Mortgage Application">Mortgage Application</option>
                <option value="Credit Assessment">Credit Assessment</option>
                <option value="Rental Income Verification">Rental Income Verification</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Reference / Application ID (Optional)</label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. APP-99214"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/lender/verification-requests')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 shadow-md shadow-indigo-600/20"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send Verification Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
