import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Upload, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface TransactionItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  payment_type: string;
  payment_status: string;
  verification_status: string;
}

export function TenantTransactionsList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/tenant/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTransactions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">View your rental payment transactions disclosed for verification.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/tenant/transactions/upload')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
        >
          <Upload className="mr-2 h-4 w-4" /> Upload CSV Data
        </Button>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Rental Transactions Uploaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Upload your bank statement CSV to add your rental payment records.</p>
            <Button
              variant="outline"
              onClick={() => navigate('/tenant/transactions/upload')}
              className="text-xs"
            >
              Upload Rental CSV
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Date</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Type</th>
                  <th className="p-3.5">Payment Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">{tx.date}</td>
                    <td className="p-3.5 font-medium text-slate-800">{tx.description}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                        {tx.payment_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {tx.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-semibold">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" /> {tx.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
