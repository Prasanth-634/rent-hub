import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  CheckCircle2, ArrowLeft, Building2, UserCircle, 
  Calendar, FileText, Brain
} from 'lucide-react';

export function VerificationDetails() {
  const { id } = useParams();
  const mockId = id || 'RV-2026-001248';

  const timeline = [
    { month: 'January', status: 'Paid', date: 'Jan 1, 2026' },
    { month: 'February', status: 'Paid', date: 'Feb 1, 2026' },
    { month: 'March', status: 'Late', date: 'Mar 5, 2026' },
    { month: 'April', status: 'Partial', date: 'Apr 1, 2026' },
    { month: 'May', status: 'Paid', date: 'May 1, 2026' },
    { month: 'June', status: 'Missed', date: '-' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link to="/verifications" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{mockId}</h1>
            <Badge variant="success">VERIFIED</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Generated on August 18, 2026</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline">Download PDF</Button>
          <Button variant="primary">Share Report</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface-50 border-none shadow-none">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="rounded-full bg-primary-100 p-3 text-primary-600">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tenant</p>
              <p className="text-base font-semibold text-slate-900">Emily Chen</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-50 border-none shadow-none">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Property</p>
              <p className="text-base font-semibold text-slate-900">420 High St, Unit 4B</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-50 border-none shadow-none">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Rent</p>
              <p className="text-base font-semibold text-slate-900">$2,450.00</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-50 border-none shadow-none">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Lease Period</p>
              <p className="text-base font-semibold text-slate-900">12 Months</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-600" />
              <CardTitle>AI Transaction Analysis</CardTitle>
            </div>
            <CardDescription>Machine learning verification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-surface-200 p-4">
                  <p className="text-sm text-slate-500">Rent Classification</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">96.8%</span>
                    <span className="text-sm text-success-600 font-medium">Confidence</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">RandomForest model successfully identified 11 rent payments matching lease terms.</p>
                </div>
                <div className="rounded-xl border border-surface-200 p-4">
                  <p className="text-sm text-slate-500">Anomaly Detection</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">0.02</span>
                    <span className="text-sm text-success-600 font-medium">Score</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">IsolationForest detected no major anomalies or suspicious transaction spikes.</p>
                </div>
              </div>
              
              <div className="rounded-xl bg-success-50 p-4 flex gap-3 border border-success-100">
                <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-success-900">Verification Successful</h4>
                  <p className="text-sm text-success-700 mt-1">
                    The provided bank statements sufficiently prove the rental payment history for the requested period. The AI found high correlation between expected rent amounts, dates, and actual transactions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-surface-100 pb-3">
              <span className="text-sm text-slate-500">Expected Payments</span>
              <span className="font-semibold text-slate-900">12</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-100 pb-3">
              <span className="text-sm text-slate-500">Verified Payments</span>
              <span className="font-semibold text-slate-900">11</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-100 pb-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success-500" /> On-time
              </span>
              <span className="font-semibold text-slate-900">9</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-100 pb-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning-500" /> Late
              </span>
              <span className="font-semibold text-slate-900">1</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-100 pb-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" /> Partial
              </span>
              <span className="font-semibold text-slate-900">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-danger-500" /> Missed
              </span>
              <span className="font-semibold text-slate-900">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>Sequence of transactions over the verification period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mt-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-surface-200" />
            <div className="relative flex justify-between w-full">
              {timeline.map((item, i) => {
                let colorClass = 'bg-success-500 border-success-100 text-success-700';
                if (item.status === 'Late') colorClass = 'bg-warning-500 border-warning-100 text-warning-700';
                if (item.status === 'Partial') colorClass = 'bg-blue-500 border-blue-100 text-blue-700';
                if (item.status === 'Missed') colorClass = 'bg-danger-500 border-danger-100 text-danger-700';
                
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-slate-500 mb-3">{item.month}</div>
                    <div className={`z-10 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${colorClass.split(' ')[0]}`} />
                    <div className="mt-3 text-center">
                      <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase border ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
                        {item.status}
                      </span>
                      <div className="mt-1 text-[10px] text-slate-400">{item.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
