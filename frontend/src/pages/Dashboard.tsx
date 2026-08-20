import React from 'react';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent 
} from '../components/ui/Card';

import { ProgressBar } from '../components/ui/ProgressBar';
import { ShieldCheck, ArrowUpRight, AlertCircle } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, Legend
} from 'recharts';

const activityData = [
  { name: 'Jan', verified: 400, pending: 240, review: 100 },
  { name: 'Feb', verified: 500, pending: 139, review: 120 },
  { name: 'Mar', verified: 600, pending: 980, review: 150 },
  { name: 'Apr', verified: 778, pending: 390, review: 180 },
  { name: 'May', verified: 890, pending: 480, review: 200 },
  { name: 'Jun', verified: 1076, pending: 380, review: 96 },
];

const reliabilityData = [
  { name: 'On-time', value: 85, color: '#22c55e' },
  { name: 'Late', value: 10, color: '#f59e0b' },
  { name: 'Partial', value: 3, color: '#3b82f6' },
  { name: 'Missed', value: 2, color: '#ef4444' },
];

export function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good Morning, John!</h1>
          <p className="mt-1 text-slate-500">Here's what's happening with your rental verification activity.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Verifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,248</div>
            <p className="mt-1 flex items-center text-xs text-success-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verified</CardTitle>
            <div className="h-2 w-2 rounded-full bg-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,076</div>
            <p className="mt-1 text-xs text-slate-500">86.2% verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">96</div>
            <p className="mt-1 text-xs text-slate-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">API Usage</CardTitle>
            <CodeIcon className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8,420</div>
            <div className="mt-2">
              <ProgressBar value={84.2} indicatorColor="bg-primary-500" />
            </div>
            <p className="mt-1 text-xs text-slate-500">84.2% of 10,000 quota</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Verification Activity</CardTitle>
            <CardDescription>Volume of verifications over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="verified" name="Verified" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
                  <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="review" name="Review" stroke="#ef4444" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Rent Payment Reliability</CardTitle>
            <CardDescription>Overall AI classification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reliabilityData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {reliabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 rounded-xl bg-primary-50 p-4 border border-primary-100 flex gap-4">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-900">Security & Compliance</h4>
                <p className="mt-1 text-xs text-primary-700">Your account security is up-to-date! HTTPS, API Auth, and Audit Logging are active.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
