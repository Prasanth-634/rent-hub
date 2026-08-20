import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../ui/Card';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Home, 
  FileText, 
  BarChart3, 
  Code, 
  CreditCard, 
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  Upload,
  UserCheck,
  Building2,
  Landmark,
  KeyRound,
  Activity,
  Receipt,
  Wallet
} from 'lucide-react';

const landlordNavigation = [
  { name: 'Dashboard', href: '/landlord/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/landlord/properties', icon: Home },
  { name: 'Tenants', href: '/landlord/tenants', icon: Users },
  { name: 'Leases', href: '/landlord/leases', icon: FileText },
  { name: 'Verifications', href: '/landlord/verifications', icon: ShieldCheck },
  { name: 'Reports', href: '/landlord/reports', icon: BarChart3 },
  { name: 'API Access', href: '/landlord/api', icon: Code },
  { name: 'Billing & Credits', href: '/landlord/billing', icon: CreditCard },
  { name: 'Notifications', href: '/landlord/notifications', icon: Bell },
  { name: 'Settings', href: '/landlord/settings', icon: Settings },
];

const lenderNavigation = [
  { name: 'Dashboard', href: '/lender/dashboard', icon: LayoutDashboard },
  { name: 'Verification Requests', href: '/lender/verification-requests', icon: ShieldCheck },
  { name: 'Reports', href: '/lender/reports', icon: BarChart3 },
  { name: 'API Access', href: '/lender/api', icon: Code },
  { name: 'Billing & Credits', href: '/lender/billing', icon: CreditCard },
  { name: 'Notifications', href: '/lender/notifications', icon: Bell },
  { name: 'Settings', href: '/lender/settings', icon: Settings },
];

const tenantNavigation = [
  { name: 'Dashboard', href: '/tenant/dashboard', icon: LayoutDashboard },
  { name: 'Pay Rent', href: '/tenant/pay-rent', icon: CreditCard },
  { name: 'Rent Payments', href: '/tenant/rent-payments', icon: Receipt },
  { name: 'Verification Requests', href: '/tenant/verification-requests', icon: ShieldCheck },
  { name: 'Consent', href: '/tenant/consent', icon: UserCheck },
  { name: 'Transactions', href: '/tenant/transactions', icon: FileText },
  { name: 'Verification History', href: '/tenant/verification-history', icon: BarChart3 },
  { name: 'Notifications', href: '/tenant/notifications', icon: Bell },
  { name: 'Profile', href: '/tenant/profile', icon: Users },
  { name: 'Settings', href: '/tenant/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users & Roles', href: '/admin/users', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Home },
  { name: 'Leases', href: '/admin/leases', icon: FileText },
  { name: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
  { name: 'Reports & Audits', href: '/admin/reports', icon: BarChart3 },
  { name: 'API Keys', href: '/admin/api', icon: KeyRound },
  { name: 'Billing & Subscriptions', href: '/admin/billing', icon: CreditCard },
  { name: 'System Health', href: '/admin/health', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const landlordBottomNav = [
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Profile', href: '/landlord/profile', icon: Users },
];

const lenderBottomNav = [
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Profile', href: '/lender/profile', icon: Users },
];

const defaultBottomNav = [
  { name: 'Help Center', href: '/help', icon: HelpCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export interface SidebarProps {
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return 'RV';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const role = user?.role || 'LANDLORD';
  const navItems = 
    role === 'ADMIN' ? adminNavigation :
    role === 'LENDER' ? lenderNavigation :
    role === 'TENANT' ? tenantNavigation :
    landlordNavigation;

  const currentBottomNav = 
    role === 'LANDLORD' ? landlordBottomNav :
    role === 'LENDER' ? lenderBottomNav :
    defaultBottomNav;

  const renderNavItems = (items: typeof landlordNavigation) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = location.pathname === item.href || 
                         (item.href !== '/' && location.pathname.startsWith(item.href));
        return (
          <li key={item.name}>
            <Link
              to={item.href}
              className={cn(
                'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-surface-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-surface-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">RentVerify</span>
            <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">{role} PORTAL</span>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-8">
          <div>
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role} Navigation
            </div>
            {renderNavItems(navItems)}
          </div>
        </nav>

        <div className="mt-auto pt-6">
          {renderNavItems(currentBottomNav)}
          
          <div className="mt-4 border-t border-surface-200 pt-4">
            <div className="flex items-center px-3 py-2">
              <Link to={role === 'LANDLORD' ? '/landlord/profile' : role === 'LENDER' ? '/lender/profile' : role === 'TENANT' ? '/tenant/profile' : '#'} className="flex items-center flex-1 overflow-hidden group">
                <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-800 font-bold text-xs shadow-inner">
                  {getInitials(user?.name)}
                </div>
                <div className="ml-3 flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{user?.name || 'User'}</span>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">{role}</span>
                </div>
              </Link>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  title="Sign Out"
                  className="ml-auto text-slate-400 hover:text-danger-600 hover:bg-danger-50 p-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
