import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Building, Calendar, Info, CheckCircle2 } from 'lucide-react';

export function TenantConsent() {
  const [consented, setConsented] = useState<boolean | null>(null);

  if (consented) {
    return (
      <div className="flex h-[80vh] items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 mb-6">
            <CheckCircle2 className="h-8 w-8 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Consent Granted</h1>
          <p className="text-slate-500">
            Thank you. Your rental payment data will now be securely analyzed for verification. 
            You can close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4 text-primary-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rental Verification Request</h1>
        <p className="mt-2 text-slate-500">
          A property manager or lender is requesting to verify your rental payment history.
        </p>
      </div>

      <Card className="mb-6 border-primary-100 shadow-md">
        <CardHeader className="bg-primary-50/50 rounded-t-2xl border-b border-primary-100 pb-4">
          <CardTitle className="text-primary-900 text-lg">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4 items-start">
            <Building className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Requesting Organization</p>
              <p className="text-sm text-slate-500">Acme Property Management LLC</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Info className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Verification Purpose</p>
              <p className="text-sm text-slate-500">New Lease Application Background Check</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Verification Period</p>
              <p className="text-sm text-slate-500">Jan 2025 - Dec 2025 (12 Months)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-50 border-none shadow-none mb-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Your Privacy is Protected</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your data will <strong>only</strong> be used for the stated rental verification purpose. 
            RentVerify uses secure machine learning to analyze bank statements exclusively for rent-related transactions. 
            We do not store your raw bank credentials and we never sell your data to third parties.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="ghost" onClick={() => alert('Request rejected')} className="sm:w-1/3">
          Reject Request
        </Button>
        <Button variant="primary" onClick={() => setConsented(true)} className="sm:w-2/3 shadow-md shadow-primary-500/20">
          Give Consent
        </Button>
      </div>
    </div>
  );
}
