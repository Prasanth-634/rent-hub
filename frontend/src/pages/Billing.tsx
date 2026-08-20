import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { PaymentModal } from '../components/ui/PaymentModal';
import { Check, CreditCard, Download, ShieldCheck, Zap, ShoppingCart, Smartphone, Landmark, CheckCircle2, QrCode } from 'lucide-react';

const initialPlans = [
  {
    name: 'Starter',
    price: 99,
    period: '/month',
    description: 'Perfect for independent landlords and small property managers.',
    verifications: '100 verifications / mo',
    features: ['RandomForest AI Classification', 'Tenant Consent Portal', 'Email Support', 'Basic PDF Reports'],
    current: false,
    badge: null,
  },
  {
    name: 'Professional',
    price: 299,
    period: '/month',
    description: 'Designed for growing property management companies and lenders.',
    verifications: '1,000 verifications / mo',
    features: ['Full ML Engine + Anomaly Detection', 'REST API Access', 'Razorpay Dynamic UPI QR Checkout', 'Custom PDF Branding', 'Priority Support (24/7)'],
    current: true,
    badge: 'Current Plan',
  },
  {
    name: 'Enterprise',
    price: 599,
    period: '/month',
    description: 'Tailored solutions for financial institutions, banks, and large lenders.',
    verifications: '15,000 verifications / mo',
    features: ['Dedicated AI Model Fine-tuning', 'Custom Webhooks & SLA', 'Dedicated Account Manager', 'On-premise / Private Cloud Deploy'],
    current: false,
    badge: 'Popular for Lenders',
  },
];

const initialInvoices = [
  { id: 'INV-2026-08', date: 'Aug 01, 2026', amount: '$299.00', status: 'Paid', plan: 'Professional Monthly', method: 'UPI QR / Scan & Pay' },
  { id: 'INV-2026-07', date: 'Jul 01, 2026', amount: '$299.00', status: 'Paid', plan: 'Professional Monthly', method: 'Visa Card •••• 8892' },
  { id: 'INV-2026-06', date: 'Jun 01, 2026', amount: '$299.00', status: 'Paid', plan: 'Professional Monthly', method: 'HDFC NetBanking' },
  { id: 'INV-2026-05', date: 'May 01, 2026', amount: '$299.00', status: 'Paid', plan: 'Professional Monthly', method: 'UPI QR / Scan & Pay' },
];

export function Billing() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<{ name: string; price: number; credits: number } | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationCredits, setVerificationCredits] = useState<number>(5000);

  useEffect(() => {
    // Fetch live organization subscription and credit balance
    fetch('/api/v1/billing/subscription')
      .then(res => res.json())
      .then(data => {
        if (data && data.verification_credits) {
          setVerificationCredits(data.verification_credits);
        }
      })
      .catch(err => console.error('Failed to fetch subscription data:', err));
  }, []);

  const openCheckoutForPlan = (plan: typeof initialPlans[0]) => {
    setSelectedPackageForModal({
      name: `${plan.name} Subscription`,
      price: plan.price,
      credits: plan.name === 'Starter' ? 1000 : plan.name === 'Professional' ? 5000 : 15000
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (amount: number, creditsAdded: number, pkgName: string, method: string) => {
    const newInvoice = {
      id: `INV-2026-${Math.floor(10 + Math.random() * 90)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: `$${amount}.00`,
      status: 'Paid',
      plan: pkgName,
      method: method
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setVerificationCredits(prev => prev + creditsAdded);
    setSuccessMessage(`Payment of $${amount} via ${method} processed successfully! ${creditsAdded.toLocaleString()} credits added to your account.`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        initialPackage={selectedPackageForModal}
      />

      {/* Payment Success Toast */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-success-50 border border-success-200 text-success-900 flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-success-700 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Payment Methods</h1>
          <p className="mt-1 text-slate-500">Manage your subscription, buy real-time API credits via UPI QR Code, and view payment history.</p>
        </div>
        <Button variant="primary" onClick={() => { setSelectedPackageForModal(undefined); setIsPaymentModalOpen(true); }} className="shadow-md shadow-primary-500/20">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy API Credits (UPI QR / Cards)
        </Button>
      </div>

      {/* Current Subscription Card */}
      <Card className="bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-800 text-white border-none shadow-lg">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">Active Subscription</span>
              <span className="text-xs text-white/80">Renews Sept 1, 2026</span>
            </div>
            <h2 className="text-2xl font-bold mt-2">Professional Plan ($299/mo)</h2>
            <p className="text-sm text-white/80 mt-1">Supported payment methods: UPI QR / Scan & Pay (GPay, PhonePe, Paytm), Credit Cards, NetBanking</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>Current Quota: <strong className="text-white font-bold">{verificationCredits.toLocaleString()} Verifications</strong></span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Add Payment Method
            </Button>
            <Button variant="primary" onClick={() => openCheckoutForPlan(initialPlans[1])} className="bg-white text-primary-700 hover:bg-surface-50 font-semibold shadow-md">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Payment Methods Banner */}
      <div className="bg-surface-100 border border-surface-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-semibold text-slate-800">Accepted Instant Payment Gateways:</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-xs font-semibold text-primary-700">
            <QrCode className="h-4 w-4 text-primary-600" /> UPI QR / Scan & Pay
          </span>
          <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-xs">
            <CreditCard className="h-4 w-4 text-indigo-600" /> Visa / Mastercard / RuPay
          </span>
          <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-surface-200 shadow-xs">
            <Landmark className="h-4 w-4 text-emerald-600" /> HDFC / SBI / ICICI NetBanking
          </span>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid gap-6 md:grid-cols-3">
        {initialPlans.map((plan) => (
          <Card key={plan.name} className={`relative flex flex-col ${plan.current ? 'border-2 border-primary-500 shadow-card-hover' : ''}`}>
            {plan.badge && (
              <div className="absolute -top-3 right-6 bg-primary-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow">
                {plan.badge}
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <CardDescription className="mt-2 text-xs">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-6">
              <ul className="space-y-2 text-sm">
                <li className="font-semibold text-primary-700 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> {plan.verifications}
                </li>
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 text-xs">
                    <Check className="h-3.5 w-3.5 text-success-600 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.current ? 'outline' : 'primary'} 
                onClick={() => openCheckoutForPlan(plan)} 
                className="w-full"
              >
                {plan.current ? 'Re-subscribe Plan' : `Pay $${plan.price} via UPI QR`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice History */}
      <Card noPadding>
        <CardHeader className="p-6 border-b border-surface-200">
          <CardTitle>Payment & Invoice History</CardTitle>
        </CardHeader>
        <div className="divide-y divide-surface-200">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-4 px-6 hover:bg-surface-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-surface-100 rounded-xl text-slate-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.plan}</p>
                  <p className="text-xs text-slate-500">{inv.id} · {inv.date} · via <span className="font-medium text-slate-700">{inv.method}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="success">{inv.status}</Badge>
                <span className="text-sm font-bold text-slate-900">{inv.amount}</span>
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
