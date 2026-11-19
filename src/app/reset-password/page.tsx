'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radio, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7F5] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-[420px] space-y-4">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#173D30] text-white border border-[#1E4637]">
            <Radio className="w-6 h-6 text-[#247A51]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#172A21] tracking-tight">CANDELA</h1>
            <p className="text-xs font-medium text-[#64748B]">Inventory Management Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl p-6 sm:p-7 space-y-5">
          <div className="border-b border-[#E5EBE6] pb-3">
            <h2 className="text-sm font-semibold text-[#172A21]">Choose New Password</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {emailParam ? `Updating credentials for ${emailParam}` : 'Set a new secure password for your account.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-md text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <h3 className="text-xs font-bold text-[#172A21]">Password Successfully Updated</h3>
                <p className="text-[11px] text-[#64748B]">
                  Your credentials have been updated securely. You can now sign in with your new password.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full h-9 bg-[#247A51] hover:bg-[#1D6342] text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#172A21]">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full h-9 pl-9 pr-10 text-xs bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-md text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172A21]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#172A21]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-md text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 bg-[#247A51] hover:bg-[#1D6342] text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Password Reset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#F5F7F5] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#247A51] animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
