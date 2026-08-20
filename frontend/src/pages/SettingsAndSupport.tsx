import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Building, Bell, Shield, Key } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Configure your RentVerify account, organization details, and notifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-4 space-y-1">
            {[
              { label: 'Organization Profile', icon: Building, active: true },
              { label: 'Account & Security', icon: Shield, active: false },
              { label: 'Notification Preferences', icon: Bell, active: false },
              { label: 'Webhooks & API Integrations', icon: Key, active: false },
            ].map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-surface-100'
                }`}
              >
                <item.icon className={`h-4 w-4 ${item.active ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>Update your company details displayed on verification requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="Acme Property Management LLC"
                className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 px-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Support Email</label>
              <input
                type="email"
                defaultValue="support@acmeprop.com"
                className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 px-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Webhook URL</label>
              <input
                type="text"
                defaultValue="https://api.acmeprop.com/webhooks/rentverify"
                className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 px-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono text-xs"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="primary">Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HelpCenter() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Help Center & Documentation</h1>
        <p className="mt-1 text-slate-500">Guides, API integration reference, and customer support.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting Started Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>Learn how to send verification requests, obtain tenant consent, and upload bank statements.</p>
            <Button variant="outline" size="sm" className="mt-2">Read Guide</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>Full REST API endpoints reference, Swagger interactive UI, and SDK integration instructions.</p>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="mt-2">Open OpenAPI Docs</Button>
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>Need assistance? Our engineering and compliance team is available 24/7 for Enterprise accounts.</p>
            <Button variant="primary" size="sm" className="mt-2">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function Notifications() {
  const notifs = [
    { id: 1, title: 'Verification Completed', desc: 'RV-2026-001248 (Emily Chen) has been successfully verified (96.8% confidence).', time: '10 mins ago', type: 'success' },
    { id: 2, title: 'Consent Granted', desc: 'Tenant Marcus Johnson accepted your verification request.', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'API Rate Limit Warning', desc: 'You have reached 84% of your monthly API verification quota (8,420/10,000).', time: '3 hours ago', type: 'warning' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="mt-1 text-slate-500">Real-time alerts, verification results, and system updates.</p>
      </div>

      <Card noPadding>
        <div className="divide-y divide-surface-200">
          {notifs.map(n => (
            <div key={n.id} className="p-4 px-6 flex items-start gap-4 hover:bg-surface-50">
              <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-success-500' : n.type === 'warning' ? 'bg-warning-500' : 'bg-primary-500'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <span className="text-xs text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
