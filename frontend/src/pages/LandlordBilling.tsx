import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  CreditCard, QrCode, CheckCircle2, ShieldCheck, Zap, X, History, FileText,
  ArrowDownLeft, ArrowUpRight, AlertTriangle, Key, Layers, ArrowRight, Activity, Info
} from 'lucide-react';

interface ReceiptDetails {
  receipt_id: string;
  payment_id: string;
  order_id: string;
  landlord_name: string;
  organization_name: string;
  package_name: string;
  credits_purchased: number;
  amount_formatted: string;
  currency: string;
  status: string;
  payment_date: string;
}

export function LandlordBilling() {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'payments' | 'ledger' | 'api'>('payments');

  // Payment Flow Modal States
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<'1000' | '5000' | '15000'>('5000');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');

  // UPI QR & Webhook Simulation Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDetails, setQrDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'WAITING' | 'PAID' | 'FAILED' | 'PENDING'>('WAITING');
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);

  // Receipt Modal
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/billing', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unable to load billing information.');
        return res.json();
      })
      .then(data => {
        setBilling(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load billing information.');
        setLoading(false);
      });
  };

  const handleOpenPurchaseModal = (packId?: '1000' | '5000' | '15000') => {
    if (packId) setSelectedPackId(packId);
    setShowPackageModal(true);
  };

  const handleCreateOrder = async () => {
    setSubmittingOrder(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/billing/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credit_package_id: selectedPackId
        })
      });
      const data = await res.json();
      setSubmittingOrder(false);
      if (res.ok) {
        setQrDetails(data);
        setShowPackageModal(false);
        setShowQRModal(true);
        setPaymentStatus('WAITING');
        setPaymentMsg('Waiting for backend Razorpay webhook payment confirmation...');
      } else {
        alert(data.detail || 'Failed to create payment order');
      }
    } catch {
      setSubmittingOrder(false);
      alert('Connection error creating payment order');
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!qrDetails?.order_id && !qrDetails?.payment_id) return;
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch(`/api/v1/payments/simulate-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_id: qrDetails.payment_id || `pay_sim_${Date.now()}`,
          order_id: qrDetails.order_id,
          status: 'PAID'
        })
      });
      const json = await res.json();
      if (res.ok && json.status === 'PAID') {
        setPaymentStatus('PAID');
        setPaymentMsg(`✓ Payment Successful! ${json.credits_added || qrDetails.credits_to_add} Verification Credits Added. New Balance: ${json.new_balance || (billing?.credit_summary?.available_credits + (json.credits_added || 5000))} Credits`);
        fetchBilling();
      } else {
        setPaymentStatus('FAILED');
        setPaymentMsg('Payment verification failed.');
      }
    } catch {
      setPaymentStatus('FAILED');
      setPaymentMsg('Payment was not completed.');
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch(`/api/v1/landlord/payments/${paymentId}/receipt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReceipt(data);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <Card className="p-12 text-center text-slate-400 text-xs font-medium">Loading billing & credit details...</Card>;
  }

  if (error || !billing) {
    return (
      <Card className="p-12 text-center space-y-3">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="text-base font-bold text-slate-800">Unable to load billing information</h3>
        <p className="text-xs text-slate-500">Please check your internet connection or session.</p>
        <Button variant="outline" onClick={fetchBilling} className="text-xs">Try Again</Button>
      </Card>
    );
  }

  const { current_plan, credit_summary, credit_usage, api_access, warnings, payment_history, credit_activity } = billing;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Verification Credits</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your verification credits, payments, and API usage.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => handleOpenPurchaseModal('5000')}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-5 shadow-md shadow-primary-600/20"
        >
          <QrCode className="mr-1.5 h-4 w-4" /> + Buy Verification Credits
        </Button>
      </div>

      {/* Section 15: Low / Zero Credit Warning Banners */}
      {warnings.is_zero_credits && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold block">No verification credits remaining.</span>
              <span className="text-red-700 font-normal">New rental verification processing is blocked until credits are added.</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => handleOpenPurchaseModal('5000')} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0">
            Buy Verification Credits
          </Button>
        </div>
      )}

      {warnings.is_low_credits && !warnings.is_zero_credits && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Your verification credits are running low.</span>
              <span className="text-amber-800 font-normal">Remaining Credits: {credit_summary.available_credits.toLocaleString()}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleOpenPurchaseModal('5000')} className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold shrink-0">
            Buy More Credits
          </Button>
        </div>
      )}

      {/* Top Cards Grid: Section 1 (Current Plan), Section 2 (Credit Summary), Section 3 (Credit Usage) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* SECTION 1 – CURRENT PLAN */}
        <Card className="p-6 border border-surface-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-semibold">CURRENT PLAN</span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold tracking-wide">
                {current_plan.status || 'ACTIVE'}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{current_plan.name}</h3>
              <div className="text-xl font-bold text-slate-900">{current_plan.price}</div>
              <p className="text-xs text-slate-500 mt-2">Next Billing Date: <span className="font-semibold text-slate-700">{current_plan.next_billing_date}</span></p>
            </div>
          </div>

          <Button variant="outline" className="w-full text-xs text-slate-700 border-surface-300 hover:bg-surface-50 font-semibold">
            Manage Plan
          </Button>
        </Card>

        {/* SECTION 2 – VERIFICATION CREDIT SUMMARY */}
        <Card className="p-6 border border-surface-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VERIFICATION CREDITS</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-100">
                {credit_summary.rule}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Available Credits</span>
              <h3 className="text-4xl font-extrabold text-emerald-600 tracking-tight mt-0.5">{credit_summary.available_credits.toLocaleString()}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Used This Month</span>
                <span className="font-bold text-slate-700">{credit_summary.used_this_month.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Purchased Total</span>
                <span className="font-bold text-slate-700">{credit_summary.purchased_total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              "{credit_summary.explanation}"
            </p>
          </div>

          <Button variant="primary" onClick={() => handleOpenPurchaseModal('5000')} className="w-full bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md">
            + Buy Verification Credits
          </Button>
        </Card>

        {/* SECTION 3 – CREDIT USAGE */}
        <Card className="p-6 border border-surface-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-surface-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CREDIT USAGE THIS MONTH</span>
              <span className="text-xs font-mono font-bold text-primary-600">{credit_usage.usage_percentage}% Used</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-slate-900">{credit_usage.used_this_month.toLocaleString()} / {credit_usage.total_credits.toLocaleString()} credits used</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-100 h-3 rounded-full overflow-hidden p-0.5 border border-surface-200">
                <div
                  className="bg-gradient-to-r from-primary-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, credit_usage.usage_percentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs pt-1 text-slate-600 font-medium">
                <span><strong className="text-slate-900">{credit_usage.used_this_month.toLocaleString()}</strong> Used</span>
                <span><strong className="text-emerald-600">{credit_usage.credits_remaining.toLocaleString()}</strong> Remaining</span>
              </div>
            </div>
          </div>

          {/* Section 4 & 5 Mini Status */}
          <div className="p-3 bg-surface-50 rounded-2xl border border-surface-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Billing Integrity Engine</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">Real-Time DB Sync</span>
          </div>
        </Card>

      </div>

      {/* SECTION 4 – HOW VERIFICATION CREDITS WORK */}
      <Card className="p-6 border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-900">
          <Info className="h-5 w-5 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">HOW VERIFICATION CREDITS WORK</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3.5 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center mx-auto text-xs">1</div>
            <div className="font-bold text-slate-900">Buy Credits</div>
            <p className="text-[10px] text-slate-500">Choose a credit package via Razorpay</p>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-300">
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center mx-auto text-xs">2</div>
            <div className="font-bold text-slate-900">API / Dashboard</div>
            <p className="text-[10px] text-slate-500">Process tenant rental statement</p>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-300">
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center mx-auto text-xs">3</div>
            <div className="font-bold text-slate-900">1 Credit Used</div>
            <p className="text-[10px] text-slate-500">1 Verification = 1 Credit consumed</p>
          </div>
        </div>
      </Card>

      {/* SECTION 5 – API ACCESS & SECTION 14 – API USAGE SUMMARY */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API ACCESS & CONSUMPTION SUMMARY</h3>
              <p className="text-[11px] text-slate-500">Developer API credentials & credit deduction metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs h-8 px-3">
              Manage API Key
            </Button>
            <Button variant="outline" className="text-xs h-8 px-3 text-primary-600 border-primary-200">
              View API Usage
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">API Status</span>
            <span className="font-extrabold text-emerald-600 text-sm">{api_access.status}</span>
          </div>

          <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">API Key</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{api_access.api_key_masked}</span>
          </div>

          <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Requests This Month</span>
            <span className="font-extrabold text-slate-900 text-sm">{api_access.requests_this_month}</span>
          </div>

          <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Credits Used</span>
            <span className="font-extrabold text-indigo-600 text-sm">{credit_summary.used_this_month}</span>
          </div>

          <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Credits Available</span>
            <span className="font-extrabold text-emerald-600 text-sm">{credit_summary.available_credits.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* SECTION 6 – CREDIT PACKAGES */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="border-b border-surface-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">BUY VERIFICATION CREDITS</h3>
          <p className="text-xs text-slate-500">Credits are used for rental verification requests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: '1000', credits: '1,000 Verification Credits', price: '₹29', desc: 'Ideal for small property portfolios' },
            { id: '5000', credits: '5,000 Verification Credits', price: '₹99', desc: 'Popular choice for active landlords', popular: true },
            { id: '15000', credits: '15,000 Verification Credits', price: '₹249', desc: 'High-volume verification package' },
          ].map((pack) => (
            <div
              key={pack.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 relative transition-all ${
                pack.popular
                  ? 'border-primary-600 bg-gradient-to-b from-primary-50/50 via-white to-white shadow-md ring-2 ring-primary-500/20'
                  : 'border-surface-200 bg-white hover:border-surface-300'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                  MOST POPULAR
                </span>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{pack.credits}</h4>
                <div className="text-2xl font-extrabold text-slate-900">{pack.price}</div>
                <p className="text-xs text-slate-500">{pack.desc}</p>
              </div>

              <Button
                variant={pack.popular ? 'primary' : 'outline'}
                onClick={() => handleOpenPurchaseModal(pack.id as any)}
                className={`w-full text-xs font-bold ${
                  pack.popular ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm' : 'border-surface-300 hover:bg-surface-100'
                }`}
              >
                Buy
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* TABLES SECTION: SECTION 11 (Payment History) & SECTION 12 (Credit Activity) */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'payments' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-surface-100'
              }`}
            >
              <FileText className="inline-block mr-1.5 h-3.5 w-3.5" /> Payment History (Section 11)
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'ledger' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-surface-100'
              }`}
            >
              <History className="inline-block mr-1.5 h-3.5 w-3.5" /> Credit Activity Ledger (Section 12)
            </button>
          </div>
        </div>

        {/* SECTION 11 – PAYMENT HISTORY */}
        {activeTab === 'payments' && (
          <div>
            {payment_history.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
                <div className="text-sm font-bold text-slate-700">No payments yet.</div>
                <p className="text-xs text-slate-400">Purchased credit packages will appear here with Razorpay receipts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Date</th>
                      <th className="p-3.5">Transaction ID</th>
                      <th className="p-3.5">Package</th>
                      <th className="p-3.5">Credits</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right rounded-r-xl">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {payment_history.map((p: any) => (
                      <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{p.date}</td>
                        <td className="p-3.5 font-bold font-mono text-slate-900">{p.transaction_id}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{p.package}</td>
                        <td className="p-3.5 font-bold text-emerald-600">+{p.credits?.toLocaleString()} Credits</td>
                        <td className="p-3.5 font-extrabold text-slate-900">{p.amount}</td>
                        <td className="p-3.5 font-medium text-slate-700">{p.payment_method}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="outline"
                            onClick={() => handleViewReceipt(p.id)}
                            className="text-xs text-primary-600 border-primary-200 hover:bg-primary-50 h-7 px-2.5"
                          >
                            View Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 12 – CREDIT TRANSACTION HISTORY */}
        {activeTab === 'ledger' && (
          <div>
            {credit_activity.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">No credit activity yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Date</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5">Credits</th>
                      <th className="p-3.5">Balance</th>
                      <th className="p-3.5 text-right rounded-r-xl">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {credit_activity.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-surface-50 transition-colors">
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                        <td className="p-3.5 text-slate-800 font-medium">{tx.description}</td>
                        <td className={`p-3.5 font-extrabold ${String(tx.credits).startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.credits}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{tx.balance}</td>
                        <td className="p-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-800' :
                            tx.type === 'USAGE' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* SECTION 7 – PAYMENT MODAL */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-surface-200 relative">
            <button onClick={() => setShowPackageModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">BUY VERIFICATION CREDITS</h3>
              <p className="text-xs text-slate-500">Confirm package details and payment method.</p>
            </div>

            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-surface-200">
                <span className="text-slate-500">Package:</span>
                <span className="font-bold text-slate-900">
                  {selectedPackId === '1000' ? '1,000 Credits' : selectedPackId === '5000' ? '5,000 Credits' : '15,000 Credits'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200">
                <span className="text-slate-500">Price:</span>
                <span className="font-bold text-slate-900">
                  {selectedPackId === '1000' ? '₹29' : selectedPackId === '5000' ? '₹99' : '₹249'}
                </span>
              </div>
              <div className="flex justify-between py-1 font-extrabold text-sm text-slate-900">
                <span>Total:</span>
                <span>{selectedPackId === '1000' ? '₹29' : selectedPackId === '5000' ? '₹99' : '₹249'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Payment Methods</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR' },
                  { id: 'CARD', label: 'Cards' },
                  { id: 'NET_BANKING', label: 'Net Banking' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === m.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                        : 'border-surface-200 text-slate-600 hover:bg-surface-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowPackageModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateOrder}
                isLoading={submittingOrder}
                className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-6"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8 – UPI PAYMENT & BACKEND VERIFICATION MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-surface-200 relative">
            <button onClick={() => setShowQRModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Scan QR Code Using Your UPI App</h3>
              <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM UPI</p>
            </div>

            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 text-center space-y-3">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                {qrDetails?.upi_qr_svg ? (
                  <img src={qrDetails.upi_qr_svg} alt="UPI QR Code" className="h-44 w-44 object-contain mx-auto" />
                ) : (
                  <div className="h-44 w-44 bg-surface-100 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                )}
              </div>
              <div className="text-xs font-mono font-bold text-slate-700">
                Order ID: <span className="text-primary-600">{qrDetails?.order_id}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Total Amount: {qrDetails?.amount_formatted} ({qrDetails?.credits_to_add?.toLocaleString()} Credits)
              </div>
            </div>

            {paymentStatus === 'WAITING' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs text-center font-medium animate-pulse">
                  Payment Status: Waiting for payment...
                </div>
                <Button variant="primary" onClick={simulatePaymentSuccess} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">
                  ✓ Simulate Verified Razorpay Webhook Payment
                </Button>
              </div>
            )}

            {paymentStatus === 'PAID' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <div>{paymentMsg}</div>
                <Button variant="outline" onClick={() => setShowQRModal(false)} className="text-xs mt-2">
                  Done
                </Button>
              </div>
            )}

            {paymentStatus === 'FAILED' && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center space-y-2">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
                <div>{paymentMsg}</div>
                <Button variant="primary" onClick={simulatePaymentSuccess} className="w-full bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold mt-2">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-surface-200 relative">
            <button onClick={() => setReceipt(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-surface-200 pb-4 text-center space-y-1">
              <div className="text-lg font-extrabold text-primary-600">RentVerify Official Payment Receipt</div>
              <p className="text-[11px] text-slate-400">Receipt ID: {receipt.receipt_id}</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Landlord Name:</span>
                <span className="font-bold text-slate-900">{receipt.landlord_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Organization:</span>
                <span className="font-bold text-slate-900">{receipt.organization_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Package:</span>
                <span className="font-bold text-slate-900">{receipt.package_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Credits Purchased:</span>
                <span className="font-bold text-emerald-600">+{receipt.credits_purchased?.toLocaleString()} Credits</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Amount Paid:</span>
                <span className="font-extrabold text-slate-900">{receipt.amount_formatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Order ID:</span>
                <span className="font-mono text-slate-900">{receipt.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-100">
                <span className="text-slate-400 font-semibold">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-900">{receipt.payment_id}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setReceipt(null)} className="text-xs">
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
