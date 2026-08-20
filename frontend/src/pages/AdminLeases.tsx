import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Edit3, Eye, Trash2, Check, X, RefreshCw, AlertTriangle, Calendar
} from 'lucide-react';

interface AdminLease {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  property_id: string;
  property_name: string;
  unit_id: string | null;
  unit_name: string | null;
  organization_id: string;
  organization_name: string | null;
  monthly_rent: number;
  monthly_rent_formatted: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
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

export function AdminLeases() {
  const [leases, setLeases] = useState<AdminLease[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals & Drawers
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedLease, setSelectedLease] = useState<AdminLease | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<AdminLease | null>(null);

  const [form, setForm] = useState({
    tenant_id: '', property_id: '', unit_id: '', monthly_rent: 25000,
    start_date: '2025-01-01', end_date: '2025-12-31', status: 'ACTIVE'
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leasesData, usersData, propsData] = await Promise.all([
        apiCall('/api/v1/admin/leases'),
        apiCall('/api/v1/admin/users?role=TENANT'),
        apiCall('/api/v1/admin/properties')
      ]);
      setLeases(Array.isArray(leasesData) ? leasesData : []);
      if (Array.isArray(usersData)) {
        setTenants(usersData.map((u: any) => ({ id: u.id, name: `${u.full_name} (${u.email})` })));
      }
      if (Array.isArray(propsData)) {
        setProperties(propsData.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm({
      tenant_id: tenants[0]?.id || '', property_id: properties[0]?.id || '', unit_id: 'Unit 1A',
      monthly_rent: 25000, start_date: '2025-01-01', end_date: '2025-12-31', status: 'ACTIVE'
    });
    setModalMode('create');
  };

  const openEdit = (l: AdminLease) => {
    setSelectedLease(l);
    setForm({
      tenant_id: l.tenant_id, property_id: l.property_id, unit_id: l.unit_id || '',
      monthly_rent: l.monthly_rent,
      start_date: l.start_date ? new Date(l.start_date).toISOString().split('T')[0] : '2025-01-01',
      end_date: l.end_date ? new Date(l.end_date).toISOString().split('T')[0] : '2025-12-31',
      status: l.status
    });
    setModalMode('edit');
  };

  const openView = (l: AdminLease) => {
    setSelectedLease(l);
    setModalMode('view');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await apiCall('/api/v1/admin/leases', 'POST', form);
        showToast('Lease created successfully');
      } else if (modalMode === 'edit' && selectedLease) {
        await apiCall(`/api/v1/admin/leases/${selectedLease.id}`, 'PUT', form);
        showToast('Lease updated successfully');
      }
      setModalMode(null);
      fetchData();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await apiCall(`/api/v1/admin/leases/${deactivateConfirm.id}/deactivate`, 'POST');
      showToast(`Lease status set to TERMINATED. Historical records retained.`);
      setDeactivateConfirm(null);
      fetchData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const filtered = leases.filter(l =>
    l.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
    l.property_name.toLowerCase().includes(search.toLowerCase()) ||
    l.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" /> Platform Lease Agreements
          </h1>
          <p className="text-sm text-slate-500 mt-1">Full platform control to create, view, edit, and deactivate leases across all properties.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-md shadow-primary-600/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> + Create Lease
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search leases by tenant, property, or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading platform leases...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No leases found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Tenant</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Property & Unit</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Landlord</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Monthly Rent</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Term Dates</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{l.tenant_name}</div>
                      <div className="text-xs text-slate-400">{l.tenant_email}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-800">{l.property_name} ({l.unit_name})</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{l.organization_name}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{l.monthly_rent_formatted}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(l.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – {new Date(l.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${l.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : l.status === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openView(l)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button onClick={() => openEdit(l)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1">
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                        {l.status === 'ACTIVE' && (
                          <button onClick={() => setDeactivateConfirm(l)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold">
                            Deactivate
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

      {/* Create / Edit Lease Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{modalMode === 'create' ? 'Create Platform Lease' : 'Edit Lease Agreement'}</h3>
              <button onClick={() => setModalMode(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Tenant</label>
                <select className="input-field" value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })}>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Property</label>
                <select className="input-field" value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })}>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Monthly Rent (₹)</label>
                  <input type="number" className="input-field" value={form.monthly_rent} onChange={e => setForm({ ...form, monthly_rent: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Lease Status</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRING_SOON">EXPIRING_SOON</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="TERMINATED">TERMINATED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Start Date</label>
                  <input type="date" className="input-field" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">End Date</label>
                  <input type="date" className="input-field" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl border text-slate-700 font-semibold text-xs">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md">
                {saving ? 'Saving...' : 'Save Lease'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Lease Modal */}
      {modalMode === 'view' && selectedLease && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Lease Agreement Details</h3>
              <button onClick={() => setModalMode(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div><strong className="text-slate-900">Lease ID:</strong> <span className="font-mono">{selectedLease.id}</span></div>
              <div><strong className="text-slate-900">Tenant:</strong> {selectedLease.tenant_name} ({selectedLease.tenant_email})</div>
              <div><strong className="text-slate-900">Property:</strong> {selectedLease.property_name}</div>
              <div><strong className="text-slate-900">Landlord Organization:</strong> {selectedLease.organization_name}</div>
              <div><strong className="text-slate-900">Monthly Rent:</strong> {selectedLease.monthly_rent_formatted}</div>
              <div><strong className="text-slate-900">Term Period:</strong> {new Date(selectedLease.start_date).toLocaleDateString()} to {new Date(selectedLease.end_date).toLocaleDateString()}</div>
              <div><strong className="text-slate-900">Status:</strong> {selectedLease.status}</div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivateConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deactivate Lease?</h3>
                <p className="text-xs text-slate-600 mt-1">This will set status to TERMINATED. Historical payment and verification records will be retained.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeactivateConfirm(null)} className="px-4 py-2 rounded-xl border text-slate-700 font-semibold text-xs">Cancel</button>
              <button onClick={handleDeactivate} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md">Deactivate Lease</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold text-white ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-700' : 'bg-red-600 border-red-700'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
