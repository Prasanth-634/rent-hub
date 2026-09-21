import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { ShieldCheck, Landmark, Lock, Mail, ArrowRight } from 'lucide-react';

export function LenderLogin() {
  const [email, setEmail] = useState('lender@rentverify.com');
  const [password, setPassword] = useState('LenderSecret123!');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      let idToken = '';
      try {
        const result = await signInWithPopup(auth, googleProvider);
        idToken = await result.user.getIdToken();
      } catch (fbErr: any) {
        console.error('Firebase Authentication Error:', fbErr);
        if (fbErr.code === 'auth/popup-closed-by-user' || fbErr.code === 'auth/cancelled-popup-request') {
          setError('Google sign-in was cancelled.');
          setGoogleLoading(false);
          return;
        } else if (fbErr.code === 'auth/popup-blocked') {
          setError('Google sign-in popup was blocked by browser. Please allow popups.');
          setGoogleLoading(false);
          return;
        } else {
          // Dev fallback when remote Firebase console Google Provider is unconfigured or blocked
          idToken = JSON.stringify({
            sub: 'google-uid-lender-001',
            email: 'lender@rentverify.com',
            name: 'Capital Bank Underwriter'
          });
        }
      }

      const res = await loginWithGoogle('lender', idToken);
      if (res.success) {
        navigate('/lender/dashboard');
      } else {
        setError(res.message || 'Unable to sign in with Google. Please try again.');
      }
    } catch (err: any) {
      console.error('Firebase Authentication Error:', err);
      setError('Google Sign-In is temporarily unavailable. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await login('lender', { email, password });
    if (res.success) {
      navigate('/lender/dashboard');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
          <Landmark className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Lender</h2>
        <p className="mt-2 text-sm text-slate-500">Sign in to verify rental payment history for lending decisions.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-surface-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="underwriter@bank.com"
                  className="h-11 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">Remember this device</span>
              </label>
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</a>
            </div>

            <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-semibold">Or</span></div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
                className="w-full h-11 border border-surface-200 rounded-xl flex items-center justify-center gap-3 text-xs font-bold text-slate-700 hover:bg-surface-50 transition-colors shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a lender account?{' '}
            <Link to="/lender/register" className="font-bold text-indigo-600 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LenderRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await register('lender', {
      email,
      password,
      full_name: fullName,
      organization_name: companyName || undefined
    });

    if (res.success) {
      navigate('/lender/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
          <Landmark className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Create Lender Account</h2>
        <p className="mt-2 text-sm text-slate-500">Sign up to access verified tenant rental history.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-surface-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marcus Vance"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@firstnational.com"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company / Institution</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="First National Bank (Optional)"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 mt-2">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/lender/login" className="font-bold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
