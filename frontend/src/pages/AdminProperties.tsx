import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, MapPin, Users, ShieldCheck, Search, Edit3, Eye, Trash2,
  Check, X, RefreshCw, AlertTriangle, Layers, Home, ChevronRight
} from 'lucide-react';

interface AdminProperty {
  id: string;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: string;
  number_of_units: number;
  occupied_units: number;
  verified_units: number;
  status: string;
  organization_id: string;
  organization_name: string | null;
  created_at: string;
}

interface LandlordOrg {
  id: string;
  name: string;
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

export function AdminProperties() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [landlords, setLandlords] = useState<LandlordOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals & Drawers
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'units' | 'view' | null>(null);
  const [selectedProp, setSelectedProp] = useState<AdminProperty | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<AdminProperty | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '', address_line1: '', city: 'Bangalore', state: 'Karnataka', postal_code: '560001',
    country: 'IN', property_type: 'APARTMENT', number_of_units: 1, organization_id: ''
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propsData, usersData] = await Promise.all([
        apiCall('/api/v1/admin/properties'),
        apiCall('/api/v1/admin/users?role=LANDLORD')
      ]);
      setProperties(Array.isArray(propsData) ? propsData : []);
      if (Array.isArray(usersData)) {
        const orgsMap = new Map<string, string>();
        usersData.forEach((u: any) => {
          if (u.organization_id && u.organization_name) {
            orgsMap.set(u.organization_id, u.organization_name);
          }
        });
        setLandlords(Array.from(orgsMap.entries()).map(([id, name]) => ({ id, name })));
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
      name: '', address_line1: '', city: 'Bangalore', state: 'Karnataka', postal_code: '560001',
      country: 'IN', property_type: 'APARTMENT', number_of_units: 1,
      organization_id: landlords[0]?.id || ''
    });
    setModalMode('create');
  };

  const openEdit = (p: AdminProperty) => {
    setSelectedProp(p);
    setForm({
      name: p.name, address_line1: p.address_line1, city: p.city, state: p.state,
      postal_code: p.postal_code, country: p.country, property_type: p.property_type,
      number_of_units: p.number_of_units, organization_id: p.organization_id
    });
    setModalMode('edit');
  };

  const openView = (p: AdminProperty) => {
    setSelectedProp(p);
    setModalMode('view');
  };

  const openUnits = (p: AdminProperty) => {
    setSelectedProp(p);
    setModalMode('units');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await apiCall('/api/v1/admin/properties', 'POST', form);
        showToast('Property created successfully');
      } else if (modalMode === 'edit' && selectedProp) {
        await apiCall(`/api/v1/admin/properties/${selectedProp.id}`, 'PUT', form);
        showToast('Property updated successfully');
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
      await apiCall(`/api/v1/admin/properties/${deactivateConfirm.id}/deactivate`, 'POST');
      showToast(`Property '${deactivateConfirm.name}' deactivated. Historical records retained.`);
      setDeactivateConfirm(null);
      fetchData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    (p.organization_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-600" /> Platform Properties Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Full platform control to view, edit, manage units, and deactivate properties across all landlords.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-md shadow-primary-600/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> + Add Property
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search properties by name, city, or landlord..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Grid of Properties */}
      {loading ? (
        <div className="text-center py-20 text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading platform properties...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400">No properties found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {p.address_line1}, {p.city}, {p.state} {p.postal_code}
                  </div>
                  <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 inline-block px-2.5 py-0.5 rounded-full mt-2 border border-indigo-100">
                    Owner: {p.organization_name || 'Landlord Organization'}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {p.status}
                </span>
              </div>

              {/* Unit Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                <div>
                  <div className="text-slate-400">Total Units</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{p.number_of_units}</div>
                </div>
                <div>
                  <div className="text-slate-400">Occupied</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{p.occupied_units}</div>
                </div>
                <div>
                  <div className="text-slate-400">Verified</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{p.verified_units}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button onClick={() => openView(p)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button onClick={() => openEdit(p)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => openUnits(p)} className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> Manage Units
                </button>
                {p.status === 'ACTIVE' && (
                  <button onClick={() => setDeactivateConfirm(p)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1">
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{modalMode === 'create' ? 'Add Platform Property' : 'Edit Property'}</h3>
              <button onClick={() => setModalMode(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Property Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. High Street Apartments" />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Owner Landlord Organization</label>
                <select className="input-field" value={form.organization_id} onChange={e => setForm({ ...form, organization_id: e.target.value })}>
                  {landlords.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Property Type</label>
                  <select className="input-field" value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}>
                    <option value="APARTMENT">Apartment</option>
                    <option value="SINGLE_FAMILY">Villa / Single Family</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Total Units</label>
                  <input type="number" className="input-field" value={form.number_of_units} onChange={e => setForm({ ...form, number_of_units: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Address Line</label>
                <input className="input-field" value={form.address_line1} onChange={e => setForm({ ...form, address_line1: e.target.value })} placeholder="123 Palm Street" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">City</label>
                  <input className="input-field" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">State</label>
                  <input className="input-field" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Postal Code</label>
                  <input className="input-field" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl border text-slate-700 font-semibold text-xs">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md">
                {saving ? 'Saving...' : 'Save Property'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {modalMode === 'view' && selectedProp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Property Details</h3>
              <button onClick={() => setModalMode(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div><strong className="text-slate-900">Name:</strong> {selectedProp.name}</div>
              <div><strong className="text-slate-900">Owner Landlord:</strong> {selectedProp.organization_name || 'Apex Housing LLC'}</div>
              <div><strong className="text-slate-900">Address:</strong> {selectedProp.address_line1}, {selectedProp.city}, {selectedProp.state} {selectedProp.postal_code}</div>
              <div><strong className="text-slate-900">Type:</strong> {selectedProp.property_type}</div>
              <div><strong className="text-slate-900">Total Units:</strong> {selectedProp.number_of_units} ({selectedProp.occupied_units} Occupied, {selectedProp.verified_units} Verified)</div>
              <div><strong className="text-slate-900">Status:</strong> {selectedProp.status}</div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Units Drawer */}
      {modalMode === 'units' && selectedProp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Units — {selectedProp.name}</h3>
                <p className="text-xs text-slate-500">Unit details, occupants, and verification status</p>
              </div>
              <button onClick={() => setModalMode(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {Array.from({ length: selectedProp.number_of_units }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Unit #{idx + 1}</div>
                    <div className="text-[10px] text-slate-500">Status: {idx < selectedProp.occupied_units ? 'Occupied (Active Lease)' : 'Vacant'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Done</button>
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
                <h3 className="text-base font-bold text-slate-900">Deactivate Property?</h3>
                <p className="text-xs text-slate-600 mt-1">This will set status to INACTIVE. Historical lease, verification, and payment records will be retained.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeactivateConfirm(null)} className="px-4 py-2 rounded-xl border text-slate-700 font-semibold text-xs">Cancel</button>
              <button onClick={handleDeactivate} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md">Deactivate Property</button>
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
