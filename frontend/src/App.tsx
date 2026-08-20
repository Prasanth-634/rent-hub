import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleLanding } from './pages/RoleLanding';

import { LandlordLogin, LandlordRegister } from './pages/LandlordLogin';
import { LenderLogin, LenderRegister } from './pages/LenderLogin';
import { TenantLogin, TenantRegister } from './pages/TenantLogin';
import { AdminLogin } from './pages/AdminLogin';
import { Unauthorized } from './pages/Unauthorized';

import { LandlordDashboard } from './pages/LandlordDashboard';
import { LandlordProperties } from './pages/LandlordProperties';
import { LandlordPropertyNew } from './pages/LandlordPropertyNew';
import { LandlordTenants } from './pages/LandlordTenants';
import { LandlordTenantNew } from './pages/LandlordTenantNew';
import { LandlordLeases } from './pages/LandlordLeases';
import { LandlordLeaseNew } from './pages/LandlordLeaseNew';
import { LandlordVerifications } from './pages/LandlordVerifications';
import { LandlordVerificationNew } from './pages/LandlordVerificationNew';
import { LandlordVerificationDetail } from './pages/LandlordVerificationDetail';
import { LandlordReports } from './pages/LandlordReports';
import { LandlordAPIDashboard } from './pages/LandlordAPIDashboard';
import { LandlordBilling } from './pages/LandlordBilling';
import { LandlordNotifications } from './pages/LandlordNotifications';
import { LandlordProfile } from './pages/LandlordProfile';
import { LandlordSettings } from './pages/LandlordSettings';

import { LenderDashboard } from './pages/LenderDashboard';
import { LenderVerificationRequests } from './pages/LenderVerificationRequests';
import { LenderVerificationNew } from './pages/LenderVerificationNew';
import { LenderVerificationDetail } from './pages/LenderVerificationDetail';
import { LenderReports } from './pages/LenderReports';
import { LenderAPIDashboard } from './pages/LenderAPIDashboard';
import { LenderBilling } from './pages/LenderBilling';
import { LenderNotifications } from './pages/LenderNotifications';
import { LenderProfile } from './pages/LenderProfile';
import { LenderSettings } from './pages/LenderSettings';

import { TenantPortalDashboard } from './pages/TenantPortalDashboard';
import { TenantPayRent } from './pages/TenantPayRent';
import { TenantRentPaymentsHistory } from './pages/TenantRentPaymentsHistory';
import { TenantVerificationRequests } from './pages/TenantVerificationRequests';
import { TenantVerificationDetail } from './pages/TenantVerificationDetail';
import { TenantConsent } from './pages/TenantConsent';
import { TenantTransactionsList } from './pages/TenantTransactionsList';
import { TenantTransactionUpload } from './pages/TenantTransactionUpload';
import { TenantVerificationHistory } from './pages/TenantVerificationHistory';
import { TenantNotifications } from './pages/TenantNotifications';
import { TenantProfile } from './pages/TenantProfile';
import { TenantSettings } from './pages/TenantSettings';

import { Verifications } from './pages/Verifications';
import { VerificationDetails } from './pages/VerificationDetails';
import { Tenants } from './pages/Tenants';
import { Properties } from './pages/Properties';
import { Leases } from './pages/Leases';
import { Reports } from './pages/Reports';
import { APIDashboard } from './pages/APIDashboard';
import { Billing } from './pages/Billing';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminProperties } from './pages/AdminProperties';
import { AdminLeases } from './pages/AdminLeases';
import { AdminVerifications } from './pages/AdminVerifications';
import { AdminAPIManagement } from './pages/AdminAPIManagement';
import { SharedReportView } from './pages/SharedReportView';
import { Settings, HelpCenter } from './pages/SettingsAndSupport';

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth();

  if (!token || !user) {
    if (allowedRoles.includes('ADMIN')) {
      return <Navigate to="/admin/login" replace />;
    } else if (allowedRoles.includes('LENDER')) {
      return <Navigate to="/lender/login" replace />;
    } else if (allowedRoles.includes('TENANT')) {
      return <Navigate to="/tenant/login" replace />;
    }
    return <Navigate to="/landlord/login" replace />;
  }

  // ADMIN has access to all routes
  if (user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AppLayout user={user}>{children}</AppLayout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Role Landing Page */}
      <Route path="/" element={user ? (
        user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
        user.role === 'LENDER' ? <Navigate to="/lender/dashboard" replace /> :
        user.role === 'TENANT' ? <Navigate to="/tenant/dashboard" replace /> :
        <Navigate to="/landlord/dashboard" replace />
      ) : <RoleLanding />} />

      {/* Role-Specific Public Logins & Registrations */}
      <Route path="/landlord/login" element={user?.role === 'LANDLORD' ? <Navigate to="/landlord/dashboard" replace /> : <LandlordLogin />} />
      <Route path="/landlord/register" element={user?.role === 'LANDLORD' ? <Navigate to="/landlord/dashboard" replace /> : <LandlordRegister />} />

      <Route path="/lender/login" element={user?.role === 'LENDER' ? <Navigate to="/lender/dashboard" replace /> : <LenderLogin />} />
      <Route path="/lender/register" element={user?.role === 'LENDER' ? <Navigate to="/lender/dashboard" replace /> : <LenderRegister />} />

      <Route path="/tenant/login" element={user?.role === 'TENANT' ? <Navigate to="/tenant/dashboard" replace /> : <TenantLogin />} />
      <Route path="/tenant/register" element={user?.role === 'TENANT' ? <Navigate to="/tenant/dashboard" replace /> : <TenantRegister />} />

      <Route path="/admin/login" element={user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* LANDLORD Protected Routes */}
      <Route path="/landlord/dashboard" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordDashboard /></ProtectedRoute>} />
      <Route path="/landlord/properties" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordProperties /></ProtectedRoute>} />
      <Route path="/landlord/properties/new" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordPropertyNew /></ProtectedRoute>} />
      <Route path="/landlord/properties/:id" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordProperties /></ProtectedRoute>} />

      <Route path="/landlord/tenants" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordTenants /></ProtectedRoute>} />
      <Route path="/landlord/tenants/new" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordTenantNew /></ProtectedRoute>} />
      <Route path="/landlord/tenants/:id" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordTenants /></ProtectedRoute>} />

      <Route path="/landlord/leases" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordLeases /></ProtectedRoute>} />
      <Route path="/landlord/leases/new" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordLeaseNew /></ProtectedRoute>} />
      <Route path="/landlord/leases/:id" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordLeases /></ProtectedRoute>} />

      <Route path="/landlord/verifications" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordVerifications /></ProtectedRoute>} />
      <Route path="/landlord/verifications/new" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordVerificationNew /></ProtectedRoute>} />
      <Route path="/landlord/verifications/:id" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordVerificationDetail /></ProtectedRoute>} />

      <Route path="/landlord/reports" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordReports /></ProtectedRoute>} />
      <Route path="/landlord/api" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordAPIDashboard /></ProtectedRoute>} />
      <Route path="/landlord/api-keys" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordAPIDashboard /></ProtectedRoute>} />
      <Route path="/landlord/billing" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordBilling /></ProtectedRoute>} />
      <Route path="/landlord/notifications" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordNotifications /></ProtectedRoute>} />
      <Route path="/landlord/profile" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordProfile /></ProtectedRoute>} />
      <Route path="/landlord/settings" element={<ProtectedRoute allowedRoles={['LANDLORD']}><LandlordSettings /></ProtectedRoute>} />

      {/* LENDER Protected Routes */}
      <Route path="/lender/dashboard" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderDashboard /></ProtectedRoute>} />
      <Route path="/lender/verification-requests" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderVerificationRequests /></ProtectedRoute>} />
      <Route path="/lender/verification-requests/new" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderVerificationNew /></ProtectedRoute>} />
      <Route path="/lender/verification-requests/:id" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderVerificationDetail /></ProtectedRoute>} />
      <Route path="/lender/reports" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderReports /></ProtectedRoute>} />
      <Route path="/lender/reports/:id" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderReports /></ProtectedRoute>} />
      <Route path="/lender/api" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderAPIDashboard /></ProtectedRoute>} />
      <Route path="/lender/api-keys" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderAPIDashboard /></ProtectedRoute>} />
      <Route path="/lender/billing" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderBilling /></ProtectedRoute>} />
      <Route path="/lender/notifications" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderNotifications /></ProtectedRoute>} />
      <Route path="/lender/profile" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderProfile /></ProtectedRoute>} />
      <Route path="/lender/settings" element={<ProtectedRoute allowedRoles={['LENDER']}><LenderSettings /></ProtectedRoute>} />

      {/* TENANT Protected Routes */}
      <Route path="/tenant/dashboard" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantPortalDashboard /></ProtectedRoute>} />
      <Route path="/tenant/pay-rent" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantPayRent /></ProtectedRoute>} />
      <Route path="/tenant/rent-payments" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantRentPaymentsHistory /></ProtectedRoute>} />
      <Route path="/tenant/verification-requests" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantVerificationRequests /></ProtectedRoute>} />
      <Route path="/tenant/verification-requests/:id" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantVerificationDetail /></ProtectedRoute>} />
      <Route path="/tenant/consent" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantConsent /></ProtectedRoute>} />
      <Route path="/tenant/transactions" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantTransactionsList /></ProtectedRoute>} />
      <Route path="/tenant/transactions/upload" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantTransactionUpload /></ProtectedRoute>} />
      <Route path="/tenant/verification-history" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantVerificationHistory /></ProtectedRoute>} />
      <Route path="/tenant/notifications" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantNotifications /></ProtectedRoute>} />
      <Route path="/tenant/profile" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantProfile /></ProtectedRoute>} />
      <Route path="/tenant/settings" element={<ProtectedRoute allowedRoles={['TENANT']}><TenantSettings /></ProtectedRoute>} />

      {/* ADMIN Protected Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUserManagement /></ProtectedRoute>} />
      <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProperties /></ProtectedRoute>} />
      <Route path="/admin/leases" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLeases /></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminVerifications /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
      <Route path="/shared/report/:shareToken" element={<SharedReportView />} />
        <Route path="/admin/api" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAPIManagement /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={['ADMIN']}><Billing /></ProtectedRoute>} />
      <Route path="/admin/health" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

      {/* Common Protected Routes */}
      <Route path="/help" element={<ProtectedRoute allowedRoles={['LANDLORD', 'LENDER', 'TENANT', 'ADMIN']}><HelpCenter /></ProtectedRoute>} />

      {/* Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
