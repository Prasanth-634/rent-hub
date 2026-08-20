import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Code, KeyRound, Plus, RefreshCw, Trash2, Copy, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface APIKeyItem {
  id: string;
  key_prefix: string;
  masked_key: string;
  name: string;
  status: string;
  created_at: string;
}

export function LandlordAPIDashboard() {
  const [apiUsage, setApiUsage] = useState<any>({
    api_status: 'ACTIVE',
    requests_today: 14,
    monthly_requests: 184,
    remaining_credits: 5000,
    rate_limit: '100 req/min',
    api_errors: 0
  });

  const [keys, setKeys] = useState<APIKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('Landlord Integration Key');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem('rv_token');
    Promise.all([
      fetch('/api/v1/landlord/api-usage', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/v1/landlord/api-keys', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([uData, kData]) => {
      if (uData.requests_today !== undefined) setApiUsage(uData);
      if (Array.isArray(kData)) setKeys(kData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCreateKey = async () => {
    setCreating(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/landlord/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: keyName })
      });
      const data = await res.json();
      setCreating(false);
      if (res.ok) {
        setCreatedKeySecret(data.raw_api_key_secret);
        fetchData();
      }
    } catch {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    const token = localStorage.getItem('rv_token');
    await fetch(`/api/v1/landlord/api-keys/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const copySecret = () => {
    if (createdKeySecret) {
      navigator.clipboard.writeText(createdKeySecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRotateKey = async (id: string) => {
    const token = localStorage.getItem('rv_token');
    const res = await fetch(`/api/v1/landlord/api-keys/${id}/rotate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setCreatedKeySecret(data.raw_api_key_secret);
      fetchData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Access & Developer Keys</h1>
        <p className="text-xs text-slate-500 mt-1">Integrate RentVerify verification engine into your property management systems.</p>
      </div>

      {/* API Usage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">API Status</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-extrabold text-slate-900">{apiUsage.api_status}</span>
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requests Today</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-primary-600">{apiUsage.requests_today}</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Usage</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{apiUsage.monthly_requests} reqs</span>
          </div>
        </Card>

        <Card className="p-4 border border-surface-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining Credits</span>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{apiUsage.remaining_credits}</span>
          </div>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card className="p-6 border border-surface-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-surface-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">API Keys</h3>
              <p className="text-xs text-slate-500">Manage production API secret keys.</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCreateKey} isLoading={creating} className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-4">
            <Plus className="mr-1.5 h-4 w-4" /> Generate API Key
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">No active API keys found. Generate one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Key Prefix</th>
                  <th className="p-3.5">Masked Key</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{k.key_prefix}</td>
                    <td className="p-3.5 font-mono text-slate-500">{k.masked_key}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {k.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{k.created_at}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        variant="outline"
                        onClick={() => handleRotateKey(k.id)}
                        className="text-xs text-primary-700 border-primary-200 hover:bg-primary-50 h-8 px-2.5"
                      >
                        <RefreshCw className="mr-1 h-3.5 w-3.5" /> Rotate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-2.5"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Raw Secret Exposure Modal (Single Exposure) */}
      {createdKeySecret && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-5 border border-surface-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">API Key Generated</h3>
                <p className="text-xs text-slate-500">Save this secret key now. It will NEVER be displayed again.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Raw API Key Secret</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-emerald-400 break-all">{createdKeySecret}</code>
                <button onClick={copySecret} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setCreatedKeySecret(null)} className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-6">
                Done & Saved
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
