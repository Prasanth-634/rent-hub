import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Building2, Landmark, User, Zap, 
  CheckCircle2, AlertCircle, Key, Sparkles, Building, ChevronRight, X
} from 'lucide-react';

export interface LoginProps {
  onLoginSuccess: (user: { name: string; email: string; role: string; token?: string }) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'LANDLORD' | 'LENDER' | 'TENANT' | 'ADMIN'>('LANDLORD');
  const [email, setEmail] = useState('john.doe@acmeprop.com');
  const [password, setPassword] = useState('••••••••••••');
  const [orgName, setOrgName] = useState('Acme Property Management LLC');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      setIsLoading(false);
      
      // Move to 2FA Step for extra security realism
      setIs2FAStep(true);
    }, 800);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 600);
  };

  const completeLogin = () => {
    const roleTitle = 
      role === 'LANDLORD' ? 'Property Manager' : 
      role === 'LENDER' ? 'Lender Underwriter' : 
      role === 'ADMIN' ? 'Platform Administrator' : 'Tenant';
    
    const userName = 
      role === 'LANDLORD' ? 'John Doe' : 
      role === 'LENDER' ? 'Apex Underwriting' : 
      role === 'ADMIN' ? 'System Administrator' : 'Emily Chen';

    onLoginSuccess({
      name: userName,
      email: email,
      role: roleTitle,
      token: 'jwt_token_' + Math.random().toString(36).substring(2, 15)
    });
  };

  const handleQuickDemo = (demoRole: 'LANDLORD' | 'LENDER' | 'ADMIN' | 'TENANT') => {
    setRole(demoRole);
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoEmail = 
        demoRole === 'LANDLORD' ? 'john.doe@acmeprop.com' :
        demoRole === 'LENDER' ? 'underwriting@apexlenders.com' :
        demoRole === 'ADMIN' ? 'admin@rentverify.io' : 'emily.chen@example.com';
      setEmail(demoEmail);

      const roleTitle = 
        demoRole === 'LANDLORD' ? 'Property Manager' : 
        demoRole === 'LENDER' ? 'Lender Underwriter' : 
        demoRole === 'ADMIN' ? 'Platform Administrator' : 'Tenant';
      
      const userName = 
        demoRole === 'LANDLORD' ? 'John Doe' : 
        demoRole === 'LENDER' ? 'Apex Underwriting' : 
        demoRole === 'ADMIN' ? 'System Administrator' : 'Emily Chen';

      onLoginSuccess({
        name: userName,
        email: demoEmail,
        role: roleTitle,
        token: 'demo_token_' + Math.random().toString(36).substring(2)
      });
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetEmailSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetEmailSent(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Feature Showcase Banner (Desktop) */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-primary-950 to-slate-950 p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Decorative Grid Lines & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">RentVerify</span>
            <span className="text-xs text-primary-300 font-semibold block uppercase tracking-widest">FinTech Infrastructure</span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-12 space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-primary-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            AI-Powered Rent Payment Verification Platform
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Automated Rental Risk Assessment for Landlords & Lenders.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Verify tenant income, rent consistency, and anomaly risk in seconds using Scikit-Learn machine learning classifiers and bank statement analysis.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">96.8%</p>
              <p className="text-xs text-slate-400 mt-1">AI Rent Classification Accuracy</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">&lt; 3 Sec</p>
              <p className="text-xs text-slate-400 mt-1">Average Verification Latency</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">SOC2 II</p>
              <p className="text-xs text-slate-400 mt-1">Bank-Grade Encryption</p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs text-slate-300 space-y-2">
            <p className="italic">
              "RentVerify reduced our underwriting decision window from 3 days to under 2 minutes with zero fraud incidents across 12,000+ applicants."
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-6 w-6 rounded-full bg-primary-400 text-slate-900 font-bold text-[10px] flex items-center justify-center">
                AP
              </div>
              <span className="font-semibold text-white">Alex Price</span>
              <span className="text-slate-400">· Head of Risk, Apex Lenders</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400 pt-6">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> OAuth2 / JWT Compliant</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> OpenAPI 3.0 Ready</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Razorpay Secured</span>
        </div>
      </div>

      {/* Right Login / Register Card Container */}
      <div className="lg:w-1/2 bg-surface-50 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">

          {/* Main Card */}
          <Card className="shadow-2xl border-surface-200 bg-white rounded-3xl p-8">
            {/* Header */}
            <div className="space-y-2 text-center pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {is2FAStep ? 'Two-Factor Authentication' : isSignUp ? 'Create your RentVerify account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-slate-500">
                {is2FAStep 
                  ? 'Enter the 6-digit security code sent to your authenticator app'
                  : isSignUp 
                    ? 'Start verifying tenant rental payments in minutes' 
                    : 'Sign in to access your landlord or lender dashboard'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 2: 2FA Screen */}
            {is2FAStep ? (
              <form onSubmit={handleVerify2FA} className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 text-center space-y-2">
                  <span className="text-xs text-slate-500">Security verification for</span>
                  <p className="font-semibold text-slate-900 text-sm font-mono">{email}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 text-center">6-Digit 2FA Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="h-12 w-full text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl border border-surface-200 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-1">Demo tip: Click verify or any 6 digits to proceed</p>
                </div>

                <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 shadow-md shadow-primary-500/25">
                  Verify Code & Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button 
                  type="button" 
                  onClick={() => setIs2FAStep(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-900 text-center block pt-2"
                >
                  ← Back to Sign In
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Role Tabs */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">Select Account Role</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-surface-100 rounded-2xl border border-surface-200">
                    <button
                      type="button"
                      onClick={() => { setRole('LANDLORD'); setEmail('john.doe@acmeprop.com'); }}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                        role === 'LANDLORD' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="h-4 w-4 text-primary-600" />
                      Landlord
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRole('LENDER'); setEmail('underwriting@apexlenders.com'); }}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                        role === 'LENDER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Landmark className="h-4 w-4 text-indigo-600" />
                      Lender
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRole('ADMIN'); setEmail('admin@rentverify.io'); }}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                        role === 'ADMIN' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Zap className="h-4 w-4 text-emerald-600" />
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRole('TENANT'); setEmail('emily.chen@example.com'); }}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-xl flex flex-col items-center gap-1 transition-all ${
                        role === 'TENANT' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <User className="h-4 w-4 text-amber-600" />
                      Tenant
                    </button>
                  </div>
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => completeLogin()}
                    className="h-10 px-3 border border-surface-200 rounded-xl bg-white hover:bg-surface-50 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    Google SSO
                  </button>

                  <button
                    type="button"
                    onClick={() => completeLogin()}
                    className="h-10 px-3 border border-surface-200 rounded-xl bg-white hover:bg-surface-50 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 transition-colors"
                  >
                    <svg className="h-4 w-4 text-[#00a4ef]" viewBox="0 0 23 23" fill="currentColor">
                      <path d="M11.4 0H0v11.4h11.4V0zm11.6 0H11.6v11.4H23V0zM11.4 11.6H0V23h11.4V11.6zm11.6 0H11.6V23H23V11.6z"/>
                    </svg>
                    Microsoft SSO
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-surface-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">Or Email</span>
                </div>

                {/* Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Organization Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Acme Property Management"
                          className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700 block">Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-12 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-slate-600">Remember this device</span>
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isLoading}
                    className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary-500/25"
                  >
                    {isSignUp ? 'Create Account & Access' : 'Sign In to Dashboard'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                {/* Instant Demo Accounts */}
                <div className="pt-2 border-t border-surface-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Instant Demo Accounts</span>
                    <span className="text-primary-600">1-Click Sign In</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleQuickDemo('LANDLORD')} className="text-xs py-2 h-auto">
                      Landlord
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleQuickDemo('LENDER')} className="text-xs py-2 h-auto">
                      Lender
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleQuickDemo('ADMIN')} className="text-xs py-2 h-auto">
                      Admin
                    </Button>
                  </div>
                </div>

                {/* Toggle Sign Up / Login */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-slate-600 hover:text-primary-600 font-medium"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up for a 14-day free trial"}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Security Badge Footer */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 256-Bit SSL</span>
            <span>·</span>
            <span>SOC2 Type II</span>
            <span>·</span>
            <span>HIPAA / FCRA Ready</span>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-surface-200 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your work email address and we'll send you a link to reset your password.
            </p>
            {resetEmailSent ? (
              <div className="p-3 bg-success-50 border border-success-200 text-success-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                <span>Password reset link sent to <strong>{email}</strong>!</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-surface-200 px-3 text-sm outline-none"
                  placeholder="name@company.com"
                />
                <Button variant="primary" type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
