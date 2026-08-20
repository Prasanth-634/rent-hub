import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PaymentModal } from '../components/ui/PaymentModal';
import { Code, Key, Copy, RefreshCw, ExternalLink, Activity, CheckCircle2, ShieldAlert, Zap, ShoppingCart } from 'lucide-react';

const initialApiLogs = [
  { id: 'req_01', endpoint: '/api/v1/verifications/verify', method: 'POST', status: 200, duration: '142ms', timestamp: '2026-08-18 14:28:12' },
  { id: 'req_02', endpoint: '/api/v1/tenants/consent', method: 'POST', status: 200, duration: '89ms', timestamp: '2026-08-18 14:25:40' },
  { id: 'req_03', endpoint: '/api/v1/verifications/RV-2026-001248', method: 'GET', status: 200, duration: '45ms', timestamp: '2026-08-18 14:21:05' },
  { id: 'req_04', endpoint: '/api/v1/ai/classify-rent', method: 'POST', status: 200, duration: '310ms', timestamp: '2026-08-18 14:15:33' },
  { id: 'req_05', endpoint: '/api/v1/reports/pdf/RV-2026-001247', method: 'GET', status: 200, duration: '520ms', timestamp: '2026-08-18 14:02:18' },
  { id: 'req_06', endpoint: '/api/v1/verifications/verify', method: 'POST', status: 422, duration: '68ms', timestamp: '2026-08-18 13:58:01' },
  { id: 'req_07', endpoint: '/api/v1/keys/validate', method: 'GET', status: 200, duration: '22ms', timestamp: '2026-08-18 13:45:10' },
];

export function APIDashboard() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKey, setApiKey] = useState('rv_live_9f8a3b2c1d4e5f6g7h8i9j0k');
  const [usage, setUsage] = useState(8420);
  const [totalQuota, setTotalQuota] = useState(10000);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastPurchaseAlert, setLastPurchaseAlert] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState(initialApiLogs);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const regenerateKey = () => {
    const newKey = 'rv_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
  };

  const handlePaymentSuccess = (amount: number, creditsAdded: number, pkgName: string, method: string) => {
    setTotalQuota(prev => prev + creditsAdded);
    setLastPurchaseAlert(`Successfully purchased ${creditsAdded.toLocaleString()} API credits via ${method} for $${amount}. Quota updated in real time!`);
    
    // Add new API log for purchase
    const newLog = {
      id: 'req_' + Math.floor(10 + Math.random() * 90),
      endpoint: '/api/v1/subscriptions/buy-credits',
      method: 'POST',
      status: 200,
      duration: '210ms',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setApiLogs(prev => [newLog, ...prev]);

    setTimeout(() => setLastPurchaseAlert(null), 6000);
  };

  const usagePercent = Math.min(Math.round((usage / totalQuota) * 100), 100);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Real-time Toast Alert */}
      {lastPurchaseAlert && (
        <div className="p-4 rounded-2xl bg-success-50 border border-success-200 text-success-900 flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{lastPurchaseAlert}</span>
          </div>
          <button onClick={() => setLastPurchaseAlert(null)} className="text-xs text-success-700 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">API Developer Dashboard</h1>
          <p className="mt-1 text-slate-500">Integrate RentVerify automated verification directly into your web or mobile app.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setIsPaymentModalOpen(true)} className="shadow-md shadow-primary-500/20">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buy API Credits (GPay / Cards / Bank)
          </Button>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              OpenAPI Docs
            </Button>
          </a>
        </div>
      </div>

      {/* API Overview Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">API Status</span>
              <Activity className="h-4 w-4 text-success-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xl font-bold text-slate-900">Operational</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">99.98% uptime (last 30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Requests Today</span>
              <Zap className="h-4 w-4 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{usage.toLocaleString()}</p>
            <p className="mt-1 text-xs text-success-600">+18% vs yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-primary-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">Monthly Quota</span>
              <Code className="h-4 w-4 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{usage.toLocaleString()} / {totalQuota.toLocaleString()}</p>
            <div className="mt-2">
              <ProgressBar value={usagePercent} indicatorColor="bg-primary-600" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{usagePercent}% used ({totalQuota - usage} remaining)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Error Rate</span>
              <ShieldAlert className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">0.12%</p>
            <p className="mt-1 text-xs text-success-600">Optimal (&lt; 1.0%)</p>
          </CardContent>
        </Card>
      </div>

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary-600" />
            <CardTitle>API Credentials</CardTitle>
          </div>
          <CardDescription>Your secret API keys grant full access to RentVerify API endpoints. Keep them secure!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">Client ID</label>
              <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl p-3">
                <code className="text-sm font-mono font-medium text-slate-800 flex-1">rv_client_live_8912409</code>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">Secret API Key (X-API-Key)</label>
              <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl p-3">
                <code className="text-sm font-mono font-medium text-slate-800 flex-1">
                  {copiedKey ? apiKey : apiKey.substring(0, 8) + '••••••••••••••••••••••••'}
                </code>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copiedKey ? <CheckCircle2 className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-slate-500">Rate Limit: 100 requests / minute</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={regenerateKey}><RefreshCw className="mr-2 h-3.5 w-3.5" />Regenerate Key</Button>
              <Button variant="danger" size="sm">Revoke Key</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Activity Log */}
      <Card noPadding>
        <CardHeader className="p-6 border-b border-surface-200">
          <CardTitle>Recent API Requests</CardTitle>
          <CardDescription>Real-time stream of HTTP requests authenticated with your API key</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Status Code</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant={log.method === 'POST' ? 'info' : 'default'}>{log.method}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-800">{log.endpoint}</TableCell>
                <TableCell>
                  <Badge variant={log.status === 200 ? 'success' : 'danger'}>{log.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">{log.duration}</TableCell>
                <TableCell className="text-xs text-slate-500 font-mono">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
