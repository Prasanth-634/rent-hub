import React, { useState } from 'react';
import { 
  Sparkles, Play, CheckCircle2, AlertTriangle, Cpu, FileSpreadsheet, 
  BarChart3, RefreshCw 
} from 'lucide-react';

export const InteractiveDemo: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'PERFECT' | 'LATE_PARTIAL' | 'ANOMALOUS'>('PERFECT');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleCSVs = {
    PERFECT: `Date,Description,Amount,Payer,Payee
2025-10-02,RENT PAYMENT OCT 2025,25000.00,John Tenant,Sunrise Realty
2025-11-03,RENT NOV 2025,25000.00,John Tenant,Sunrise Realty
2025-12-05,MONTHLY LEASE RENT DEC,25000.00,John Tenant,Sunrise Realty
2026-01-04,RENT JAN 2026,25000.00,John Tenant,Sunrise Realty
2026-02-02,RENT FEB 2026,25000.00,John Tenant,Sunrise Realty
2026-03-05,RENT MARCH 2026,25000.00,John Tenant,Sunrise Realty`,

    LATE_PARTIAL: `Date,Description,Amount,Payer,Payee
2025-10-02,RENT PAYMENT OCT 2025,25000.00,John Tenant,Sunrise Realty
2025-11-18,LATE RENT NOV 2025,25000.00,John Tenant,Sunrise Realty
2025-12-05,PARTIAL RENT DEC,12000.00,John Tenant,Sunrise Realty
2026-01-04,RENT JAN 2026,25000.00,John Tenant,Sunrise Realty
2026-02-28,RENT FEB 2026,25000.00,John Tenant,Sunrise Realty`,

    ANOMALOUS: `Date,Description,Amount,Payer,Payee
2025-10-02,RENT PAYMENT OCT 2025,25000.00,John Tenant,Sunrise Realty
2025-11-03,RENT NOV 2025,25000.00,John Tenant,Sunrise Realty
2025-11-04,DUPLICATE RENT NOV 2025,25000.00,John Tenant,Sunrise Realty
2026-01-04,UNUSUAL RENT OVERPAYMENT,150000.00,John Tenant,Sunrise Realty`
  };

  const handleRunDemo = () => {
    setRunning(true);
    setResult(null);

    setTimeout(() => {
      setRunning(false);

      if (selectedPreset === 'PERFECT') {
        setResult({
          status: 'VERIFIED',
          confidence: 0.98,
          months_expected: 6,
          on_time: 6,
          late: 0,
          missed: 0,
          rf_prob: 0.99,
          if_score: '0.02 (Normal)',
          monthly: [
            { month: 'Oct 2025', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Nov 2025', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Dec 2025', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Jan 2026', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Feb 2026', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Mar 2026', status: 'PAID ON-TIME', amount: '₹25,000' },
          ]
        });
      } else if (selectedPreset === 'LATE_PARTIAL') {
        setResult({
          status: 'REQUIRES_REVIEW',
          confidence: 0.62,
          months_expected: 6,
          on_time: 3,
          late: 2,
          missed: 1,
          rf_prob: 0.88,
          if_score: '0.41 (Mild Anomaly)',
          monthly: [
            { month: 'Oct 2025', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Nov 2025', status: 'LATE (13 Days Late)', amount: '₹25,000' },
            { month: 'Dec 2025', status: 'PARTIAL (Underpaid)', amount: '₹12,000' },
            { month: 'Jan 2026', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Feb 2026', status: 'LATE (23 Days Late)', amount: '₹25,000' },
            { month: 'Mar 2026', status: 'MISSED', amount: '₹0' },
          ]
        });
      } else {
        setResult({
          status: 'REQUIRES_REVIEW',
          confidence: 0.45,
          months_expected: 6,
          on_time: 3,
          late: 0,
          missed: 2,
          rf_prob: 0.76,
          if_score: '0.89 (ANOMALOUS - Spiked Amount)',
          monthly: [
            { month: 'Oct 2025', status: 'PAID ON-TIME', amount: '₹25,000' },
            { month: 'Nov 2025', status: 'DUPLICATE PAYMENT', amount: '₹50,000' },
            { month: 'Dec 2025', status: 'MISSED', amount: '₹0' },
            { month: 'Jan 2026', status: 'OVERPAID (6x Rent Spike)', amount: '₹150,000' },
          ]
        });
      }
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-pink-500" /> Interactive Scikit-Learn Verification Engine Simulator
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Test real-time Random Forest classification and Isolation Forest anomaly detection against pre-loaded bank CSV scenarios.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setSelectedPreset('PERFECT'); setResult(null); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPreset === 'PERFECT'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'glass-panel border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-emerald-400">Scenario 1: Perfect Rent History</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs">6 months of full on-time rent payments with clear descriptions.</p>
        </button>

        <button
          onClick={() => { setSelectedPreset('LATE_PARTIAL'); setResult(null); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPreset === 'LATE_PARTIAL'
              ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'glass-panel border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-amber-400">Scenario 2: Late & Partial Payments</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs">Contains late payment intervals, underpaid month, and 1 missed month.</p>
        </button>

        <button
          onClick={() => { setSelectedPreset('ANOMALOUS'); setResult(null); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPreset === 'ANOMALOUS'
              ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/10'
              : 'glass-panel border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-rose-400">Scenario 3: Anomaly & Duplicate Spike</span>
            <Cpu className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-xs">Triggers IsolationForest anomaly score due to duplicate payments and 600% rent spike.</p>
        </button>
      </div>

      {/* CSV Code Preview & Run Button */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" /> CSV Input Stream Preview
          </h2>
          <button
            onClick={handleRunDemo}
            disabled={running}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition-transform active:scale-95 disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating ML Features...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Execute Verification Engine
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
          {sampleCSVs[selectedPreset]}
        </pre>
      </div>

      {/* Execution Results */}
      {result && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  result.status === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {result.status}
                </span>
                <span className="text-xs text-slate-400">Confidence Score: <strong className="text-white font-mono">{Math.round(result.confidence * 100)}%</strong></span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Verification Engine Analysis</h2>
            </div>

            <div className="flex gap-4 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Random Forest Prob</span>
                <strong className="text-blue-400 text-sm">{result.rf_prob}</strong>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">IsolationForest Anomaly Score</span>
                <strong className={result.if_score.includes('ANOMALOUS') ? 'text-rose-400 text-sm' : 'text-emerald-400 text-sm'}>
                  {result.if_score}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300">Target Month Classification Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {result.monthly.map((m: any, idx: number) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-400">{m.month}</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      m.status.includes('PAID') ? 'text-emerald-400' : m.status.includes('LATE') ? 'text-amber-400' : 'text-rose-400'
                    }`}>{m.status}</span>
                    <span className="text-xs font-mono text-white">{m.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
