import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Edit3, ShieldOff, ShieldCheck,
  KeyRound, AlertTriangle, X, Check,
  RefreshCw, Briefcase, User, Mail,
  Phone, MapPin, Lock, ArrowUpDown, Eye, RotateCcw, Shield
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  status: string; // "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
  created_at: string | null;
  organization_id: string | null;
  organization_name: string | null;
  organization_type: string | null;
  phone: string | null;
  verification_count: number;
}

type TabRole = 'ALL' | 'LANDLORD' | 'LENDER' | 'TENANT';
type DrawerMode = 'view' | 'edit' | 'reset-password' | 'change-role' | null;

// ─── API helpers ──────────────────────────────────────────────────────────────
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

// ─── Shared UI Pieces ─────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, string> = {
    LANDLORD: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    LENDER: 'bg-blue-100 text-blue-800 border-blue-200',
    TENANT: 'bg-purple-100 text-purple-800 border-purple-200',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${cfg[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status, active }: { status?: string; active: boolean }) {
  const currentStatus = status || (active ? 'ACTIVE' : 'DEACTIVATED');
  if (currentStatus === 'ACTIVE') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">● ACTIVE</span>;
  }
  if (currentStatus === 'SUSPENDED') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">● SUSPENDED</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">● DEACTIVATED</span>;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-fade-in ${type === 'success' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-red-600 text-white border-red-700'}`}>
      {type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
function ConfirmDialog({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel, children
}: {
  title: string; message: string; confirmLabel: string; confirmClass: string;
  onConfirm: () => void; onCancel: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90] animate-fade-in">
      <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── User Drawer (View / Edit / Reset Password / Change Role) ──────────────────
function UserDrawer({
  user, mode, onClose, onRefresh
}: {
  user: AdminUser; mode: DrawerMode; onClose: () => void; onRefresh: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    organization_name: user.organization_name || '',
    address: '',
    is_active: user.is_active,
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState(user.role);
  const [roleReason, setRoleReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setSaving(true);
    setError(null);
    try {
      if (mode === 'edit') {
        await apiCall(`/api/v1/admin/users/${user.id}/profile`, 'PUT', {
          full_name: form.full_name || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          organization_name: form.organization_name || undefined,
          address: form.address || undefined,
          is_active: form.is_active,
        });
        onRefresh('Profile updated successfully');
        onClose();
      } else if (mode === 'reset-password') {
        if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
        if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');
        await apiCall(`/api/v1/admin/users/${user.id}/reset-password`, 'POST', { new_password: newPassword });
        onRefresh('Password reset successfully. User sessions revoked.');
        onClose();
      } else if (mode === 'change-role') {
        if (!roleReason.trim() || roleReason.trim().length < 5) throw new Error('A reason is required (min 5 characters)');
        await apiCall(`/api/v1/admin/users/${user.id}/change-role`, 'POST', { new_role: newRole, reason: roleReason });
        onRefresh(`Role changed to ${newRole} successfully`);
        onClose();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const showOrgField = user.role === 'LANDLORD' || user.role === 'LENDER';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80] flex items-center justify-end animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-700">
              {mode === 'view' ? <Eye className="h-5 w-5" /> : mode === 'edit' ? <Edit3 className="h-5 w-5" /> : mode === 'reset-password' ? <KeyRound className="h-5 w-5" /> : <ArrowUpDown className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'view' ? 'User Profile Details' : mode === 'edit' ? 'Edit Profile' : mode === 'reset-password' ? 'Reset Password' : 'Change Role'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        {/* User Info Bar */}
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="h-11 w-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} active={user.is_active} />
            </div>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* ── View Details Mode ── */}
          {mode === 'view' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Overview</div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div><span className="text-slate-400 block">User ID</span><span className="font-mono text-slate-900 font-bold">{user.id.substring(0, 8)}...</span></div>
                  <div><span className="text-slate-400 block">Role</span><span className="font-bold text-slate-900">{user.role}</span></div>
                  <div><span className="text-slate-400 block">Status</span><span className="font-bold">{user.status || (user.is_active ? 'ACTIVE' : 'DEACTIVATED')}</span></div>
                  <div><span className="text-slate-400 block">Registered</span><span>{user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Information</div>
                <div className="space-y-1.5 text-slate-700">
                  <div><strong className="text-slate-900">Email:</strong> {user.email}</div>
                  <div><strong className="text-slate-900">Phone:</strong> {user.phone || 'Not specified'}</div>
                  {user.organization_name && <div><strong className="text-slate-900">Organization:</strong> {user.organization_name} ({user.organization_type})</div>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Activity & Verification History</div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Total Verifications Processed:</span>
                  <span className="font-extrabold text-indigo-900 text-sm">{user.verification_count}</span>
                </div>
              </div>

              {user.status === 'DEACTIVATED' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                  <strong>Notice:</strong> This account is currently <strong>DEACTIVATED</strong>. The user cannot log in or perform new actions. All historical verification, payment, property, lease, and audit records remain preserved in the system.
                </div>
              )}
            </div>
          )}

          {/* ── Edit Profile ── */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <Field icon={<User className="h-4 w-4" />} label="Full Name">
                <input className="input-field" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </Field>
              <Field icon={<Mail className="h-4 w-4" />} label="Email Address">
                <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field icon={<Phone className="h-4 w-4" />} label="Phone Number">
                <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 00000 00000" />
              </Field>
              {showOrgField && (
                <Field icon={<Briefcase className="h-4 w-4" />} label="Company / Organization">
                  <input className="input-field" value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} />
                </Field>
              )}
              <Field icon={<MapPin className="h-4 w-4" />} label="Address">
                <input className="input-field" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Optional" />
              </Field>
            </div>
          )}

          {/* ── Reset Password ── */}
          {mode === 'reset-password' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Setting a new password will revoke all active sessions for this user. The raw password is never stored or logged.</span>
              </div>
              <Field icon={<Lock className="h-4 w-4" />} label="New Password">
                <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
              </Field>
              <Field icon={<Lock className="h-4 w-4" />} label="Confirm Password">
                <input type="password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
              </Field>
            </div>
          )}

          {/* ── Change Role ── */}
          {mode === 'change-role' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                ⚠ Changing this user's role will change their permissions and dashboard access. All active sessions will be revoked.
              </div>
              <Field icon={<ArrowUpDown className="h-4 w-4" />} label="New Role">
                <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  {['LANDLORD', 'LENDER', 'TENANT'].map(r => (
                    <option key={r} value={r} disabled={r === user.role}>{r}{r === user.role ? ' (current)' : ''}</option>
                  ))}
                </select>
              </Field>
              <Field icon={<Edit3 className="h-4 w-4" />} label="Reason for Role Change (required)">
                <textarea
                  className="input-field resize-none h-24"
                  value={roleReason}
                  onChange={e => setRoleReason(e.target.value)}
                  placeholder="Explain why this role change is needed..."
                />
              </Field>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>
          {mode !== 'view' && (
            <button
              onClick={handle}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold shadow-md shadow-primary-600/20 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Save Changes</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
        <span className="text-slate-400">{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabRole>('ALL');
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'activate' | 'remove' | 'restore'; user: AdminUser } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const role = activeTab !== 'ALL' ? activeTab : undefined;
      const url = role ? `/api/v1/admin/users?role=${role}` : '/api/v1/admin/users';
      const data = await apiCall(url);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (type: 'suspend' | 'activate' | 'remove' | 'restore', user: AdminUser) => {
    try {
      if (type === 'activate') {
        const r = await apiCall(`/api/v1/admin/users/${user.id}/activate`, 'POST');
        showToast(r.message);
      } else if (type === 'suspend') {
        const r = await apiCall(`/api/v1/admin/users/${user.id}/suspend`, 'POST');
        showToast(r.message);
      } else if (type === 'remove') {
        const r = await apiCall(`/api/v1/admin/users/${user.id}/deactivate`, 'POST');
        showToast(r.message);
      } else if (type === 'restore') {
        const r = await apiCall(`/api/v1/admin/users/${user.id}/restore`, 'POST');
        showToast(r.message);
      }
      setConfirmAction(null);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message, 'error');
      setConfirmAction(null);
    }
  };

  const openDrawer = (user: AdminUser, mode: DrawerMode) => {
    setSelectedUser(user);
    setDrawerMode(mode);
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setDrawerMode(null);
  };

  const handleDrawerRefresh = (msg: string) => {
    showToast(msg);
    fetchUsers();
  };

  // Filter
  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organization_name || '').toLowerCase().includes(q);
  });

  const TABS: { id: TabRole; label: string }[] = [
    { id: 'ALL', label: 'All Users' },
    { id: 'LANDLORD', label: 'Landlords' },
    { id: 'LENDER', label: 'Lenders' },
    { id: 'TENANT', label: 'Tenants' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" /> User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Full management access for Landlords, Lenders, and Tenants while preserving historical records.</p>
        </div>
        <button onClick={fetchUsers} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {activeTab === t.id && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px]">
                {filtered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or organization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── User Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm font-medium">Loading users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No users found{search ? ` for "${search}"` : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">User</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verifications</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => {
                  const isDeactivated = u.status === 'DEACTIVATED' || (!u.is_active && u.status !== 'SUSPENDED');
                  const isSuspended = u.status === 'SUSPENDED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{u.full_name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4 text-xs text-slate-600">{u.organization_name || <span className="text-slate-300">—</span>}</td>
                      <td className="px-5 py-4"><StatusBadge status={u.status} active={u.is_active} /></td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{u.verification_count}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* DEACTIVATED Users: [View] [Restore] */}
                          {isDeactivated ? (
                            <>
                              <button
                                onClick={() => openDrawer(u, 'view')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'restore', user: u })}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Restore
                              </button>
                            </>
                          ) : isSuspended ? (
                            /* SUSPENDED Users: [View] [Edit] [Activate] [Remove] */
                            <>
                              <button
                                onClick={() => openDrawer(u, 'view')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button
                                onClick={() => openDrawer(u, 'edit')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'activate', user: u })}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" /> Activate
                              </button>
                              {u.role !== 'ADMIN' && (
                                <button
                                  onClick={() => setConfirmAction({ type: 'remove', user: u })}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </>
                          ) : (
                            /* ACTIVE Users: [View] [Edit] [Suspend] [Remove] */
                            <>
                              <button
                                onClick={() => openDrawer(u, 'view')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                              <button
                                onClick={() => openDrawer(u, 'edit')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'suspend', user: u })}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <ShieldOff className="h-3.5 w-3.5" /> Suspend
                              </button>
                              {u.role !== 'ADMIN' && (
                                <button
                                  onClick={() => setConfirmAction({ type: 'remove', user: u })}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', val: users.length, color: 'text-slate-700' },
            { label: 'Landlords', val: users.filter(u => u.role === 'LANDLORD').length, color: 'text-indigo-700' },
            { label: 'Lenders', val: users.filter(u => u.role === 'LENDER').length, color: 'text-blue-700' },
            { label: 'Tenants', val: users.filter(u => u.role === 'TENANT').length, color: 'text-purple-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{s.label}</div>
              <div className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                <span className="text-amber-600">{users.filter(u => u.status === 'SUSPENDED' && (s.label === 'Total Users' ? true : u.role === s.label.toUpperCase())).length} suspended</span>
                <span>·</span>
                <span className="text-rose-600">{users.filter(u => u.status === 'DEACTIVATED' && (s.label === 'Total Users' ? true : u.role === s.label.toUpperCase())).length} deactivated</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      {selectedUser && drawerMode && (
        <UserDrawer user={selectedUser} mode={drawerMode} onClose={closeDrawer} onRefresh={handleDrawerRefresh} />
      )}

      {/* ── Confirmation Dialogs ──────────────────────────────────────────── */}
      {confirmAction?.type === 'remove' && (
        <ConfirmDialog
          title="Remove User?"
          message="This will deactivate the user's account and prevent them from logging in. Historical verification, payment, property, and audit records will be retained."
          confirmLabel="Remove User"
          confirmClass="bg-rose-600 hover:bg-rose-700"
          onConfirm={() => handleAction('remove', confirmAction.user)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'restore' && (
        <ConfirmDialog
          title="Restore User Account?"
          message={`This will reactivate ${confirmAction.user.full_name}'s account (${confirmAction.user.email}). Status will be set to ACTIVE and the user will be able to log in again.`}
          confirmLabel="Restore User"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={() => handleAction('restore', confirmAction.user)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'suspend' && (
        <ConfirmDialog
          title="Suspend User Account?"
          message={`Are you sure you want to suspend ${confirmAction.user.full_name} (${confirmAction.user.email})? All active sessions will be immediately revoked.`}
          confirmLabel="Suspend Account"
          confirmClass="bg-amber-500 hover:bg-amber-600"
          onConfirm={() => handleAction('suspend', confirmAction.user)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'activate' && (
        <ConfirmDialog
          title="Activate User Account?"
          message={`Activate the account for ${confirmAction.user.full_name} (${confirmAction.user.email})? Status will be set to ACTIVE.`}
          confirmLabel="Activate Account"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={() => handleAction('activate', confirmAction.user)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
