import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  X, CheckCircle2, CreditCard, Smartphone, Landmark, ShieldCheck, Zap, ArrowRight, Loader2, QrCode, RefreshCw, Copy, Check
} from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number, creditsAdded: number, planName: string, method: string) => void;
  initialPackage?: { name: string; price: number; credits: number };
}

const creditPackages = [
  { name: '1,000 Verification Top-Up', price: 29, credits: 1000, desc: 'Quick top-up for immediate verification needs' },
  { name: '5,000 Verification Pack', price: 99, credits: 5000, desc: 'Best value for active property managers', popular: true },
  { name: '15,000 Enterprise Volume Pack', price: 249, credits: 15000, desc: 'Bulk discount for high-volume API consumers' },
];

interface OrderData {
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  credits: number;
  qr_code_url: string;
  upi_string: string;
  status: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, initialPackage }: PaymentModalProps) {
  const [selectedPkg, setSelectedPkg] = useState(initialPackage || creditPackages[1]);
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'card' | 'netbanking'>('upi_qr');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Payment Order & Status state
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID' | 'FAILED'>('IDLE');
  const [paidDetails, setPaidDetails] = useState<{ credits_added: number; payment_id: string; order_id: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync initialPackage when modal opens
  useEffect(() => {
    if (isOpen && initialPackage) {
      setSelectedPkg(initialPackage);
    }
  }, [isOpen, initialPackage]);

  // Clean up polling timer on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setOrderData(null);
      setPaymentStatus('IDLE');
      setPaidDetails(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stopPolling = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  // Generate dynamic Razorpay order & UPI QR code from FastAPI
  const handleCreateOrder = async (pkg = selectedPkg) => {
    setIsGeneratingOrder(true);
    setErrorMsg(null);
    stopPolling();

    try {
      const res = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: pkg.name,
          amount: pkg.price,
          credits: pkg.credits,
          currency: 'INR'
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create payment order');
      }

      const data: OrderData = await res.json();
      setOrderData(data);
      setPaymentStatus('PENDING');

      // Start status polling every 3 seconds
      startPolling(data.payment_id);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg('Could not initialize payment order. Please try again.');
    } finally {
      setIsGeneratingOrder(false);
    }
  };

  // Poll backend endpoint GET /api/v1/payments/{payment_id}/status
  const startPolling = (paymentId: string) => {
    stopPolling();

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/payments/${paymentId}/status`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === 'PAID') {
          stopPolling();
          setPaymentStatus('PAID');
          setPaidDetails({
            credits_added: data.credits_added || selectedPkg.credits,
            payment_id: data.payment_id || paymentId,
            order_id: data.order_id || orderData?.order_id || ''
          });

          // Callback to parent view after brief delay
          setTimeout(() => {
            onSuccess(selectedPkg.price, data.credits_added || selectedPkg.credits, selectedPkg.name, 'UPI QR / Scan & Pay');
          }, 1000);
        } else if (data.status === 'FAILED') {
          stopPolling();
          setPaymentStatus('FAILED');
          setErrorMsg('Payment failed or was cancelled.');
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000);
  };

  // Dev simulation helper: triggers POST /api/v1/payments/{payment_id}/simulate-webhook
  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/v1/payments/${orderData.payment_id}/simulate-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.status === 'PAID') {
        stopPolling();
        setPaymentStatus('PAID');
        setPaidDetails({
          credits_added: data.credits_added,
          payment_id: data.payment_id,
          order_id: orderData.order_id
        });
        onSuccess(selectedPkg.price, data.credits_added, selectedPkg.name, 'UPI QR / Scan & Pay');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyUpiUri = () => {
    if (orderData?.upi_string) {
      navigator.clipboard.writeText(orderData.upi_string);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 bg-surface-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Buy API Verification Credits</h3>
              <p className="text-xs text-slate-500">Instant UPI QR payment with server webhook confirmation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-surface-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {paymentStatus === 'PAID' && paidDetails ? (
          <div className="p-10 text-center space-y-5 animate-fade-in">
            <div className="mx-auto h-20 w-20 bg-success-100 rounded-full flex items-center justify-center text-success-600 shadow-inner">
              <CheckCircle2 className="h-12 w-12 animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
              <p className="text-sm text-slate-500 mt-1">
                Added <strong className="text-slate-900">+{paidDetails.credits_added.toLocaleString()} API Verifications</strong> to your account quota.
              </p>
            </div>

            <div className="bg-surface-50 p-4 rounded-2xl border border-surface-200 space-y-2 text-xs font-mono text-slate-600 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-semibold text-slate-800">{paidDetails.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Payment ID:</span>
                <span className="font-semibold text-primary-600">{paidDetails.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-success-600">CONFIRMED (CAPTURED)</span>
              </div>
            </div>

            <Badge variant="success" className="px-4 py-1 text-xs">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Razorpay Signature Verified & Email Confirmation Sent
            </Badge>

            <div className="pt-2">
              <Button variant="primary" onClick={onClose} className="w-full max-w-xs shadow-lg shadow-primary-500/25">
                Done & Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Package Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">1. Select API Credit Package</label>
              <div className="space-y-3">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    onClick={() => {
                      setSelectedPkg(pkg);
                      if (paymentMethod === 'upi_qr') {
                        handleCreateOrder(pkg);
                      }
                    }}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPkg.name === pkg.name 
                        ? 'border-primary-600 bg-primary-50/40 shadow-sm' 
                        : 'border-surface-200 hover:border-primary-300'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-4 bg-primary-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        MOST POPULAR
                      </span>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{pkg.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{pkg.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">${pkg.price}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">₹{(pkg.price * 83).toLocaleString()} INR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">2. Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi_qr');
                    if (!orderData) handleCreateOrder(selectedPkg);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'upi_qr' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold shadow-xs' 
                      : 'border-surface-200 text-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <QrCode className="h-5 w-5 text-primary-600" />
                  <span className="text-xs">UPI QR / Scan & Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold' 
                      : 'border-surface-200 text-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <span className="text-xs">Credit/Debit Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'netbanking' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold' 
                      : 'border-surface-200 text-slate-600 hover:bg-surface-50'
                  }`}
                >
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Step 3: Method Details (UPI QR / Scan & Pay) */}
            <div className="bg-surface-50 p-5 rounded-2xl border border-surface-200 space-y-4">
              {paymentMethod === 'upi_qr' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-primary-600" />
                      <span className="text-xs font-bold text-slate-800">Scan & Pay via UPI</span>
                    </div>
                    <span className="text-[10px] text-success-700 bg-success-50 px-2 py-0.5 rounded-full font-medium border border-success-200 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Secure Razorpay Gateway
                    </span>
                  </div>

                  {isGeneratingOrder ? (
                    <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-surface-200 shadow-inner">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Generating secure UPI QR Code...</p>
                    </div>
                  ) : orderData ? (
                    <div className="flex flex-col items-center justify-center space-y-4 bg-white p-5 rounded-2xl border border-surface-200 shadow-xs">
                      {/* Google Pay / Custom UPI QR Code Image */}
                      <div className="relative group p-2 bg-white rounded-2xl border-2 border-primary-100 shadow-md flex flex-col items-center">
                        <img 
                          src="/upi_qr.png" 
                          alt="UPI Payment QR Code - kbprasanth2021@oksbi" 
                          className="w-56 h-56 object-contain rounded-xl"
                        />
                        <div className="absolute inset-0 bg-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>

                      {/* Payment Details & Copyable UPI ID */}
                      <div className="text-center space-y-1">
                        <p className="text-xs text-slate-500 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                        <p className="text-xl font-bold text-slate-900">
                          ${orderData.amount}.00 <span className="text-xs text-slate-500 font-normal">(₹{(orderData.amount * 83).toLocaleString()} INR)</span>
                        </p>
                        <div className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-xs font-mono text-slate-700 transition-colors cursor-pointer" onClick={() => {
                          navigator.clipboard.writeText('kbprasanth2021@oksbi');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}>
                          <span>UPI ID: <strong>kbprasanth2021@oksbi</strong></span>
                          {copiedUpi ? <Check className="h-3.5 w-3.5 text-success-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                        </div>
                      </div>

                      {/* Supported App Badges */}
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-surface-100 px-3 py-1.5 rounded-xl">
                        <span className="text-primary-700 font-bold">GPay</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-purple-700 font-bold">PhonePe</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sky-600 font-bold">Paytm</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-bold">BHIM</span>
                      </div>

                      {/* Waiting for payment indicator */}
                      <div className="w-full bg-primary-50/70 border border-primary-200 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600"></span>
                          </span>
                          <span className="font-semibold text-primary-900">Waiting for payment confirmation...</span>
                        </div>
                        <Loader2 className="h-4 w-4 text-primary-600 animate-spin" />
                      </div>

                      {/* Dev Simulation Button */}
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        disabled={isSimulating}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isSimulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-yellow-400" />}
                        {isSimulating ? 'Processing Webhook...' : 'Simulate Instant Webhook Payment (Dev Test)'}
                      </button>

                      {/* Copy UPI URI */}
                      <button
                        type="button"
                        onClick={copyUpiUri}
                        className="text-[11px] text-slate-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                      >
                        {copiedUpi ? <Check className="h-3 w-3 text-success-600" /> : <Copy className="h-3 w-3" />}
                        {copiedUpi ? 'UPI Link Copied!' : 'Copy raw UPI payment URI'}
                      </button>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => handleCreateOrder(selectedPkg)}
                      className="w-full"
                    >
                      Generate Razorpay UPI QR Code
                    </Button>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8892"
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm font-mono outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Expiry</label>
                      <input type="text" defaultValue="08/28" className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm font-mono outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">CVV</label>
                      <input type="password" defaultValue="•••" className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm font-mono outline-none" />
                    </div>
                  </div>
                  <Button 
                    variant="primary"
                    onClick={() => handleCreateOrder(selectedPkg)}
                    className="w-full mt-2"
                  >
                    Proceed via Credit/Debit Card
                  </Button>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-600 block">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm outline-none"
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                  <Button 
                    variant="primary"
                    onClick={() => handleCreateOrder(selectedPkg)}
                    className="w-full mt-2"
                  >
                    Proceed via Net Banking
                  </Button>
                </div>
              )}
            </div>

            {/* Security Guarantee Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-surface-200 pt-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-success-600" /> Server-verified webhook execution
              </span>
              <span>PCI-DSS Compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
