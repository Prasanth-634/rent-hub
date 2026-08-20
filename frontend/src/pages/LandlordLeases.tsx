import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Calendar, Home, Users, Eye, Edit2, Ban, X, AlertTriangle } from 'lucide-react';

interface LandlordLeaseItem {
  id: string;
  tenant_name: string;
  tenant_id: string;
  property_name: string;
  property_id: string;
  monthly_rent_formatted: string;
  monthly_rent?: number;
  security_deposit_formatted: string;
  security_deposit?: number;
  start_date: string;
  end_date: string;
  due_day: number;
  payment_frequency: string;
  status: string;
}

export function LandlordLeases() {
  const navigate = useNavigate();
  const { id: routeLeaseId } = useParams<{ id?: string }>();
  const [leases, setLeases] = useState<LandlordLeaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedLease, setSelectedLease] = useState<LandlordLeaseItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LandlordLeaseItem>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchLeases();
  }, []);

  useEffect(() => {
    if (routeLeaseId && leases.length > 0) {
      const found = leases.find(l => l.id === routeLeaseId);
      if (found) {
        setSelectedLease(found);
        setEditForm(found);
      }
    }
  }, [routeLeaseId, leases]);

  const fetchLeases = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/leases', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeases(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleOpenView = (lease: LandlordLeaseItem) => {
    setSelectedLease(lease);
    setEditForm(lease);
    setIsEditing(false);
    setFormError('');
  };

  const handleOpenEdit = (lease: LandlordLeaseItem) => {
    setSelectedLease(lease);
    setEditForm(lease);
    setIsEditing(true);
    setFormError('');
  };

  const handleSaveLease = async () => {
    if (!selectedLease) return;
    setFormError('');

    if (editForm.start_date && editForm.end_date && new Date(editForm.end_date) <= new Date(editForm.start_date)) {
      setFormError('Lease end date must be strictly after the start date.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch(`/api/v1/landlord/leases/${selectedLease.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          monthly_rent: editForm.monthly_rent,
          security_deposit: editForm.security_deposit,
          start_date: editForm.start_date,
          end_date: editForm.end_date,
          due_day: editForm.due_day,
          status: editForm.status
        })
      });
      if (res.ok) {
        fetchLeases();
        setSelectedLease(null);
        setIsEditing(false);
      } else {
        const errData = await res.json();
        setFormError(errData.detail || 'Failed to update lease');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateLease = async (leaseId: string) => {
    if (!confirm('Are you sure you want to terminate this lease agreement?')) return;
    const token = localStorage.getItem('rv_token');
    await fetch(`/api/v1/landlord/leases/${leaseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'TERMINATED' })
    });
    fetchLeases();
    if (selectedLease?.id === leaseId) setSelectedLease(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lease Agreements</h1>
          <p className="text-xs text-slate-500 mt-1">Manage active rental agreements, rent due dates, and terms.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/landlord/leases/new')}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Create Lease
        </Button>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading leases...</div>
        ) : leases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Active Leases</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a lease agreement linking a tenant to your property.</p>
            <Button variant="outline" onClick={() => navigate('/landlord/leases/new')} className="text-xs">
              Create Lease Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-surface-100 uppercase font-bold text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Tenant</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Monthly Rent</th>
                  <th className="p-3.5">Start Date</th>
                  <th className="p-3.5">End Date</th>
                  <th className="p-3.5">Due Day</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {leases.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{l.tenant_name}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{l.property_name}</td>
                    <td className="p-3.5 font-bold text-slate-900">{l.monthly_rent_formatted}</td>
                    <td className="p-3.5 text-slate-600">{l.start_date}</td>
                    <td className="p-3.5 text-slate-600">{l.end_date}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{l.due_day}th of month</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        l.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'TERMINATED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenView(l)}
                        className="text-xs text-slate-700 border-surface-300 hover:bg-surface-100 h-8 px-2.5"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenEdit(l)}
                        className="text-xs text-primary-700 border-primary-200 hover:bg-primary-50 h-8 px-2.5"
                      >
                        <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                      {l.status !== 'TERMINATED' && (
                        <Button
                          variant="outline"
                          onClick={() => handleTerminateLease(l.id)}
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-8 px-2.5"
                        >
                          <Ban className="mr-1 h-3.5 w-3.5" /> Terminate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Lease View / Edit Modal */}
      {selectedLease && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-5 border border-surface-200 relative">
            <button onClick={() => setSelectedLease(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary-100 text-primary-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Lease Details' : 'Lease Agreement Details'}
                </h3>
                <p className="text-xs text-slate-500">{selectedLease.tenant_name} • {selectedLease.property_name}</p>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                    <input
                      type="date"
                      value={editForm.end_date || ''}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Due Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editForm.due_day || 1}
                      onChange={(e) => setEditForm({ ...editForm, due_day: parseInt(e.target.value) || 1 })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={editForm.status || 'ACTIVE'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-2 outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-surface-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTerminateLease(selectedLease.id)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Ban className="mr-1 h-3.5 w-3.5" /> Terminate Lease
                  </Button>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button type="button" variant="primary" onClick={handleSaveLease} isLoading={saving} className="bg-primary-600 text-white text-xs">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-surface-50 rounded-2xl space-y-2.5 border border-surface-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Tenant Name</span>
                    <span className="font-extrabold text-slate-900">{selectedLease.tenant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Property</span>
                    <span className="font-bold text-primary-700">{selectedLease.property_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Monthly Rent</span>
                    <span className="font-extrabold text-slate-900">{selectedLease.monthly_rent_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Lease Term</span>
                    <span className="font-semibold text-slate-800">{selectedLease.start_date} → {selectedLease.end_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Due Date</span>
                    <span className="font-semibold text-slate-800">{selectedLease.due_day}th of every month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                    <span className="font-extrabold text-emerald-700">{selectedLease.status}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedLease(null)} className="text-xs">
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => setIsEditing(true)} className="bg-primary-600 text-white text-xs">
                    <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit Lease
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

