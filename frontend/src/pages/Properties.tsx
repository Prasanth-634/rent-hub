import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Home, Plus, MapPin, Users, ShieldCheck } from 'lucide-react';

const propertiesList = [
  { id: 'p_1', name: 'High Street Apartments', address: '420 High St, San Francisco, CA', units: 12, occupied: 11, verified: 10 },
  { id: 'p_2', name: 'Oak Lane Residences', address: '78 Oak Lane, Austin, TX', units: 8, occupied: 8, verified: 7 },
  { id: 'p_3', name: 'Elm Street Commercial & Living', address: '112 Elm St, New York, NY', units: 20, occupied: 18, verified: 15 },
  { id: 'p_4', name: 'Pine Road Townhomes', address: '9 Pine Rd, Seattle, WA', units: 6, occupied: 6, verified: 6 },
];

export function Properties() {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties</h1>
          <p className="mt-1 text-slate-500">Manage real estate assets and track verification coverage per property.</p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {propertiesList.map(p => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {p.address}
                </div>
              </div>
              <Badge variant="success">Active Portfolio</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 bg-surface-50 p-3 rounded-xl text-center">
                <div>
                  <p className="text-xs text-slate-500">Total Units</p>
                  <p className="text-lg font-bold text-slate-900">{p.units}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Occupied</p>
                  <p className="text-lg font-bold text-slate-900">{p.occupied}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Verified</p>
                  <p className="text-lg font-bold text-success-600">{p.verified}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">Manage Units</Button>
                <Button variant="primary" size="sm">View Verifications</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
