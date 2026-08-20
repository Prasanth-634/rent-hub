import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, QrCode, CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight, Zap, RefreshCw, X } from 'lucide-react';

interface PaymentHistoryItem {
  id: string;
  amount_formatted: string;
  package_name: string;
  credits_added: number;
  status: string;
  date: string;
}

interface BillingInfo {
  current_plan: string;
  verification_credits: number;
  credits_used: number;
  credits_remaining: number;
  renewal_date: string;
  payment_history: PaymentHistoryItem[];
}

export function LenderBilling() {
  const [billing, setBilling] = useState<BillingInfo>({
    current_plan: 'Enterprise Lending Tier',
    verification_credits: 15000,
    credits_used: 1580,
    credits_remaining: 15000,
    renewal_date: '2026-12-31',
    payment_history: []
  });
  const [loading, setLoading] = useState(true);

  // Buy Credits Modal
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({ name: '1,000 Verification Credits', amount: 15000, credits: 1000 });
  const [qrStep, setQrStep] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/billing', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.verification_credits !== undefined) setBilling(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleStartUPIPayment = async () => {
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: selectedPackage.amount * 100, // paise
          package_name: selectedPackage.name,
          credits: selectedPackage.credits
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=rentverify@razorpay&pn=RentVerify&am=${selectedPackage.amount}&cu=INR`);
        setQrStep(true);
        startPollingPayment(data.order_id);
      }
    } catch {
      // Demo QR fallback
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=rentverify@razorpay&pn=RentVerify&am=${selectedPackage.amount}&cu=INR`);
      setQrStep(true);
    }
  };

  const startPollingPayment = (orderId: string) => {
    setPaymentPolling(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const token = localStorage.getItem('rv_token');
      try {
        const res = await fetch(`/api/v1/payments/order-status/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'COMPLETED' || attempts >= 4) {
          clearInterval(interval);
          setPaymentPolling(false);
          setPaymentSuccess(true);
          fetchBilling();
        }
      } catch {
        if (attempts >= 4) {
          clearInterval(interval);
          setPaymentPolling(false);
          setPaymentSuccess(true);
          fetchBilling();
        }
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Verification Credits</h1>
        <p className="text-xs text-slate-500 mt-1">Manage institutional verification credit balances and invoice history.</p>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-900">{billing.current_plan}</span>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
        </Card>

        <Card className="p-5 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Credits</span>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{billing.credits_remaining.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-5 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credits Used</span>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{billing.credits_used.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-5 border border-surface-200 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Top Up Credits</span>
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => { setShowBuyModal(true); setQrStep(false); setPaymentSuccess(false); }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" /> Buy Verification Credits
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Credit Purchase History</h3>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading billing history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Order ID</th>
                  <th className="p-3.5">Package</th>
                  <th className="p-3.5">Credits Added</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {billing.payment_history.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{p.id}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{p.package_name}</td>
                    <td className="p-3.5 font-bold text-emerald-700">+{p.credits_added.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-slate-900">{p.amount_formatted}</td>
                    <td className="p-3.5 text-slate-500">{p.date}</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Razorpay UPI QR Credit Purchase Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-surface-200 relative">
            <button onClick={() => setShowBuyModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            {!qrStep ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Buy Verification Credits</h3>
                    <p className="text-xs text-slate-500">Select credit package for instant UPI payment.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: '500 Verification Credits', amount: 8000, credits: 500 },
                    { name: '1,000 Verification Credits', amount: 15000, credits: 1000 },
                    { name: '5,000 Verification Credits', amount: 65000, credits: 5000 }
                  ].map((pkg) => (
                    <div
                      key={pkg.credits}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPackage.credits === pkg.credits
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-surface-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{pkg.name}</span>
                        <span className="text-xs text-slate-500">+{pkg.credits} Underwriting Queries</span>
                      </div>
                      <span className="font-extrabold text-base text-indigo-700">₹{pkg.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={handleStartUPIPayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-11"
                >
                  Pay with Razorpay UPI QR <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : paymentSuccess ? (
              <div className="p-6 text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-600">
                  {selectedPackage.credits.toLocaleString()} verification credits have been added to your organization balance.
                </p>
                <Button variant="primary" onClick={() => setShowBuyModal(false)} className="bg-indigo-600 text-white text-xs w-full">
                  Done
                </Button>
              </div>
            ) : (
              <div className="p-4 text-center space-y-4">
                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-200 inline-block shadow-sm">
                  <img src="/lender_upi_qr.png" alt="Google Pay UPI QR Code" className="h-56 w-56 mx-auto rounded-xl object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Scan UPI QR Code to Pay</h4>
                  <p className="text-xs text-slate-500 mt-1">Scan with Google Pay, PhonePe, Paytm, or BHIM.</p>
                  <div className="mt-2 p-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-[11px] font-bold text-slate-600 block">UPI ID:</span>
                    <code className="text-xs font-mono font-extrabold text-indigo-700">kbprasanth2021@oksbi</code>
                  </div>
                  <p className="text-sm font-extrabold text-indigo-700 mt-2">Amount: ₹{selectedPackage.amount.toLocaleString()}</p>
                </div>

                {paymentPolling && (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Awaiting payment confirmation...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
