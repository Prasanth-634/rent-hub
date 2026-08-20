import React from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Download, Calendar, 
  Building, User, DollarSign, FileText, Activity 
} from 'lucide-react';

interface VerificationDetailProps {
  verificationId: string;
  onBack: () => void;
}

export const VerificationDetail: React.FC<VerificationDetailProps> = ({ verificationId, onBack }) => {
  const isVerified = verificationId !== 'v-102';

  const mockMonthlyBreakdown = [
    { period: '2025-10', status: 'PAID', paid: '₹25,000', expected: '₹25,000', days_late: 0, tx_count: 1 },
    { period: '2025-11', status: 'PAID', paid: '₹25,000', expected: '₹25,000', days_late: 1, tx_count: 1 },
    { period: '2025-12', status: 'PAID', paid: '₹25,000', expected: '₹25,000', days_late: 0, tx_count: 1 },
    { period: '2026-01', status: 'PAID', paid: '₹25,000', expected: '₹25,000', days_late: 0, tx_count: 1 },
    { period: '2026-02', status: 'PAID', paid: '₹25,000', expected: '₹25,000', days_late: 2, tx_count: 1 },
    { period: '2026-03', status: isVerified ? 'PAID' : 'MISSED', paid: isVerified ? '₹25,000' : '₹0', expected: '₹25,000', days_late: isVerified ? 0 : 30, tx_count: isVerified ? 1 : 0 },
  ];

  const mockTransactions = [
    { id: 'tx-1', date: '2025-10-03', desc: 'RENT FOR OCT 2025', amount: '₹25,000', prob: 0.99, anomaly: false, isRent: true },
    { id: 'tx-2', date: '2025-11-04', desc: 'MONTHLY RENT NOV', amount: '₹25,000', prob: 0.98, anomaly: false, isRent: true },
    { id: 'tx-3', date: '2025-11-15', desc: 'ZOMATO ONLINE ORDER', amount: '₹450', prob: 0.01, anomaly: false, isRent: false },
    { id: 'tx-4', date: '2025-12-02', desc: 'HOUSING LEASE PAYMENT', amount: '₹25,000', prob: 0.97, anomaly: false, isRent: true },
    { id: 'tx-5', date: '2026-01-05', desc: 'RENT JAN 2026', amount: '₹25,000', prob: 0.99, anomaly: false, isRent: true },
    { id: 'tx-6', date: '2026-02-05', desc: 'RENT FEB 2026', amount: '₹25,000', prob: 0.99, anomaly: false, isRent: true },
  ];

  const handleDownloadJSON = () => {
    const reportData = {
      verification_id: verificationId,
      status: isVerified ? 'VERIFIED' : 'REQUIRES_REVIEW',
      confidence_score: isVerified ? 0.98 : 0.65,
      tenant: "John Doe",
      property: "Flat 402, Sunset Tower, Bandra West",
      summary: {
        months_expected: 6,
        on_time_count: isVerified ? 6 : 4,
        late_count: isVerified ? 0 : 1,
        missed_count: isVerified ? 0 : 1
      },
      monthly_analysis: mockMonthlyBreakdown
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent_verification_report_${verificationId}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Back button & title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <button
          onClick={handleDownloadJSON}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Download className="w-4 h-4" /> Download Standard JSON Report
        </button>
      </div>

      {/* Main Status Header Card */}
      <div className={`p-6 rounded-3xl border ${
        isVerified 
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30' 
          : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
      } glass-panel space-y-6`}>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {isVerified ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> VERIFIED TENANT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> REQUIRES REVIEW
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">ID: {verificationId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-2">Rent Verification Analysis Report</h1>
            <p className="text-xs text-slate-400 mt-1">Tenant: <strong className="text-slate-200">John Doe</strong> • Lease Period: <strong className="text-slate-200">Oct 2025 – Mar 2026</strong></p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">AI Confidence Score</p>
              <h3 className={`text-2xl font-extrabold font-mono ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isVerified ? '98%' : '65%'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400">Expected Months</span>
            <p className="text-lg font-bold text-white">6 Months</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">On-Time Payments</span>
            <p className="text-lg font-bold text-emerald-400">{isVerified ? '6' : '4'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Late Payments</span>
            <p className="text-lg font-bold text-amber-400">{isVerified ? '0' : '1'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Missed Payments</span>
            <p className="text-lg font-bold text-rose-400">{isVerified ? '0' : '1'}</p>
          </div>
        </div>

      </div>

      {/* Monthly Matching Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" /> Monthly Payment Matching Engine Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Expected Rent</th>
                <th className="py-3 px-4">Days Late</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockMonthlyBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">{row.period}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{row.paid}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.expected}</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-300">{row.days_late} days</td>
                  <td className="py-3.5 px-4">
                    {row.status === 'PAID' && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PAID</span>}
                    {row.status === 'MISSED' && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">MISSED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingested Bank CSV Transactions Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" /> Ingested Bank Transactions & Scikit-Learn Classifications
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Random Forest Label</th>
                <th className="py-3 px-4">Rent Probability</th>
                <th className="py-3 px-4">Anomaly Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 text-xs font-mono text-slate-300">{tx.date}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-200">{tx.desc}</td>
                  <td className="py-3 px-4 font-bold text-white">{tx.amount}</td>
                  <td className="py-3 px-4">
                    {tx.isRent ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">RENT</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400">NON_RENT</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-300">{Math.round(tx.prob * 100)}%</td>
                  <td className="py-3 px-4">
                    {tx.anomaly ? (
                      <span className="text-xs font-bold text-rose-400">ANOMALOUS</span>
                    ) : (
                      <span className="text-xs text-slate-500">NORMAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
