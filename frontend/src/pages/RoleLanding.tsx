import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Landmark, UserCheck, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function RoleLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-6 md:p-12 animate-fade-in">
      {/* Header Branding */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">RentVerify</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Trusted Rental Verification Infrastructure</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Bank-Grade Security</span>
        </div>
      </div>

      {/* Role Selection Container */}
      <div className="max-w-5xl mx-auto w-full py-10 space-y-8 text-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary-400 bg-primary-950/60 px-3 py-1 rounded-full border border-primary-800/40">
            Role-Based Portal Access
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Who are you?</h2>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-xl mx-auto">
            Select your account portal to sign in or create a dedicated role workspace.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Landlord */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-600/10 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Landlord</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Manage properties, leases, and verify tenant rental payment histories in real-time.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/landlord/login')}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold"
            >
              Landlord Login <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Card 2: Lender */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-600/10 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lender</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Verify rental payment history, anomaly scores, and income reliability for underwriting decisions.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/lender/login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              Lender Login <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Card 3: Tenant */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-600/10 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tenant</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Manage verification requests, approve/revoke consent, and view your verified rental passport.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/tenant/login')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Tenant Login <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="max-w-6xl mx-auto w-full text-center py-4 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 RentVerify Infrastructure Inc. All rights reserved.</span>
        <Link to="/admin/login" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
          <Lock className="h-3.5 w-3.5 text-indigo-400" /> Admin Portal
        </Link>
      </div>
    </div>
  );
}
