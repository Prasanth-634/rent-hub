import React from 'react';
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface TopbarProps {
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export function Topbar({ user, onLogout }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-surface-200 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search verifications, tenants, or properties..."
            className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/help" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-surface-100 hover:text-slate-900">
          <HelpCircle className="h-5 w-5" />
        </Link>
        <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-surface-100 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </Link>

        {onLogout && (
          <button 
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 text-xs font-medium text-slate-600 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
