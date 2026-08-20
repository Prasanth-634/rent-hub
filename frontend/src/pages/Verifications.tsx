import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Eye, Download, Search, Filter,
  ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';

const verifications = [
  { id: 'RV-2026-001248', tenant: 'Emily Chen', property: '420 High St, Unit 4B', period: 'Jan–Dec 2025', paymentStatus: 'On-time', confidence: 'High', status: 'Verified', date: 'Aug 18, 2026' },
  { id: 'RV-2026-001247', tenant: 'Marcus Johnson', property: '78 Oak Lane, Apt 2', period: 'Mar–Aug 2026', paymentStatus: 'Late', confidence: 'Medium', status: 'Needs Review', date: 'Aug 17, 2026' },
  { id: 'RV-2026-001246', tenant: 'Priya Sharma', property: '112 Elm St, Suite 5', period: 'Jan–Jun 2026', paymentStatus: 'Missed', confidence: 'Low', status: 'Failed', date: 'Aug 16, 2026' },
  { id: 'RV-2026-001245', tenant: 'Tom Nguyen', property: '9 Pine Rd, Unit 1A', period: 'Jul 2025–Jun 2026', paymentStatus: 'On-time', confidence: 'High', status: 'Verified', date: 'Aug 15, 2026' },
  { id: 'RV-2026-001244', tenant: 'Sara Mitchell', property: '55 Maple Ave', period: 'Jan–Dec 2025', paymentStatus: 'Partial', confidence: 'Medium', status: 'Pending Consent', date: 'Aug 14, 2026' },
  { id: 'RV-2026-001243', tenant: 'David Lee', property: '300 Cedar Blvd, #8', period: 'Apr–Sep 2026', paymentStatus: 'On-time', confidence: 'High', status: 'Verified', date: 'Aug 13, 2026' },
  { id: 'RV-2026-001242', tenant: 'Aisha Patel', property: '67 Birch Court, Unit 3', period: 'Jan–Jun 2026', paymentStatus: 'Late', confidence: 'Medium', status: 'Needs Review', date: 'Aug 12, 2026' },
];

const statusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  if (status === 'Verified') return 'success';
  if (status === 'Pending Consent') return 'warning';
  if (status === 'Needs Review') return 'warning';
  if (status === 'Failed') return 'danger';
  return 'default';
};

const confidenceVariant = (c: string): 'success' | 'warning' | 'danger' | 'default' => {
  if (c === 'High') return 'success';
  if (c === 'Medium') return 'warning';
  return 'danger';
};

export function Verifications() {
  const [search, setSearch] = useState('');
  const filtered = verifications.filter(v =>
    v.tenant.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.property.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verifications</h1>
          <p className="mt-1 text-slate-500">Manage all verification requests across your portfolio.</p>
        </div>
        <Button variant="primary">
          <ShieldCheck className="mr-2 h-4 w-4" />
          New Verification
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total', value: '1,248', color: 'bg-primary-50 text-primary-700' },
          { label: 'Verified', value: '1,076', color: 'bg-success-50 text-success-700' },
          { label: 'Pending', value: '96', color: 'bg-warning-50 text-warning-700' },
          { label: 'Failed', value: '76', color: 'bg-danger-50 text-danger-700' },
        ].map(m => (
          <Card key={m.label} className={`${m.color} border-none`}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{m.label}</p>
              <p className="mt-1 text-3xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card noPadding>
        <div className="flex items-center gap-4 p-4 border-b border-surface-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tenant, ID, or property..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Verification ID</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>AI Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(v => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs font-semibold text-primary-700">{v.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{v.tenant}</TableCell>
                <TableCell className="text-slate-500 text-sm">{v.property}</TableCell>
                <TableCell className="text-slate-500 text-sm">{v.period}</TableCell>
                <TableCell><Badge variant={v.paymentStatus === 'On-time' ? 'success' : v.paymentStatus === 'Late' ? 'warning' : 'danger'}>{v.paymentStatus}</Badge></TableCell>
                <TableCell><Badge variant={confidenceVariant(v.confidence)}>{v.confidence}</Badge></TableCell>
                <TableCell><Badge variant={statusVariant(v.status)}>{v.status}</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm">{v.date}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/verifications/${v.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200">
          <p className="text-sm text-slate-500">Showing {filtered.length} of {verifications.length} results</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
