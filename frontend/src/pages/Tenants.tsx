import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { Users, UserPlus, Search, Mail, Phone, Building } from 'lucide-react';

const tenantsData = [
  { id: 't_1', name: 'Emily Chen', email: 'emily.chen@example.com', phone: '+1 (555) 234-5678', property: '420 High St, Unit 4B', status: 'Verified', rent: '$2,450' },
  { id: 't_2', name: 'Marcus Johnson', email: 'marcus.j@example.com', phone: '+1 (555) 876-5432', property: '78 Oak Lane, Apt 2', status: 'Needs Review', rent: '$1,800' },
  { id: 't_3', name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+1 (555) 345-6789', property: '112 Elm St, Suite 5', status: 'Failed', rent: '$3,100' },
  { id: 't_4', name: 'Tom Nguyen', email: 'tom.n@example.com', phone: '+1 (555) 987-6543', property: '9 Pine Rd, Unit 1A', status: 'Verified', rent: '$1,950' },
  { id: 't_5', name: 'Sara Mitchell', email: 'sara.m@example.com', phone: '+1 (555) 456-7890', property: '55 Maple Ave', status: 'Pending Consent', rent: '$2,200' },
];

export function Tenants() {
  const [search, setSearch] = useState('');
  const filtered = tenantsData.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.property.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tenants</h1>
          <p className="mt-1 text-slate-500">Manage tenant profiles and rental payment verification histories.</p>
        </div>
        <Button variant="primary">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-surface-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants by name or property..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Assigned Property</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-slate-900">{t.name}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  <div>{t.email}</div>
                  <div>{t.phone}</div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{t.property}</TableCell>
                <TableCell className="text-sm font-semibold">{t.rent}</TableCell>
                <TableCell>
                  <Badge variant={t.status === 'Verified' ? 'success' : t.status === 'Needs Review' ? 'warning' : t.status === 'Failed' ? 'danger' : 'default'}>
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View Profile</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
