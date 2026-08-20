import React from 'react';
import { 
  Settings, ShieldAlert, Activity, Users, Database, FileText, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const reviewQueue = [
    { id: 'v-102', tenant: 'Rahul Sharma', landlord: 'Apex Properties', confidence: '65%', reason: '1 Missed Month payment & Late transaction pattern' },
    { id: 'v-108', tenant: 'Anita Desai', landlord: 'Urban Living', confidence: '58%', reason: 'IsolationForest Anomaly Flag: Rent amount deviation' },
  ];

  const auditLogs = [
    { time: '2026-04-03 14:35', action: 'PROCESS_VERIFICATION', resource: 'VerificationRequest', id: 'v-102', actor: 'system_worker' },
    { time: '2026-04-03 14:30', action: 'UPLOAD_TRANSACTIONS_CSV', resource: 'VerificationRequest', id: 'v-102', actor: 'usr_tenant_98' },
    { time: '2026-04-03 12:10', action: 'APPROVE_CONSENT', resource: 'Consent', id: 'c-2', actor: 'usr_tenant_98' },
    { time: '2026-04-03 10:00', action: 'CREATE_VERIFICATION_REQUEST', resource: 'VerificationRequest', id: 'v-102', actor: 'usr_landlord_01' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-purple-400" /> Admin System Command Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          System health monitoring, verification review queue, audit trail, and subscription controls.
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">FastAPI Backend Status</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Healthy (v1.0.0)
            </h3>
          </div>
          <Activity className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Database Connection</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <Database className="w-5 h-5" /> PostgreSQL Ready
            </h3>
          </div>
          <Database className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Scikit-Learn ML Models</p>
            <h3 className="text-xl font-bold text-purple-400 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> RF & IF Loaded
            </h3>
          </div>
          <ShieldAlert className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      {/* Review Queue */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Human Review Queue (REQUIRES_REVIEW)
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            2 Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4">Landlord</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Flag Reason</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reviewQueue.map((q) => (
                <tr key={q.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono text-xs text-blue-400 font-bold">{q.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{q.tenant}</td>
                  <td className="py-3 px-4 text-slate-400">{q.landlord}</td>
                  <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">{q.confidence}</td>
                  <td className="py-3 px-4 text-xs text-slate-300">{q.reason}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-600/20">
                      Manual Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" /> Immutable System Audit Trail
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Resource ID</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 text-xs">
                  <td className="py-3 px-4 font-mono text-slate-400">{log.time}</td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-300">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300">{log.resource}</td>
                  <td className="py-3 px-4 font-mono text-blue-400">{log.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{log.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
