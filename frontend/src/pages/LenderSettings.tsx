import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Bell, ShieldCheck, KeyRound, Save, CheckCircle2, Lock, Smartphone } from 'lucide-react';

export function LenderSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [verificationNotifs, setVerificationNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lender Preferences & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure underwriting alerts, notification preferences, and session security.</p>
      </div>

      <Card className="p-6 md:p-8 border border-surface-200 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Notification Settings */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-indigo-600" /> Notifications & Alerts
            </h3>
            
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">Email Verification Updates</span>
                  <span className="text-[11px] text-slate-500">Receive instant email when a tenant approves consent or report finishes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <div className="border-t border-surface-200 pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Verification Status Webhooks</span>
                    <span className="text-[11px] text-slate-500">Post automatic webhook events to your Loan Origination System (LOS).</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={verificationNotifs}
                    onChange={(e) => setVerificationNotifs(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Security & Sessions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" /> Security & Session Management
            </h3>

            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Active Login Sessions</span>
                  <span className="text-[11px] text-slate-500">Currently active JWT sessions on your Lender account.</span>
                </div>
                <Button variant="outline" type="button" onClick={() => alert('Active sessions cleared')} className="text-xs h-8">
                  Revoke Other Sessions
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 shadow-md shadow-indigo-600/20"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
