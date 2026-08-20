import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  CreditCard, QrCode, Building2, User, Calendar, ShieldCheck, CheckCircle2, XCircle, RefreshCw, ArrowLeft, FileText, Smartphone, Banknote, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TenantReceiptModal, ReceiptData } from '../components/TenantReceiptModal';

type PaymentState = 'IDLE' | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
type PaymentMethod = 'UPI' | 'CARDS' | 'NET_BANKING';

export function TenantPayRent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leaseInfo, setLeaseInfo] = useState({
    property_name: 'Apex Housing Apartments',
    landlord_name: 'Apex Housing Property Management',
    monthly_rent: 20000,
    monthly_rent_formatted: '₹20,000',
    next_due_date: '5 September 2026',
    due_date_iso: '2026-09-05',
    rent_period: 'September 2026',
    payment_status: 'PAYMENT DUE',
    paid_date: null as string | null,
    receipt_id: null as string | null,
    payment_id: null as string | null,
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [paymentState, setPaymentState] = useState<PaymentState>('IDLE');
  const [orderInfo, setOrderInfo] = useState<{
    order_id: string;
    payment_id: string;
    amount: number;
    receipt_id: string;
    key_id: string;
  } | null>(null);

  const [completedPayment, setCompletedPayment] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchCurrentRent();
  }, []);

  const fetchCurrentRent = async () => {
    try {
      const res = await api.get('/tenant/rent-payment/current');
      if (res.data) {
        setLeaseInfo(res.data);
        if (res.data.payment_status === 'PAID' || res.data.payment_status === 'LATE') {
          setPaymentState('PAID');
        }
      }
    } catch (e) {
      console.log('Using default rent due state');
    }
  };

  const handleInitiatePayment = async () => {
    setErrorMessage(null);
    setPaymentState('PENDING');

    try {
      const res = await api.post('/tenant/rent-payment/create-order', {
        payment_method: selectedMethod
      });

      if (res.data) {
        setOrderInfo(res.data);
        setPaymentState('PROCESSING');
      } else {
        throw new Error('Could not create Razorpay order');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Payment creation failed. Please try again.';
      setErrorMessage(msg);
      setPaymentState('FAILED');
    }
  };

  const handleCompletePaymentSuccess = async () => {
    if (!orderInfo) return;
    setPaymentState('PROCESSING');

    try {
      const res = await api.post(`/tenant/rent-payment/${orderInfo.payment_id}/complete`);
      if (res.data) {
        setCompletedPayment(res.data);
        setPaymentState('PAID');
        setLeaseInfo(prev => ({
          ...prev,
          payment_status: res.data.status,
          paid_date: res.data.paid_date,
          receipt_id: res.data.receipt_id
        }));
      }
    } catch (err: any) {
      setErrorMessage('Failed to verify payment with backend.');
      setPaymentState('FAILED');
    }
  };

  const handleSimulateFailure = () => {
    setErrorMessage('Payment was declined or cancelled by bank. Please try again.');
    setPaymentState('FAILED');
  };

  const handleOpenReceipt = async () => {
    const pmtId = completedPayment?.id || leaseInfo.payment_id || orderInfo?.payment_id;
    if (pmtId) {
      try {
        const res = await api.get(`/tenant/rent-payments/${pmtId}/receipt`);
        if (res.data) {
          setSelectedReceipt(res.data);
          setIsReceiptOpen(true);
          return;
        }
      } catch (e) {}
    }

    setSelectedReceipt({
      title: 'RENT PAYMENT RECEIPT',
      receipt_id: completedPayment?.receipt_id || leaseInfo.receipt_id || 'RCP-2026-00001',
      tenant_name: user?.full_name || 'Alex Johnson',
      property_name: leaseInfo.property_name,
      landlord_name: leaseInfo.landlord_name,
      rent_period: leaseInfo.rent_period,
      amount: leaseInfo.monthly_rent,
      amount_formatted: leaseInfo.monthly_rent_formatted,
      payment_date: completedPayment?.paid_date || leaseInfo.paid_date || '05 September 2026',
      payment_method: selectedMethod,
      payment_status: 'PAID',
      razorpay_payment_id: orderInfo?.payment_id || 'pay_sep2026_01',
      razorpay_order_id: orderInfo?.order_id || 'order_sep2026_01'
    });
    setIsReceiptOpen(true);
  };

  const isAlreadyPaid = leaseInfo.payment_status === 'PAID' || leaseInfo.payment_status === 'LATE' || paymentState === 'PAID';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tenant/dashboard')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
        </button>
        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Razorpay 256-bit Encrypted Payment
        </span>
      </div>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pay Your Rent</h1>
        <p className="text-xs text-slate-500">Make your monthly rental payment securely through RentVerify.</p>
      </div>

      {/* DUPLICATE PAYMENT / ALREADY PAID STATE */}
      {isAlreadyPaid ? (
        <Card className="p-8 border border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/20 rounded-3xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              ✓ September Rent Paid
            </span>
            <h2 className="text-2xl font-black text-slate-900">Rent Payment Successful</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your rental payment of <span className="font-bold text-slate-900">{leaseInfo.monthly_rent_formatted}</span> for <span className="font-bold text-slate-900">{leaseInfo.rent_period}</span> has been confirmed and registered in your verification passport.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-surface-200 text-xs max-w-lg mx-auto grid grid-cols-2 gap-4 text-left shadow-xs">
            <div>
              <span className="text-slate-400 font-medium block">Property</span>
              <span className="font-bold text-slate-900">{leaseInfo.property_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Landlord</span>
              <span className="font-bold text-slate-900">{leaseInfo.landlord_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Payment Date</span>
              <span className="font-bold text-slate-900">{leaseInfo.paid_date || '05 September 2026'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Receipt ID</span>
              <span className="font-mono font-bold text-primary-700">{leaseInfo.receipt_id || 'RCP-2026-00001'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleOpenReceipt}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 shadow-md shadow-emerald-600/20"
            >
              <FileText className="mr-2 h-4 w-4" /> View Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/tenant/dashboard')}
              className="text-xs py-3 px-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        /* ACTIVE LEASE & PAYMENT FLOW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Lease Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border border-surface-200 shadow-md space-y-5 rounded-3xl bg-white">
              <div className="pb-4 border-b border-surface-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-600">ACTIVE LEASE SUMMARY</span>
                <h3 className="text-lg font-bold text-slate-900">{leaseInfo.property_name}</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Landlord / Property Mgr</span>
                    <span className="font-bold text-slate-900">{leaseInfo.landlord_name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Tenant</span>
                    <span className="font-bold text-slate-900">{user?.full_name || 'Alex Johnson'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Rent Due Date</span>
                    <span className="font-bold text-slate-900">{leaseInfo.next_due_date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Current Payment Status</span>
                    <span className="font-extrabold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {leaseInfo.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-200 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Monthly Rent</span>
                  <span className="text-2xl font-black text-slate-900">{leaseInfo.monthly_rent_formatted}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                  INR Zero Fees
                </span>
              </div>
            </Card>
          </div>

          {/* Payment Method Selector & Execution */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-surface-200 shadow-md rounded-3xl bg-white space-y-6">
              
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Payment Method</h3>
                <p className="text-xs text-slate-500">Choose your preferred Razorpay checkout channel.</p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMethod === 'UPI'
                      ? 'border-primary-600 bg-primary-50/50 text-primary-900 shadow-sm'
                      : 'border-surface-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <QrCode className={`h-6 w-6 ${selectedMethod === 'UPI' ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">1. UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CARDS')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMethod === 'CARDS'
                      ? 'border-primary-600 bg-primary-50/50 text-primary-900 shadow-sm'
                      : 'border-surface-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard className={`h-6 w-6 ${selectedMethod === 'CARDS' ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">2. Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('NET_BANKING')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMethod === 'NET_BANKING'
                      ? 'border-primary-600 bg-primary-50/50 text-primary-900 shadow-sm'
                      : 'border-surface-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Banknote className={`h-6 w-6 ${selectedMethod === 'NET_BANKING' ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">3. Net Banking</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-danger-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <Button variant="outline" onClick={() => setPaymentState('IDLE')} className="text-xs py-1 px-3 border-danger-300 text-danger-700">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Dynamic Payment State Display */}
              {paymentState === 'IDLE' && (
                <div className="space-y-5 pt-2">
                  {selectedMethod === 'UPI' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-surface-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Smartphone className="h-4 w-4 text-primary-600" /> Instant UPI QR & App Transfer
                      </div>
                      <p className="text-slate-500">
                        Scan QR code using Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'CARDS' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-surface-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <CreditCard className="h-4 w-4 text-primary-600" /> Credit & Debit Cards
                      </div>
                      <p className="text-slate-500">
                        Supports Visa, Mastercard, RuPay, and Diners cards with 3D Secure authentication.
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'NET_BANKING' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-surface-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Banknote className="h-4 w-4 text-primary-600" /> All Major Indian Banks
                      </div>
                      <p className="text-slate-500">
                        HDFC Bank, SBI, ICICI, Axis Bank, Kotak, and 50+ net banking portals supported via Razorpay.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleInitiatePayment}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-sm py-4 shadow-xl shadow-primary-600/30 rounded-2xl"
                  >
                    Pay {leaseInfo.monthly_rent_formatted}
                  </Button>
                </div>
              )}

              {paymentState === 'PENDING' && (
                <div className="p-8 rounded-2xl bg-slate-50 border border-surface-200 text-center space-y-4">
                  <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Waiting for payment confirmation...</p>
                </div>
              )}

              {paymentState === 'PROCESSING' && (
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-6 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Razorpay Payment Flow</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Order: {orderInfo?.order_id}
                    </span>
                  </div>

                  {/* Interactive QR Simulation Box */}
                  <div className="flex flex-col items-center space-y-4 py-2">
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-700 flex flex-col items-center">
                      <QrCode className="h-36 w-36 text-slate-900" />
                      <span className="text-[10px] text-slate-500 font-mono mt-2">Scan with GPay / PhonePe / Paytm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-white">{leaseInfo.monthly_rent_formatted}</span>
                      <p className="text-[11px] text-slate-400">Payment is being verified by backend webhook...</p>
                    </div>
                  </div>

                  {/* Complete Payment Simulation Controls */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <Button
                      variant="primary"
                      onClick={handleCompletePaymentSuccess}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-lg shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Simulate Successful Payment
                    </Button>
                    <button
                      onClick={handleSimulateFailure}
                      className="w-full text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Simulate Payment Failure
                    </button>
                  </div>
                </div>
              )}

            </Card>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      <TenantReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
}
