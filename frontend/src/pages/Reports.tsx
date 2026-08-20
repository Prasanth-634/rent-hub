import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Share2, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle, Brain } from 'lucide-react';

const paymentHistoryData = [
  { month: 'Jan', amount: 2450 }, { month: 'Feb', amount: 2450 }, { month: 'Mar', amount: 2600 },
  { month: 'Apr', amount: 2200 }, { month: 'May', amount: 2450 }, { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 2450 }, { month: 'Aug', amount: 2450 }, { month: 'Sep', amount: 2450 },
  { month: 'Oct', amount: 2450 }, { month: 'Nov', amount: 2450 }, { month: 'Dec', amount: 2450 },
];

const reliabilityData = [
  { name: 'On-time', value: 9, color: '#22c55e' },
  { name: 'Late', value: 1, color: '#f59e0b' },
  { name: 'Partial', value: 1, color: '#6366f1' },
  { name: 'Missed', value: 1, color: '#ef4444' },
];

export function Reports() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verification Report</h1>
          <p className="text-sm text-slate-500 mt-1">RV-2026-001248 · Generated Aug 18, 2026</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <Button variant="outline"><FileText className="mr-2 h-4 w-4" />View PDF</Button>
          <Button variant="primary"><Download className="mr-2 h-4 w-4" />Download Report</Button>
        </div>
      </div>

      {/* Verification Decision Banner */}
      <div className="rounded-2xl bg-success-50 border border-success-200 p-6 flex items-center gap-5">
        <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
          <CheckCircle2 className="h-7 w-7 text-success-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-success-900">Verification Decision: APPROVED</h2>
          <p className="text-sm text-success-700 mt-1">
            The tenant's rental payment history has been successfully verified. The AI analysis found strong evidence of consistent rent payments matching the lease terms.
          </p>
        </div>
      </div>

      {/* Lease & Tenant Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant & Lease Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Tenant Name', value: 'Emily Chen' },
              { label: 'Property', value: '420 High St, Unit 4B' },
              { label: 'Monthly Rent', value: '$2,450.00' },
              { label: 'Verification Period', value: 'Jan 2025 – Dec 2025' },
              { label: 'Lease Duration', value: '12 Months' },
              { label: 'Landlord / Organization', value: 'Acme Property Management LLC' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center border-b border-surface-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Expected Payments', value: '12', highlight: false },
              { label: 'Verified Payments', value: '11', highlight: false },
              { label: 'On-time Payments', value: '9', color: 'text-success-600' },
              { label: 'Late Payments', value: '1', color: 'text-warning-600' },
              { label: 'Partial Payments', value: '1', color: 'text-primary-600' },
              { label: 'Missed Payments', value: '1', color: 'text-danger-600' },
              { label: 'On-time Rate', value: '81.8%', color: 'text-success-600 font-bold' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center border-b border-surface-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className={`text-sm font-medium ${(item as any).color || 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Monthly payment amounts over the verification period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentHistoryData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip formatter={(v: any) => [`$${v}`, 'Amount']} />
                  <Bar dataKey="amount" radius={[4,4,0,0]}>
                    {paymentHistoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.amount === 0 ? '#ef4444' : entry.amount < 2450 ? '#f59e0b' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Reliability</CardTitle>
            <CardDescription>Breakdown of payment status categories</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reliabilityData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {reliabilityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-600" />
            <CardTitle>AI Analysis & Explanation</CardTitle>
          </div>
          <CardDescription>Results from the RandomForest classifier and IsolationForest anomaly detector</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-surface-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Rent Classification Confidence</p>
                <Badge variant="success">96.8%</Badge>
              </div>
              <p className="text-xs text-slate-500">The RandomForest classifier identified 11 of 12 expected rent transactions based on amount, recurrence pattern, day-of-month distribution, and payee matching score.</p>
            </div>
            <div className="rounded-xl border border-surface-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Rent Transactions Detected</p>
                <span className="text-sm font-bold text-primary-700">11</span>
              </div>
              <p className="text-xs text-slate-500">Non-rent transactions detected and excluded: 237</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-success-900">Anomaly Detection Result</p>
                <Badge variant="success">Clean</Badge>
              </div>
              <p className="text-xs text-success-700">IsolationForest score: 0.02 (threshold: 0.5). No major anomalies, duplicate transfers, or suspicious payment spikes were detected.</p>
            </div>
            <div className="rounded-xl bg-surface-50 border border-surface-200 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Verification Reasons</p>
              <ul className="space-y-1">
                {['Payments consistently match $2,450 monthly lease amount', 'Recurring pattern score: 0.94 (very high regularity)', 'Payment dates cluster around 1st of month (±3 days)', 'Payee name matches known landlord: Acme Prop Mgmt'].map(r => (
                  <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-500 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-success-50 border border-success-100 p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
            <p className="text-sm text-success-800">No anomalies were detected. All payment amounts and dates fall within expected ranges. No duplicate transactions or unusual spikes were found.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
