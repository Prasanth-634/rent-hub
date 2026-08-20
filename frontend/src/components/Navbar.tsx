import React from 'react';
import { Building2, ShieldCheck, UserCheck, Settings, Play, Sparkles } from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, activeRole, setActiveRole }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">RentVerify</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">AI Engine</span>
            </div>
            <p className="text-xs text-slate-400">Automated Tenant Payment Verification</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Landlord Portal
          </button>

          <button
            onClick={() => setCurrentView('tenant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              currentView === 'tenant'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Tenant Portal
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin Panel
          </button>

          <button
            onClick={() => setCurrentView('demo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentView === 'demo'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30'
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Live ML Demo
          </button>
        </nav>

        {/* Role Selector & User Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Simulate Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as Role)}
              className="bg-transparent text-xs text-blue-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="LANDLORD" className="bg-slate-900 text-slate-200">Landlord</option>
              <option value="TENANT" className="bg-slate-900 text-slate-200">Tenant</option>
              <option value="LENDER" className="bg-slate-900 text-slate-200">Lender</option>
              <option value="ADMIN" className="bg-slate-900 text-slate-200">Admin</option>
            </select>
          </div>

          <button
            onClick={() => setCurrentView('demo')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Run Test CSV
          </button>
        </div>

      </div>
    </header>
  );
};
