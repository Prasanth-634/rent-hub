import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';

interface VerificationHistoryItem {
  verification_id: string;
  requested_by: string;
  period: string;
  status: string;
  completed_date: string;
  expected_payments: number;
  verified_payments: number;
  late_payments: number;
  partial_payments: number;
  missed_payments: number;
  simple_explanation: string;
}

export function TenantVerificationHistory() {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<VerificationHistoryItem | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/tenant/verification-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification History</h1>
        <p className="text-xs text-slate-500 mt-1">Completed rental payment verifications disclosed under your authorization.</p>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading verification history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Completed Verifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">When your rental verifications are completed, your verified records will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Verification ID</th>
                  <th className="p-3.5">Requested By</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Completed Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {history.map((h) => (
                  <tr key={h.verification_id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">RV-{h.verification_id}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{h.requested_by}</td>
                    <td className="p-3.5 text-slate-600">{h.period}</td>
                    <td className="p-3.5">
                      {h.status === 'VERIFIED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ VERIFIED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          REQUIRES REVIEW
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">{h.completed_date}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedItem(h)}
                        className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 px-3"
                      >
                        View Result
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tenant-Friendly Verification Result Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-surface-200 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Rental Verification Result</h3>
                <p className="text-xs text-slate-500 font-mono">ID: RV-{selectedItem.verification_id}</p>
              </div>
            </div>

            {/* Status & Period Card */}
            <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Period</span>
                <span className="text-xs font-bold text-slate-900">{selectedItem.period}</span>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                  ✓ {selectedItem.status}
                </span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Payment Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Expected</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedItem.expected_payments}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Verified</span>
                  <span className="text-lg font-extrabold text-emerald-700">{selectedItem.verified_payments}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Late</span>
                  <span className="text-lg font-extrabold text-amber-700">{selectedItem.late_payments}</span>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Partial</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedItem.partial_payments}</span>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Missed</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedItem.missed_payments}</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Simple Language Explanation */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Verification Engine Summary</h4>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {selectedItem.simple_explanation}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedItem(null)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6">
                Close Result
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
