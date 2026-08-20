import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    if (!user) {
      navigate('/landlord/login');
      return;
    }

    switch (user.role) {
      case 'LANDLORD':
        navigate('/landlord/dashboard');
        break;
      case 'LENDER':
        navigate('/lender/dashboard');
        break;
      case 'TENANT':
        navigate('/tenant/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/landlord/login');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-surface-200 space-y-5">
        <div className="mx-auto h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">403 - Access Denied</h1>
          <p className="text-xs text-slate-500 mt-2">
            Your account ({user?.role || 'Guest'}) does not have authorization to access this portal or resource.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <Button variant="primary" onClick={handleReturnToDashboard} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Return to {user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard` : 'Sign In'}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
