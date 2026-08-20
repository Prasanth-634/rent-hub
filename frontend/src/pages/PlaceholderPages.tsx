import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-surface-100 p-4 mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Coming Soon</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            This module is currently under active development. Check back later for updates to the {title} interface.
          </p>
          <div className="mt-6">
            <Button variant="outline">Learn More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Reports() {
  return <PlaceholderPage title="Reports" description="Generate and download verification summaries." />;
}

export function APIDashboard() {
  return <PlaceholderPage title="API Developer Dashboard" description="Manage API keys and monitor usage metrics." />;
}

export function Billing() {
  return <PlaceholderPage title="Billing & Subscriptions" description="Manage your RentVerify subscription plan." />;
}

export function AdminDashboard() {
  return <PlaceholderPage title="System Admin Center" description="Global platform oversight and user management." />;
}
