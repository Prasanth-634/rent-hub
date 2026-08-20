import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { FileText, Plus, Calendar } from 'lucide-react';

const leasesList = [
  { id: 'l_1', tenant: 'Emily Chen', property: '420 High St, Unit 4B', rent: '$2,450.00', start: 'Jan 01, 2025', end: 'Dec 31, 2025', status: 'ACTIVE' },
  { id: 'l_2', tenant: 'Marcus Johnson', property: '78 Oak Lane, Apt 2', rent: '$1,800.00', start: 'Mar 01, 2026', end: 'Feb 28, 2027', status: 'ACTIVE' },
  { id: 'l_3', tenant: 'Priya Sharma', property: '112 Elm St, Suite 5', rent: '$3,100.00', start: 'Jan 01, 2026', end: 'Dec 31, 2026', status: 'ACTIVE' },
  { id: 'l_4', tenant: 'Tom Nguyen', property: '9 Pine Rd, Unit 1A', rent: '$1,950.00', start: 'Jul 01, 2025', end: 'Jun 30, 2026', status: 'EXPIRING_SOON' },
];

export function Leases() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leases</h1>
          <p className="mt-1 text-slate-500">Active and past lease agreements for automatic verification matching.</p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Lease
        </Button>
      </div>

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leasesList.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-slate-900">{l.tenant}</TableCell>
                <TableCell className="text-sm text-slate-600">{l.property}</TableCell>
                <TableCell className="font-semibold text-slate-900">{l.rent}</TableCell>
                <TableCell className="text-xs text-slate-500">{l.start}</TableCell>
                <TableCell className="text-xs text-slate-500">{l.end}</TableCell>
                <TableCell>
                  <Badge variant={l.status === 'ACTIVE' ? 'success' : 'warning'}>{l.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View Contract</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
