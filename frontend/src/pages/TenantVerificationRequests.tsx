import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Building2, Calendar, Lock, ArrowRight } from 'lucide-react';

interface VerificationRequestItem {
  id: string;
  external_id: string;
  requested_by: string;
  organization_type: string;
  property_address: string;
  period_start: string;
  period_end: string;
  purpose: string;
  request_date: string;
  status: string;
}

export function TenantVerificationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/tenant/verification-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_CONSENT':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">CONSENT REQUIRED</span>;
      case 'CONSENT_GRANTED':
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">CONSENT GRANTED</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">PROCESSING</span>;
      case 'COMPLETED':
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">VERIFIED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Review rental verification requests received from landlords and lending institutions.</p>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-medium">Loading requests...</Card>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border border-surface-200">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Verification Requests Received</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">When a landlord or lender requests verification of your rental payments, it will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 border border-surface-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">RV-{req.external_id}</span>
                    {getStatusBadge(req.status)}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{req.requested_by}</h3>
                    <p className="text-xs text-slate-600 font-medium">{req.purpose}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{req.property_address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Period: {req.period_start} – {req.period_end}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/tenant/verification-requests/${req.id}`)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 shadow-sm"
                  >
                    View Request <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
