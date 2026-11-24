'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Radio, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, user, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive error message from query params or form state
  const errorParam = searchParams.get('error');
  const urlErrorMessage = errorParam === 'deactivated'
    ? 'Your account is currently deactivated. Please contact your system administrator.'
    : errorParam === 'unauthorized_admin_required'
      ? 'Access restricted: Administrator clearance required.'
      : '';
  const errorMessage = formError || urlErrorMessage;

  // Handle explicit logout query parameter if present
  useEffect(() => {
    if (searchParams.get('logout') === 'true' && user) {
      logout();
    }
  }, [searchParams, user, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your Candela corporate email address.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password, rememberMe);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Authentication failed. Please verify credentials.');
    } else {
      const redirectTo = searchParams.get('redirectTo') || '/';
      router.push(redirectTo);
    }
  };

  const setDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Candela#2026!');
    setFormError('');
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7F5] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-[420px] space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#173D30] text-white shadow-none border border-[#1E4637]">
            <Radio className="w-6 h-6 text-[#247A51]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#172A21] tracking-tight">
              CANDELA
            </h1>
            <p className="text-xs font-medium text-[#64748B]">
              Inventory Management Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl p-6 sm:p-7 shadow-none space-y-5">
          <div className="border-b border-[#E5EBE6] pb-3">
            <h2 className="text-sm font-semibold text-[#172A21]">
              Employee Sign In
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Access requires authorized corporate credentials.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-md text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Session Info if already logged in */}
          {user && (
            <div className="p-3 bg-[#EBF4EF] border border-[#C2DCD0] rounded-md text-xs text-[#173D30] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-semibold block truncate">{user.full_name} ({user.role})</span>
                <span className="text-[11px] text-[#64748B] block truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(searchParams.get('redirectTo') || '/')}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                >
                  Enter App →
                </button>
                <button
                  type="button"
                  onClick={async () => { await logout(); }}
                  className="px-2.5 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FEE2E2] rounded transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#172A21]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@candelatech.com"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-md text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#172A21]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#247A51] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 pl-9 pr-10 text-xs bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-md text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172A21] transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#247A51] focus:ring-[#247A51] accent-[#247A51] w-3.5 h-3.5"
                />
                <span className="text-[#64748B]">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 bg-[#247A51] hover:bg-[#1D6342] text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying clearance...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill for Reviewers */}
          <div className="pt-2 border-t border-[#E5EBE6] space-y-2">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Quick Test Sign In:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@candelatech.com')}
                className="p-2 rounded bg-[#F5F7F5] hover:bg-[#EBF4EF] border border-[#E5EBE6] text-left transition-colors"
              >
                <div className="font-semibold text-[#172A21]">Admin Role</div>
                <div className="text-[10px] text-[#247A51]">admin@candelatech.com</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('fayaz.ahmed@candelatech.com')}
                className="p-2 rounded bg-[#F5F7F5] hover:bg-[#EBF4EF] border border-[#E5EBE6] text-left transition-colors"
              >
                <div className="font-semibold text-[#172A21]">Employee Role</div>
                <div className="text-[10px] text-[#0284C7]">fayaz.ahmed@candelatech.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#247A51]" />
          <span>Protected by Candela Corporate Single-Sign-On & RLS</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#F5F7F5] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#247A51] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
