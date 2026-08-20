import React, { useState, useEffect, useCallback } from 'react';
import { Key, Search, RefreshCw, ShieldOff, ShieldCheck, Trash2, Eye } from 'lucide-react';

interface AdminAPIKey {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  key_prefix: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
  verification_credits: number;
  total_requests: number;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('rv_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function apiCall(url: string, method = 'GET', body?: object) {
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Request failed');
  return json;
}

export function AdminAPIManagement() {
  const [keys, setKeys] = useState<AdminAPIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/v1/admin/api-keys');
      setKeys(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (kId: string) => {
    try {
      const res = await apiCall(`/api/v1/admin/api-keys/${kId}/toggle`, 'POST');
      showToast(res.message);
      fetchData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleRevoke = async (kId: string) => {
    try {
      const res = await apiCall(`/api/v1/admin/api-keys/${kId}/revoke`, 'POST');
      showToast(res.message);
      fetchData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Key className="h-6 w-6 text-primary-600" /> Platform API Keys & Access Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage, enable, disable, and revoke API keys across all organization accounts.</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No API keys found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Organization</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Key Prefix</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Credits Available</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Total API Requests</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map(k => (
                  <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{k.organization_name}</div>
                      <div className="text-xs text-slate-400">{k.organization_type}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-600">{k.key_prefix}.••••••••</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{k.verification_credits}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">{k.total_requests}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${k.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(k.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${k.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                        >
                          {k.status === 'ACTIVE' ? 'Disable API' : 'Enable API'}
                        </button>
                        {k.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleRevoke(k.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-700' : 'bg-red-600 border-red-700'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
