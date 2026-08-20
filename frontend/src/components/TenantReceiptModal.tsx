import React from 'react';
import { X, Download, CheckCircle2, ShieldCheck, Building2, Calendar, CreditCard, User, Hash } from 'lucide-react';
import { Button } from './ui/Button';

export interface ReceiptData {
  title?: string;
  receipt_id: string;
  tenant_name: string;
  property_name: string;
  landlord_name: string;
  rent_period: string;
  amount: number;
  amount_formatted?: string;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

interface TenantReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

export function TenantReceiptModal({ isOpen, onClose, receipt }: TenantReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-surface-200 print:shadow-none print:border-none">
        
        {/* Close Button - hidden in print */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 print:hidden p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2 pb-5 border-b border-surface-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>OFFICIAL DIGITAL RECEIPT</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">RENT PAYMENT RECEIPT</h2>
          <p className="text-xs text-slate-500 font-mono">Receipt ID: {receipt.receipt_id}</p>
        </div>

        {/* Amount Hero */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center shadow-lg">
          <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider block">Total Amount Paid</span>
          <span className="text-3xl font-black text-white block mt-1">
            {receipt.amount_formatted || `₹${receipt.amount.toLocaleString('en-IN')}`}
          </span>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-400/30">
            {receipt.payment_status === 'LATE' ? '✓ PAID (LATE)' : '✓ PAYMENT VERIFIED'}
          </span>
        </div>

        {/* Receipt Details Table */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-slate-400" /> Tenant Name
            </span>
            <span className="font-bold text-slate-900">{receipt.tenant_name}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-slate-400" /> Property
            </span>
            <span className="font-bold text-slate-900">{receipt.property_name}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Landlord / Manager
            </span>
            <span className="font-bold text-slate-900">{receipt.landlord_name}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Rent Period
            </span>
            <span className="font-bold text-slate-900">{receipt.rent_period}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Payment Date
            </span>
            <span className="font-bold text-slate-900">{receipt.payment_date}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-surface-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" /> Payment Method
            </span>
            <span className="font-bold text-slate-900">{receipt.payment_method}</span>
          </div>

          {receipt.razorpay_payment_id && (
            <div className="flex justify-between items-center py-2 border-b border-surface-100 font-mono text-[11px]">
              <span className="text-slate-500 flex items-center gap-1.5 font-sans font-medium text-xs">
                <Hash className="h-3.5 w-3.5 text-slate-400" /> Razorpay Payment ID
              </span>
              <span className="font-semibold text-slate-700">{receipt.razorpay_payment_id}</span>
            </div>
          )}

          {receipt.razorpay_order_id && (
            <div className="flex justify-between items-center py-2 border-b border-surface-100 font-mono text-[11px]">
              <span className="text-slate-500 flex items-center gap-1.5 font-sans font-medium text-xs">
                <Hash className="h-3.5 w-3.5 text-slate-400" /> Order ID
              </span>
              <span className="font-semibold text-slate-700">{receipt.razorpay_order_id}</span>
            </div>
          )}
        </div>

        {/* Footer info & Buttons */}
        <div className="mt-6 pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified by RentVerify Infrastructure
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial text-xs">
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-md shadow-indigo-600/20"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download Receipt
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
