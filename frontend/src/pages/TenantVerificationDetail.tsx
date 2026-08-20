import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Building2, Calendar, Lock, CheckCircle2, XCircle, FileText, ArrowLeft } from 'lucide-react';

export function TenantVerificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch(`/api/v1/tenant/verification-requests/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) setDetail(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApproveConsent = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('rv_token');
    const consentId = detail?.consent_id || id;
    
    try {
      const res = await fetch(`/api/v1/tenant/consents/${consentId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setSubmitting(false);
      setShowApproveModal(false);
      if (res.ok) {
        setMessage('✓ Consent Granted. Your rental verification can now proceed.');
        setDetail({ ...detail, status: 'CONSENT_GRANTED' });
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleRejectConsent = async () => {
    setSubmitting(true);
    const token = localStorage.getItem('rv_token');
    const consentId = detail?.consent_id || id;

    try {
      const res = await fetch(`/api/v1/tenant/consents/${consentId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setSubmitting(false);
      setShowRejectModal(false);
      if (res.ok) {
        setMessage('Verification request rejected.');
        setDetail({ ...detail, status: 'REJECTED' });
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Card className="p-8 text-center text-slate-400 text-xs font-medium">Loading request details...</Card>;
  }

  if (!detail) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Verification request not found.</p>
        <Button variant="outline" onClick={() => navigate('/tenant/verification-requests')} className="text-xs">
          Back to Requests
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tenant/verification-requests')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Request Details</h1>
          <p className="text-xs text-slate-500 font-mono">RV-{detail.external_id}</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Request Information Card */}
      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-100 pb-4 gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {detail.organization_type} Organization
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{detail.organization_name}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase text-slate-400 block">Status</span>
            <span className="text-sm font-extrabold text-slate-800">{detail.status}</span>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Requested By</span>
            <p className="font-semibold text-slate-900 text-sm">{detail.requested_by}</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Verification Purpose</span>
            <p className="font-semibold text-slate-900 text-sm">{detail.purpose}</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Verification Period</span>
            <p className="font-semibold text-slate-900 text-sm">{detail.period_start} – {detail.period_end}</p>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Property & Monthly Rent</span>
            <p className="font-semibold text-slate-900 text-sm">{detail.property_address} ({detail.monthly_rent}/mo)</p>
          </div>
        </div>

        {/* Data Requested Section */}
        <div className="bg-surface-50 p-5 rounded-2xl border border-surface-200 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-emerald-600" /> Data Requested for Verification
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 pl-6 list-disc font-medium">
            {detail.data_requested?.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
          <Lock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-900 font-medium leading-relaxed">
            {detail.privacy_notice}
          </p>
        </div>

        {/* Action Buttons */}
        {detail.status === 'PENDING_CONSENT' && (
          <div className="pt-4 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold px-6"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject Request
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowApproveModal(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 shadow-lg shadow-emerald-600/25"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Give Consent
            </Button>
          </div>
        )}
      </Card>

      {/* Give Consent Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4 border border-surface-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Confirm Verification Consent</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Do you want to allow <strong>{detail.requested_by}</strong> to verify your rental payment information for <strong>{detail.purpose}</strong>?
              </p>
            </div>
            <div className="pt-3 flex gap-3">
              <Button variant="outline" onClick={() => setShowApproveModal(false)} className="w-1/2 text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApproveConsent}
                isLoading={submitting}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                Confirm Consent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Consent Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4 border border-surface-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Reject Verification Request</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to reject this verification request from <strong>{detail.requested_by}</strong>?
              </p>
            </div>
            <div className="pt-3 flex gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} className="w-1/2 text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRejectConsent}
                isLoading={submitting}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-white text-xs"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
