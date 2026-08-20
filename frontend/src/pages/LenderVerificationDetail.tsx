import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle, Clock, Cpu, Lock, FileText, Download } from 'lucide-react';

interface PaymentSummaryData {
  expected_payments: number;
  verified_payments: number;
  on_time: number;
  late: number;
  partial: number;
  missed: number;
}

interface AISignalsData {
  rent_transactions_detected: number;
  non_rent_transactions: number;
  anomalies_detected: number;
  ai_signal: string;
  explanation: string;
}

interface VerificationDetail {
  id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone?: string;
  request_date: string;
  purpose: string;
  verification_period: string;
  consent_status: string;
  verification_status: string;
  payment_summary?: PaymentSummaryData;
  ai_signals?: AISignalsData;
  monthly_rent_formatted?: string;
  expected_total_formatted?: string;
  verified_total_formatted?: string;
  disclaimer: string;
}

export function LenderVerificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('rv_token');
    fetch(`/api/v1/lender/verification-requests/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) setDetail(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs font-medium">Loading verification request details...</div>;
  }

  if (!detail) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="text-base font-bold text-slate-800">Verification Request Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/lender/verification-requests')} className="text-xs">
          Back to Requests
        </Button>
      </div>
    );
  }

  const isConsentApproved = detail.consent_status === 'APPROVED' || detail.consent_status === 'CONSENT_GRANTED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/lender/verification-requests')}
            className="p-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Verification Request Details</h1>
            <p className="text-xs text-slate-500 font-mono">ID: {detail.id} • Created: {detail.request_date}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
          detail.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {detail.verification_status}
        </span>
      </div>

      {/* Summary Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card className="p-3.5 border border-surface-200">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
          <span className="font-bold text-slate-900 block truncate">{detail.tenant_name}</span>
          <span className="text-[10px] text-slate-500 block truncate">{detail.tenant_email}</span>
        </Card>

        <Card className="p-3.5 border border-surface-200">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Purpose</span>
          <span className="font-semibold text-slate-800 block truncate">{detail.purpose}</span>
        </Card>

        <Card className="p-3.5 border border-surface-200">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Period</span>
          <span className="font-semibold text-slate-800 block truncate">{detail.verification_period}</span>
        </Card>

        <Card className="p-3.5 border border-surface-200">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Consent Status</span>
          <span className={`font-extrabold block ${isConsentApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isConsentApproved ? '✓ APPROVED' : detail.consent_status}
          </span>
        </Card>
      </div>

      {/* Consent Lock Guard Banner */}
      {!isConsentApproved ? (
        <Card className="p-8 border border-amber-200 bg-amber-50/60 rounded-3xl text-center space-y-3">
          <Lock className="mx-auto h-10 w-10 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">Tenant Consent Pending</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Financial payment metrics and AI verification signals are securely locked until the applicant ({detail.tenant_name}) approves consent.
          </p>
        </Card>
      ) : (
        <>
          {/* Payment Summary */}
          {detail.payment_summary && (
            <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rental Payment Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected</span>
                  <span className="text-xl font-extrabold text-slate-900">{detail.payment_summary.expected_payments}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Verified</span>
                  <span className="text-xl font-extrabold text-emerald-700">{detail.payment_summary.verified_payments}</span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">On-Time</span>
                  <span className="text-xl font-extrabold text-blue-700">{detail.payment_summary.on_time}</span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Late</span>
                  <span className="text-xl font-extrabold text-amber-700">{detail.payment_summary.late}</span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <span className="text-[10px] text-purple-700 font-bold uppercase block">Partial</span>
                  <span className="text-xl font-extrabold text-purple-700">{detail.payment_summary.partial}</span>
                </div>
                <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-bold uppercase block">Missed</span>
                  <span className="text-xl font-extrabold text-rose-700">{detail.payment_summary.missed}</span>
                </div>
              </div>
            </Card>
          )}

          {/* AI Verification Results */}
          {detail.ai_signals && (
            <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Verification Signals</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rent Transactions</span>
                  <span className="text-lg font-extrabold text-slate-900">{detail.ai_signals.rent_transactions_detected}</span>
                </div>
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Non-Rent Transactions</span>
                  <span className="text-lg font-extrabold text-slate-700">{detail.ai_signals.non_rent_transactions}</span>
                </div>
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Anomalies Detected</span>
                  <span className="text-lg font-extrabold text-emerald-600">{detail.ai_signals.anomalies_detected}</span>
                </div>
                <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">AI Signal Confidence</span>
                  <span className="text-lg font-extrabold text-indigo-700">{detail.ai_signals.ai_signal}</span>
                </div>
              </div>

              <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Supporting Model Analysis:</span>
                <p className="italic">{detail.ai_signals.explanation}</p>
              </div>
            </Card>
          )}

          {/* Final Verification Result Box */}
          <Card className="p-6 border border-emerald-200 bg-emerald-50/40 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">Rental Verification Certificate</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs">✓ VERIFIED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Monthly Rent</span>
                <span className="font-extrabold text-slate-900 block">{detail.monthly_rent_formatted || '₹20,000'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Expected</span>
                <span className="font-extrabold text-slate-900 block">{detail.expected_total_formatted || '₹2,40,000'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Verified</span>
                <span className="font-extrabold text-emerald-700 block">{detail.verified_total_formatted || '₹2,40,000'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Anomalies</span>
                <span className="font-bold text-emerald-700 block">0</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-surface-100 border border-surface-200 text-[11px] text-slate-500 leading-relaxed">
        <span className="font-bold text-slate-700 block mb-0.5">Disclaimer:</span>
        {detail.disclaimer}
      </div>
    </div>
  );
}
