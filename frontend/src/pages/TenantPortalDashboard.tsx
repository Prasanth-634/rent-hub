import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  UserCheck, ShieldCheck, Upload, FileCheck, CheckCircle2, XCircle, ArrowUpRight, Lock, CreditCard, Building2, Calendar, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { TenantReceiptModal, ReceiptData } from '../components/TenantReceiptModal';
import { useAuth } from '../context/AuthContext';

export function TenantPortalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rentInfo, setRentInfo] = useState({
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

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    fetchRentInfo();
  }, []);

  const fetchRentInfo = async () => {
    try {
      const res = await api.get('/tenant/rent-payment/current');
      if (res.data) {
        setRentInfo(res.data);
      }
    } catch (e) {
      console.log('Using default rent info fallback');
    }
  };

  const handleOpenReceipt = async () => {
    if (rentInfo.payment_id) {
      try {
        const res = await api.get(`/tenant/rent-payments/${rentInfo.payment_id}/receipt`);
        if (res.data) {
          setSelectedReceipt(res.data);
          setIsReceiptOpen(true);
          return;
        }
      } catch (e) {
        // Fallback
      }
    }
    // Default receipt modal state
    setSelectedReceipt({
      title: 'RENT PAYMENT RECEIPT',
      receipt_id: rentInfo.receipt_id || 'RCP-2026-00001',
      tenant_name: user?.full_name || 'Alex Johnson',
      property_name: rentInfo.property_name,
      landlord_name: rentInfo.landlord_name,
      rent_period: rentInfo.rent_period,
      amount: rentInfo.monthly_rent,
      amount_formatted: rentInfo.monthly_rent_formatted,
      payment_date: rentInfo.paid_date || '05 September 2026',
      payment_method: 'UPI',
      payment_status: rentInfo.payment_status,
      razorpay_payment_id: 'pay_sample_sep2026',
      razorpay_order_id: 'order_sample_sep2026'
    });
    setIsReceiptOpen(true);
  };

  const pendingRequests = [
    { id: 'cons_01', requester: 'Capital Lending Group', purpose: 'Home Loan Underwriting', period: '12 Months', requestedDate: '2026-02-18' },
  ];

  const verificationHistory = [
    { id: 'ver_101', requester: 'Apex Housing Property Management', period: '6 Months', status: 'VERIFIED ON-TIME (100%)', verifiedDate: '2026-01-10' },
    { id: 'ver_102', requester: 'First National Bank', period: '12 Months', status: 'VERIFIED ON-TIME (98%)', verifiedDate: '2025-11-05' },
  ];

  const isPaid = rentInfo.payment_status === 'PAID' || rentInfo.payment_status === 'LATE';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Tenant Self-Service Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your Rental Passport & Consents</h1>
          <p className="text-xs text-slate-300">Manage rental payment verification requests and bank statement disclosures securely.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/tenant/pay-rent')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
          >
            <CreditCard className="mr-2 h-4 w-4" /> Pay Rent Online
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pending Consent Requests</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">1</span>
            <span className="ml-2 text-xs font-semibold text-amber-600">Action Required</span>
          </div>
        </Card>

        <Card className="p-5 border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Verified Passports</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">2</span>
            <span className="ml-2 text-xs font-semibold text-emerald-600">Active Credential</span>
          </div>
        </Card>

        <Card className="p-5 border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Privacy Standard</span>
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900">Encrypted</span>
            <p className="text-[11px] text-slate-500">Explicit consent required for all disclosures</p>
          </div>
        </Card>
      </div>

      {/* RENT PAYMENT DASHBOARD CARD */}
      <Card className="p-6 border border-primary-200 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 rounded-3xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-700">RENT PAYMENT</span>
                <h3 className="text-lg font-extrabold text-slate-900">{rentInfo.property_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Landlord</span>
                <span className="font-bold text-slate-800">{rentInfo.landlord_name}</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Monthly Rent</span>
                <span className="text-base font-extrabold text-slate-900">{rentInfo.monthly_rent_formatted}</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">
                  {isPaid ? 'Paid Date' : 'Next Due Date'}
                </span>
                <span className="font-bold text-slate-800">
                  {isPaid ? rentInfo.paid_date || '5 September 2026' : rentInfo.next_due_date}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Current Status</span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ✓ PAID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
                    PAYMENT DUE
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-2 min-w-[180px]">
            {isPaid ? (
              <Button
                variant="primary"
                onClick={handleOpenReceipt}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-md shadow-emerald-600/20"
              >
                <FileText className="mr-1.5 h-4 w-4" /> View Receipt
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/tenant/pay-rent')}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs py-3 shadow-lg shadow-primary-600/25"
              >
                <CreditCard className="mr-1.5 h-4 w-4" /> Pay {rentInfo.monthly_rent_formatted}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/tenant/rent-payments')}
              className="w-full text-xs text-slate-600"
            >
              Payment History
            </Button>
          </div>
        </div>
      </Card>

      {/* Pending Consent Action Box */}
      {pendingRequests.length > 0 && (
        <Card className="p-6 border border-amber-200 bg-amber-50/40 rounded-3xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Consent Requested
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{pendingRequests[0].requester}</h3>
              <p className="text-xs text-slate-600">
                Purpose: <span className="font-semibold">{pendingRequests[0].purpose}</span> | Period: <span className="font-semibold">{pendingRequests[0].period}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/tenant/consent')}
                className="border-red-300 text-red-700 hover:bg-red-50 text-xs"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/tenant/consent')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve Consent
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Verified History Passport */}
      <Card className="p-6 border border-surface-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Verified Rental Payment History</h3>
            <p className="text-xs text-slate-500">Verified payment records disclosed under tenant authorization.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/tenant/reports')} className="text-xs">
            View Reports
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Authorized Organization</th>
                <th className="p-3">Verification Period</th>
                <th className="p-3">Status</th>
                <th className="p-3">Verified Date</th>
                <th className="p-3 text-right rounded-r-xl">Passport Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {verificationHistory.map((h) => (
                <tr key={h.id} className="hover:bg-surface-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">{h.requester}</td>
                  <td className="p-3">{h.period}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{h.verifiedDate}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate('/tenant/reports')}
                      className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 ml-auto"
                    >
                      View Report <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Digital Receipt Modal */}
      <TenantReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
}
