import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Plus, Search, Filter, Home, Users, CreditCard, ArrowRight, Eye, Edit2, Archive, X, CheckCircle2 } from 'lucide-react';

interface LandlordProperty {
  id: string;
  name: string;
  property_type: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  number_of_units: number;
  status: string;
  tenants_count: number;
  monthly_rent_formatted: string;
}

export function LandlordProperties() {
  const navigate = useNavigate();
  const { id: routePropId } = useParams<{ id?: string }>();
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal / Drawer state for View/Edit
  const [selectedProp, setSelectedProp] = useState<LandlordProperty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LandlordProperty>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (routePropId && properties.length > 0) {
      const found = properties.find(p => p.id === routePropId);
      if (found) {
        setSelectedProp(found);
        setEditForm(found);
      }
    }
  }, [routePropId, properties]);

  const fetchProperties = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProperties(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleOpenView = (prop: LandlordProperty) => {
    setSelectedProp(prop);
    setEditForm(prop);
    setIsEditing(false);
  };

  const handleOpenEdit = (prop: LandlordProperty) => {
    setSelectedProp(prop);
    setEditForm(prop);
    setIsEditing(true);
  };

  const handleSaveProperty = async () => {
    if (!selectedProp) return;
    setSaving(true);
    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch(`/api/v1/landlord/properties/${selectedProp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchProperties();
        setSelectedProp(null);
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveProperty = async (propId: string) => {
    const token = localStorage.getItem('rv_token');
    await fetch(`/api/v1/landlord/properties/${propId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'ARCHIVED' })
    });
    fetchProperties();
    if (selectedProp?.id === propId) setSelectedProp(null);
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = (p.name || p.address_line1).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || p.property_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Property Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your rental properties, unit allocations, and rent roll.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/landlord/properties/new')}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Property
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search property name, address, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Property Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="SINGLE_FAMILY">Single Family Villa</option>
            <option value="COMMERCIAL">Commercial Office</option>
            <option value="MULTI_FAMILY">Multi-Family</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center text-slate-400 text-xs font-medium">Loading properties...</Card>
      ) : filteredProperties.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Building2 className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Properties Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Add your first property to start managing leases and verifying tenant rent payments.</p>
          <Button variant="outline" onClick={() => navigate('/landlord/properties/new')} className="text-xs">
            Add Property Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((p) => (
            <Card key={p.id} className="p-6 border border-surface-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                    {p.property_type}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                    p.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.name || p.address_line1}</h3>
                  <p className="text-xs text-slate-500">{p.address_line1}, {p.city}, {p.state} {p.postal_code}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-surface-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenants</span>
                    <span className="font-semibold text-slate-800">{p.tenants_count} Active</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Rent</span>
                    <span className="font-extrabold text-slate-900">{p.monthly_rent_formatted}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenView(p)}
                  className="w-1/2 text-xs border-surface-300 hover:bg-surface-100"
                >
                  <Eye className="mr-1 h-3.5 w-3.5" /> View
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleOpenEdit(p)}
                  className="w-1/2 bg-primary-600 hover:bg-primary-500 text-white text-xs"
                >
                  <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Property View / Edit Modal */}
      {selectedProp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-xl w-full p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-surface-200 relative">
            <button onClick={() => setSelectedProp(null)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary-100 text-primary-700">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Property' : 'Property Details'}
                </h3>
                <p className="text-xs text-slate-500">{selectedProp.name || selectedProp.address_line1}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Property Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Property Type</label>
                    <select
                      value={editForm.property_type || 'APARTMENT'}
                      onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-2 outline-none"
                    >
                      <option value="APARTMENT">Apartment</option>
                      <option value="SINGLE_FAMILY">Single Family Villa</option>
                      <option value="COMMERCIAL">Commercial Office</option>
                      <option value="MULTI_FAMILY">Multi-Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Units</label>
                    <input
                      type="number"
                      value={editForm.number_of_units || 1}
                      onChange={(e) => setEditForm({ ...editForm, number_of_units: parseInt(e.target.value) || 1 })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address_line1 || ''}
                    onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })}
                    className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state || ''}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={editForm.postal_code || ''}
                      onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                      className="h-10 w-full rounded-xl border border-surface-200 px-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editForm.status || 'ACTIVE'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="h-10 w-full rounded-xl border border-surface-200 px-2 outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-surface-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleArchiveProperty(selectedProp.id)}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Archive className="mr-1 h-3.5 w-3.5" /> Archive Property
                  </Button>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button type="button" variant="primary" onClick={handleSaveProperty} isLoading={saving} className="bg-primary-600 text-white text-xs">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-surface-50 rounded-2xl space-y-2 border border-surface-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Type</span>
                    <span className="font-extrabold text-primary-700">{selectedProp.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                    <span className="font-extrabold text-emerald-700">{selectedProp.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Full Address</span>
                    <span className="font-semibold text-slate-800 text-right">{selectedProp.address_line1}, {selectedProp.city}, {selectedProp.state} {selectedProp.postal_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Units</span>
                    <span className="font-bold text-slate-900">{selectedProp.number_of_units} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Active Rent Roll</span>
                    <span className="font-extrabold text-slate-900">{selectedProp.monthly_rent_formatted}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedProp(null)} className="text-xs">
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => setIsEditing(true)} className="bg-primary-600 text-white text-xs">
                    <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit Property
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

