import React, { useState } from 'react';
import { 
  UserCheck, ShieldCheck, Upload, FileSpreadsheet, CheckCircle2, 
  XCircle, AlertCircle, FileText, Lock 
} from 'lucide-react';

export const TenantPortal: React.FC = () => {
  const [consentStatus, setConsentStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleApprove = () => {
    setConsentStatus('APPROVED');
  };

  const handleReject = () => {
    setConsentStatus('REJECTED');
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFileName(f.name);
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setFileUploaded(true);
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-blue-500" /> Tenant Verification & Consent Portal
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Review verification requests, manage data sharing consents, and securely upload your rental payment bank statements.
        </p>
      </div>

      {/* Consent Request Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Verification Request</span>
            <h2 className="text-xl font-bold text-white mt-0.5">Landlord Data Share Consent</h2>
            <p className="text-xs text-slate-400">Requested by: <strong className="text-slate-200">Apex Properties Ltd</strong></p>
          </div>
          <div>
            {consentStatus === 'PENDING' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PENDING YOUR APPROVAL
              </span>
            )}
            {consentStatus === 'APPROVED' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> CONSENT GRANTED
              </span>
            )}
            {consentStatus === 'REJECTED' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> CONSENT REJECTED
              </span>
            )}
          </div>
        </div>

        {/* Purpose & Privacy Notice */}
        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Data Scope & Privacy Protections
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            By granting consent, you authorize <strong>RentVerify AI</strong> to analyze your uploaded bank statement transactions solely for verifying rent payments for property <strong>Flat 402, Sunset Tower</strong>. 
            No third-party data selling or unauthorized sharing is performed.
          </p>
        </div>

        {/* Action Buttons */}
        {consentStatus === 'PENDING' && (
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleApprove}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition-all text-sm active:scale-95"
            >
              Approve Consent & Share Statement
            </button>
            <button
              onClick={handleReject}
              className="px-6 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold py-3 rounded-xl text-sm transition-all"
            >
              Decline Request
            </button>
          </div>
        )}
      </div>

      {/* CSV Bank Statement Uploader (Active only when consent approved) */}
      <div className={`glass-panel p-6 rounded-3xl border transition-all ${
        consentStatus === 'APPROVED' ? 'border-blue-500/40 opacity-100' : 'border-slate-800 opacity-60 pointer-events-none'
      } space-y-6`}>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" /> Upload Bank Statement (CSV)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload your CSV statement containing bank transactions for the period Oct 2025 to Mar 2026.
          </p>
        </div>

        {consentStatus !== 'APPROVED' ? (
          <div className="bg-slate-900/50 p-6 rounded-2xl text-center border border-slate-800">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Please approve the consent request above before uploading transactions.</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors relative bg-slate-900/40">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleSimulateUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            />
            
            {uploading ? (
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-blue-400">Normalizing and processing transactions with Scikit-learn AI...</p>
              </div>
            ) : fileUploaded ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Bank Statement Uploaded Successfully!</h3>
                <p className="text-xs text-slate-400 font-mono">{fileName || 'bank_statement_2026.csv'} (6 rental payments detected)</p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-semibold">
                  Verification Processing Completed
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-blue-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Drag & drop your bank statement CSV here</h3>
                <p className="text-xs text-slate-400">Or click anywhere to browse files on your device</p>
                <span className="inline-block text-[11px] text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full">
                  Supports standard HDFC, ICICI, SBI, Axis, HSBC bank CSV formats
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
