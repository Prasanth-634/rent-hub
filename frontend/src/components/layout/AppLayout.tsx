import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';

export interface AppLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export function AppLayout({ children, user: propUser, onLogout: propLogout }: AppLayoutProps) {
  const { user: authUser, logout: authLogout } = useAuth();

  const user = propUser || (authUser ? { name: authUser.name, email: authUser.email, role: authUser.role } : null);
  const handleLogout = propLogout || authLogout;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
