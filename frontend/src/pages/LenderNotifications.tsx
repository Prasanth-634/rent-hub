import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CheckCircle2, ShieldCheck, Mail, AlertTriangle, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function LenderNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/lender/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Tenant consent updates, verification completion alerts, and billing notifications.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} className="text-xs border-surface-300">
          <Check className="mr-1.5 h-3.5 w-3.5" /> Mark All as Read
        </Button>
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500">You're all caught up with your underwriting verification updates.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {notifications.map((n) => (
              <div key={n.id} className={`py-4 flex items-start gap-3.5 transition-colors ${!n.is_read ? 'bg-indigo-50/40 p-3 rounded-2xl' : ''}`}>
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
