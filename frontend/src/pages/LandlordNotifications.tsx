import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CheckCheck, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function LandlordNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    const token = localStorage.getItem('rv_token');
    fetch('/api/v1/landlord/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('rv_token');
    await fetch('/api/v1/landlord/notifications/read-all', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const markSingleAsRead = async (id: string) => {
    const token = localStorage.getItem('rv_token');
    await fetch(`/api/v1/landlord/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Landlord Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Alerts regarding tenant consent approvals, verification progress, and credit renewals.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" onClick={markAllAsRead} className="text-xs">
            <CheckCheck className="mr-1.5 h-4 w-4 text-primary-600" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card className="p-6 border border-surface-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Alerts regarding tenant consent disclosures and reports will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markSingleAsRead(n.id)}
                className={`py-4 px-3 flex items-start justify-between gap-4 transition-colors rounded-xl cursor-pointer ${!n.is_read ? 'bg-primary-50/40 font-semibold' : 'hover:bg-surface-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-full ${!n.is_read ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.created_at}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
