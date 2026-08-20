import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PdfPreviewModal } from '../components/modals/PdfPreviewModal';
import { ShareReportModal } from '../components/modals/ShareReportModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck, ArrowLeft, CheckCircle2, Download, Share2, Eye, FileText, Loader2, AlertTriangle, Sparkles,
  Building2, User, Upload, FileSpreadsheet, X, Clock,
  Check, RefreshCw, Cpu, Lock, ChevronRight, TrendingUp,
  BarChart3, Activity
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface VerificationDetail {
  id: string;
  external_id: string;
  tenant_name: string;
  property_name: string;
  lease_id: string;
  period: string;
  monthly_rent_formatted?: string;
  request_date: string;
  consent_status: string;
  verification_status: string;
  expected_payments: number;
  verified_payments: number;
  on_time_payments: number;
  late_payments: number;
  partial_payments: number;
  missed_payments: number;
  possible_duplicates: number;
  rent_transactions_count: number;
  non_rent_transactions_count: number;
  anomaly_count: number;
  ai_confidence_formatted: string;
  ai_summary_text: string;
}

interface AITransaction {
  transaction_id: string;
  description: string;
  amount_minor_units: number;
  transaction_date: string;
  payer?: string;
  payee?: string;
  classification: string;
  confidence: number;
  is_anomaly: boolean;
  anomaly_score?: number;
  review_reason?: string;
  model_version?: string;
  anomaly_model_version?: string;
}

interface AIResults {
  verification_id: string;
  summary: {
    rent_transactions_detected: number;
    non_rent_transactions: number;
    anomalies_detected: number;
    ai_confidence_percentage: number;
    review_status: string;
    review_recommendation: string;
    explanation: string;
    model_version?: string;
    anomaly_model_version?: string;
  };
  transactions: AITransaction[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function fmtAmount(minor: number) {
  return `\u20b9${(minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

// ─── Verification status state machine ───────────────────────────────────────
type VerifState = 'PENDING_CONSENT' | 'CONSENT_GRANTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UNKNOWN';

function deriveState(detail: VerificationDetail): VerifState {
  const { consent_status, verification_status } = detail;
  if (verification_status === 'FAILED') return 'FAILED';
  if (verification_status === 'VERIFIED' || verification_status === 'REQUIRES_REVIEW' || verification_status === 'COMPLETED') return 'COMPLETED';
  if (verification_status === 'PROCESSING') return 'PROCESSING';
  if (consent_status === 'APPROVED' && (verification_status === 'CONSENT_GRANTED' || verification_status === 'UPLOAD_PENDING')) return 'CONSENT_GRANTED';
  if (consent_status !== 'APPROVED' || verification_status === 'PENDING_CONSENT') return 'PENDING_CONSENT';
  return 'UNKNOWN';
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StateBadge({ state }: { state: VerifState }) {
  const cfg: Record<VerifState, { cls: string; label: string }> = {
    PENDING_CONSENT:  { cls: 'bg-amber-100 text-amber-800 border border-amber-200',   label: '\u23f3 Pending Consent' },
    CONSENT_GRANTED:  { cls: 'bg-blue-100 text-blue-800 border border-blue-200',      label: '\u2713 Consent Granted' },
    PROCESSING:       { cls: 'bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse', label: '\u26a1 Processing' },
    COMPLETED:        { cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200', label: '\u2713 Completed' },
    FAILED:           { cls: 'bg-red-100 text-red-800 border border-red-200',         label: '\u2717 Failed' },
    UNKNOWN:          { cls: 'bg-slate-100 text-slate-600 border border-slate-200',   label: 'Unknown' },
  };
  const c = cfg[state];
  return <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${c.cls}`}>{c.label}</span>;
}

function PendingConsentCard() {
  return (
    <Card className="p-6 border border-amber-200 bg-amber-50/60 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">AI Analysis — Waiting for Tenant Consent</h3>
          <p className="text-xs text-amber-700 mt-0.5">The tenant must approve the verification request before AI processing can begin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Step 1: Consent Request Sent', done: true },
          { label: 'Step 2: Tenant Approval Pending', done: false },
          { label: 'Step 3: AI Analysis Locked', done: false },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${s.done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-amber-200 text-amber-700 opacity-60'}`}>
            {s.done ? <Check className="h-4 w-4 text-emerald-600 shrink-0" /> : <Lock className="h-4 w-4 text-amber-500 shrink-0" />}
            {s.label}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-amber-600 leading-relaxed border-t border-amber-200 pt-3">
        Once the tenant approves, you will be able to upload a bank statement CSV and run Scikit-Learn AI classification (RandomForestClassifier + IsolationForest).
      </p>
    </Card>
  );
}

function ConsentGrantedCard({ onUpload }: { onUpload: () => void }) {
  return (
    <Card className="p-6 border border-blue-200 bg-blue-50/40 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">Tenant Consent Approved — Ready for AI Processing</h3>
          <p className="text-xs text-blue-700 mt-0.5">Upload a bank statement CSV to trigger Scikit-Learn AI analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Consent Received', done: true, active: false },
          { label: 'Upload Bank Statement CSV', done: false, active: true },
          { label: 'AI Analysis Will Run', done: false, active: false },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${s.done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : s.active ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
            {s.done ? <Check className="h-4 w-4 text-emerald-600 shrink-0" /> : s.active ? <ChevronRight className="h-4 w-4 text-blue-600 shrink-0" /> : <Cpu className="h-4 w-4 text-slate-400 shrink-0" />}
            {s.label}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-blue-200">
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 rounded-xl px-3 py-2 flex-1">
          <Cpu className="h-4 w-4 shrink-0" />
          <span><strong>Scikit-Learn Models ready:</strong> RandomForestClassifier (Rent Classification) + IsolationForest (Anomaly Detection)</span>
        </div>
        <Button
          variant="primary"
          onClick={onUpload}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 shrink-0"
        >
          <Upload className="mr-1.5 h-4 w-4" /> Upload CSV &amp; Run AI
        </Button>
      </div>
    </Card>
  );
}

function ProcessingCard() {
  return (
    <Card className="p-6 border border-indigo-200 bg-indigo-50/50 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 animate-spin">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-indigo-900 uppercase tracking-wider">AI Analysis In Progress</h3>
          <p className="text-xs text-indigo-700 mt-0.5 animate-pulse">Scikit-Learn models are classifying transactions and detecting anomalies...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'RandomForestClassifier', desc: 'Classifying each transaction as RENT or NON_RENT' },
          { label: 'IsolationForest', desc: 'Detecting unusual payment amounts and intervals' },
        ].map((m, i) => (
          <div key={i} className="p-3 rounded-xl border border-indigo-200 bg-white/60 text-xs space-y-1">
            <div className="font-extrabold text-indigo-800 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> {m.label}
            </div>
            <div className="text-slate-500">{m.desc}</div>
            <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden mt-2">
              <div className="h-full bg-indigo-400 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-indigo-600">This usually takes a few seconds. Refresh the page to see results.</p>
    </Card>
  );
}

function FailedCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-6 border border-red-200 bg-red-50/50 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-red-900 uppercase tracking-wider">AI Analysis Failed</h3>
          <p className="text-xs text-red-700 mt-0.5">An error occurred while processing transactions. Please re-upload the CSV and try again.</p>
        </div>
      </div>
      <Button variant="outline" onClick={onRetry} className="text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50">
        <RefreshCw className="mr-1.5 h-4 w-4" /> Retry — Upload New CSV
      </Button>
    </Card>
  );
}

function AISummaryCard({ summary, verificationStatus }: { summary: AIResults['summary']; verificationStatus: string }) {
  const isReview = verificationStatus === 'REQUIRES_REVIEW' || summary.review_status === 'REVIEW_RECOMMENDED';

  return (
    <Card className="p-6 border border-indigo-100 bg-white shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">AI VERIFICATION SUMMARY</h2>
        </div>
        <div className="flex items-center gap-2">
          {isReview ? (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">\u26a0 Review Recommended</span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">\u2713 Verified</span>
          )}
          <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-100">Scikit-Learn Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Rent Transactions</span>
          <span className="text-3xl font-extrabold text-primary-700 mt-1 block">{summary.rent_transactions_detected}</span>
          <span className="text-[10px] text-primary-500 font-semibold">Detected by AI</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Non-Rent</span>
          <span className="text-3xl font-extrabold text-slate-700 mt-1 block">{summary.non_rent_transactions}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Filtered out</span>
        </div>

        <div className={`p-4 rounded-2xl border ${summary.anomalies_detected > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <span className={`text-[10px] font-bold uppercase block tracking-wider ${summary.anomalies_detected > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>Anomalies</span>
          <span className={`text-3xl font-extrabold mt-1 block ${summary.anomalies_detected > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{summary.anomalies_detected}</span>
          <span className={`text-[10px] font-semibold ${summary.anomalies_detected > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{summary.anomalies_detected > 0 ? 'Review needed' : 'All clear'}</span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">AI Confidence</span>
          <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">{summary.ai_confidence_percentage}%</span>
          <span className="text-[10px] text-emerald-500 font-semibold">Classification score</span>
        </div>
      </div>

      {summary.model_version && (
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-3">
          <span>Classifier: {summary.model_version}</span>
          {summary.anomaly_model_version && <span>\u00b7 Anomaly: {summary.anomaly_model_version}</span>}
          <span>\u00b7 {summary.explanation}</span>
        </div>
      )}
    </Card>
  );
}

function ClassificationTable({ transactions }: { transactions: AITransaction[] }) {
  return (
    <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Feature 1: Rent Transaction Classification</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-6">RandomForestClassifier predicting RENT vs NON_RENT for each transaction</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200 shrink-0">
          Random Forest Model
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs font-medium">No transaction data available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Amount</th>
                <th className="p-3">AI Classification</th>
                <th className="p-3 text-right rounded-r-xl">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx, idx) => (
                <tr key={tx.transaction_id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                    {tx.transaction_date ? tx.transaction_date.substring(0, 10) : 'N/A'}
                  </td>
                  <td className="p-3 font-medium text-slate-800 max-w-[200px] truncate">{tx.description}</td>
                  <td className="p-3 font-extrabold text-slate-900">{fmtAmount(tx.amount_minor_units)}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      tx.classification === 'RENT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {tx.classification === 'RENT' ? '\u2713 RENT' : 'NON_RENT'}
                    </span>
                    {tx.is_anomaly && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">\u26a0 Anomaly</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">
                    {Math.round((tx.confidence || 0) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function AnomalyDetectionCard({ transactions, monthlyRent }: { transactions: AITransaction[]; monthlyRent?: string }) {
  const anomalies = transactions.filter(t => t.is_anomaly);
  const normal = transactions.length - anomalies.length;

  return (
    <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Feature 2: Payment Anomaly Detection</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-6">IsolationForest evaluating payment amounts and interval deviations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            Normal: {normal}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
            Isolation Forest
          </span>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <div className="font-extrabold text-emerald-800">No Anomalies Detected</div>
            <div className="font-medium text-emerald-700 mt-0.5">All {transactions.length} transaction amounts and payment intervals align with lease terms.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((anom, idx) => (
            <div key={anom.transaction_id || idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="font-extrabold text-amber-900 text-sm">\u26a0 ANOMALY DETECTED \u2014 REVIEW RECOMMENDED</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  {anom.transaction_date ? anom.transaction_date.substring(0, 10) : 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Transaction Amount</span>
                  <span className="font-extrabold text-slate-900 text-sm">{fmtAmount(anom.amount_minor_units)}</span>
                </div>
                {monthlyRent && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Expected Monthly Rent</span>
                    <span className="font-bold text-slate-800 text-sm">{monthlyRent}</span>
                  </div>
                )}
                {anom.anomaly_score !== undefined && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Anomaly Score</span>
                    <span className="font-bold text-slate-800 text-sm">{anom.anomaly_score.toFixed(4)}</span>
                  </div>
                )}
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Review Reason</span>
                  <span className="font-medium text-amber-900 block leading-tight">
                    {anom.review_reason || 'Payment amount or timing deviates significantly from expected rental pattern.'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── CSV Upload Modal ─────────────────────────────────────────────────────────
function CsvUploadModal({
  verificationId,
  onClose,
  onSuccess,
}: {
  verificationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    if (csvFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      return;
    }

    setUploading(true);
    setError(null);

    const token = localStorage.getItem('rv_token');
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await fetch(`/api/v1/landlord/verifications/${verificationId}/upload-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.detail || 'CSV upload failed. Please check the file format and try again.');
        setUploading(false);
        return;
      }

      setStats(json.stats);

      // Now trigger AI processing
      const procRes = await fetch(`/api/v1/landlord/verifications/${verificationId}/process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      setUploading(false);
      if (procRes.ok) {
        onSuccess();
        onClose();
      } else {
        const procJson = await procRes.json();
        setError(procJson.detail || 'Processing failed after upload. Please try again.');
      }
    } catch {
      setUploading(false);
      setError('Connection error. Please check your network and try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-slate-200 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-100 text-primary-700">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload Rental Statement CSV</h3>
            <p className="text-xs text-slate-500 mt-0.5">Required columns: transaction_id, date, amount, description, payer, payee</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {stats && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-800">CSV Parsed Successfully:</div>
            <div className="flex flex-wrap gap-3 text-slate-600 mt-1">
              <span>Total: <strong>{stats.total_rows}</strong></span>
              <span className="text-emerald-600">Valid: <strong>{stats.valid_rows}</strong></span>
              <span className="text-amber-600">Duplicates: <strong>{stats.duplicate_rows}</strong></span>
              <span className="text-red-600">Invalid: <strong>{stats.invalid_rows}</strong></span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 hover:border-primary-400 transition-colors cursor-pointer block">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <span className="text-xs text-slate-500 block">Drag &amp; drop or click to select a .csv file (max 10 MB)</span>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => { setCsvFile(e.target.files?.[0] || null); setError(null); }}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mt-1"
            />
            {csvFile && (
              <span className="text-xs font-semibold text-emerald-700 block">\ud83d\udcc4 {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)</span>
            )}
          </label>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
            <Cpu className="h-4 w-4 shrink-0 mt-0.5" />
            <span>After upload, Scikit-Learn RandomForestClassifier + IsolationForest will automatically classify and analyze all transactions.</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" type="button" onClick={onClose} className="text-xs" disabled={uploading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={uploading || !csvFile} className="text-xs font-semibold bg-primary-600 text-white">
              {uploading ? (
                <><RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Upload className="mr-1.5 h-4 w-4" /> Upload &amp; Run AI Analysis</>
              )}
            </Button>
          </div>
        </form>
      </div>


    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LandlordVerificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<VerificationDetail | null>(null);


  const handleDownloadReport = async () => {
    if (!id || !detail) return;
    setIsDownloadingPdf(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8000/api/v1/verifications/${id}/report/pdf?download=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Unable to download report');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RentVerify_Report_RV-${detail.external_id || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download the report. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('rv_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [detailRes, aiRes] = await Promise.all([
        fetch(`/api/v1/landlord/verifications/${id}`, { headers }),
        fetch(`/api/v1/verifications/${id}/ai-results`, { headers }),
      ]);

      if (detailRes.ok) {
        const detailData: VerificationDetail = await detailRes.json();
        if (detailData.id) setDetail(detailData);
      }

      if (aiRes.ok) {
        const aiData: AIResults = await aiRes.json();
        setAiResults(aiData);
      } else {
        setAiResults(null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, refreshKey]);

  const handleProcessed = () => {
    setRefreshKey(k => k + 1);
  };

  // ─── Loading / Not Found ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm font-medium">Loading verification details...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <Card className="p-12 text-center space-y-3">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="text-base font-bold text-slate-800">Verification Request Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/landlord/verifications')} className="text-xs">
          Back to Verifications
        </Button>
      </Card>
    );
  }

  const state = deriveState(detail);
  const canUpload = state === 'CONSENT_GRANTED' || state === 'FAILED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/landlord/verifications')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Verification Details</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Request ID: RV-{detail.external_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canUpload && (
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20"
            >
              <Upload className="mr-1.5 h-4 w-4" /> Upload Statement CSV
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowShareModal(true)}
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <Share2 className="mr-1.5 h-4 w-4 text-primary-600" /> Share
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPdfModal(true)}
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <Eye className="mr-1.5 h-4 w-4 text-indigo-600" /> View PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={isDownloadingPdf}
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-primary-600" /> Preparing Download...
              </>
            ) : (
              <>
                <Download className="mr-1.5 h-4 w-4 text-emerald-600" /> Download Report
              </>
            )}
          </Button>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh page"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <StateBadge state={state} />
        </div>
      </div>

      {/* Context Card */}
      <Card className="p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Tenant</span>
              <span className="font-bold text-slate-900 text-sm">{detail.tenant_name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Property</span>
              <span className="font-bold text-slate-900 text-sm">{detail.property_name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Period</span>
              <span className="font-bold text-slate-900 text-sm">{detail.period}</span>
              {detail.monthly_rent_formatted && (
                <span className="text-[10px] text-slate-500 block">Rent: {detail.monthly_rent_formatted}/mo</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Tenant Consent</span>
              <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                detail.consent_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {detail.consent_status}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* State Machine Cards */}
      {state === 'PENDING_CONSENT' && <PendingConsentCard />}
      {state === 'CONSENT_GRANTED' && <ConsentGrantedCard onUpload={() => setShowUploadModal(true)} />}
      {state === 'PROCESSING' && <ProcessingCard />}
      {state === 'FAILED' && <FailedCard onRetry={() => setShowUploadModal(true)} />}

      {/* AI Results (only when COMPLETED and aiResults present) */}
      {state === 'COMPLETED' && aiResults && (
        <>
          <AISummaryCard summary={aiResults.summary} verificationStatus={detail.verification_status} />
          <ClassificationTable transactions={aiResults.transactions} />
          <AnomalyDetectionCard transactions={aiResults.transactions} monthlyRent={detail.monthly_rent_formatted} />
        </>
      )}

      {/* COMPLETED but no AI results yet */}
      {state === 'COMPLETED' && !aiResults && (
        <Card className="p-6 border border-slate-200 shadow-sm text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-primary-400" />
          <h3 className="text-sm font-bold text-slate-800">AI Results Not Yet Available</h3>
          <p className="text-xs text-slate-500">The verification completed but AI analysis data could not be retrieved.</p>
          <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)} className="text-xs">
            <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
          </Button>
        </Card>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && id && (
        <CsvUploadModal
          verificationId={id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleProcessed}
        />
      )}


    </div>
  );
}
