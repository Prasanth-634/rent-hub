import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Lock, LogOut, CheckCircle2 } from 'lucide-react';

export function LandlordSettings() {
  const { logout } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [consentAlerts, setConsentAlerts] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Landlord Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure notification alerts, security settings, and session management.</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Notification preferences updated successfully.</span>
        </div>
      )}

      {/* Notification Preferences */}
      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
          <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Configure email and activity alerts for tenant disclosures.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Tenant Consent Status Alerts</span>
              <span className="text-[11px] text-slate-500">Receive instant email notifications when a tenant grants or rejects consent.</span>
            </div>
            <input
              type="checkbox"
              checked={consentAlerts}
              onChange={(e) => setConsentAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Verification Report Completions</span>
              <span className="text-[11px] text-slate-500">Get notified when AI classification completes and verification reports are ready.</span>
            </div>
            <input
              type="checkbox"
              checked={verificationAlerts}
              onChange={(e) => setVerificationAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Billing & API Credit Alerts</span>
              <span className="text-[11px] text-slate-500">Receive notifications when your API verification credit balance runs low.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" onClick={handleSavePreferences} className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-6">
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Security & Sessions */}
      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Device Sessions</h3>
            <p className="text-xs text-slate-500">Manage session security and active landlord logons.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Single-Session Invalidated Logout</span>
              <span className="text-[11px] text-slate-500">Revokes all JWT tokens and active browser sessions immediately.</span>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout from All Devices
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
