import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Users, ShieldAlert, Activity, Server, AlertTriangle, CheckCircle2, UserCheck, Building } from 'lucide-react';

const usersList = [
  { id: 'u_1', name: 'Acme Property Management', role: 'LANDLORD', email: 'admin@acmeprop.com', status: 'ACTIVE', verifications: 420 },
  { id: 'u_2', name: 'Apex Lenders Capital', role: 'LENDER', email: 'underwriting@apexlenders.com', status: 'ACTIVE', verifications: 890 },
  { id: 'u_3', name: 'Metro Housing Corp', role: 'LANDLORD', email: 'ops@metrohousing.org', status: 'ACTIVE', verifications: 150 },
  { id: 'u_4', name: 'Global Risk Analytics', role: 'API_CUSTOMER', email: 'dev@globalrisk.io', status: 'ACTIVE', verifications: 3400 },
];

const anomalyAlerts = [
  { id: 'alt_1', tenant: 'Marcus Johnson', property: '78 Oak Lane', reason: 'Abnormal transaction amount spike ($14,500 vs $1,500 expected)', severity: 'HIGH', date: 'Aug 17, 2026' },
  { id: 'alt_2', tenant: 'Priya Sharma', property: '112 Elm St', reason: 'Duplicate transfer detected within 48-hour window', severity: 'MEDIUM', date: 'Aug 16, 2026' },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin System Command Center</h1>
        <p className="mt-1 text-slate-500">Global oversight of users, subscriptions, verification requests, and AI anomaly flags.</p>
      </div>

      {/* Admin Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Platform Users', val: '1,420', sub: '890 Landlords · 340 Lenders', icon: Users, color: 'text-primary-600' },
          { label: 'Total Verifications', val: '48,290', sub: '+24.5% this month', icon: Activity, color: 'text-success-600' },
          { label: 'Active Subscriptions', val: '1,150', sub: '$343,800 MRR', icon: Building, color: 'text-indigo-600' },
          { label: 'AI Anomaly Alerts', val: '12', sub: '2 require admin review', icon: AlertTriangle, color: 'text-danger-600' },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{m.val}</p>
                <p className="text-xs text-slate-500 mt-1">{m.sub}</p>
              </div>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomaly Review Section */}
      <Card className="border-danger-100 bg-danger-50/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger-600" />
            <CardTitle className="text-danger-900">AI Fraud & Anomaly Review Queue</CardTitle>
          </div>
          <CardDescription>Transactions flagged by IsolationForest requiring human oversight</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {anomalyAlerts.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-danger-200">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 text-sm">{a.tenant}</span>
                  <Badge variant="danger">{a.severity} SEVERITY</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.reason}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.property} · {a.date}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Dismiss</Button>
                <Button variant="primary" size="sm">Investigate</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card noPadding>
        <CardHeader className="p-6 border-b border-surface-200">
          <CardTitle>User Management</CardTitle>
          <CardDescription>Organizations, Landlords, Lenders, and API accounts</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization / Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verifications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                <TableCell><Badge variant="info">{u.role}</Badge></TableCell>
                <TableCell className="text-xs text-slate-500">{u.email}</TableCell>
                <TableCell className="text-sm font-semibold">{u.verifications}</TableCell>
                <TableCell><Badge variant="success">{u.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
