'use client';

import React, { useState } from 'react';
import { Radio, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your corporate email address.');
      return;
    }

    setIsSubmitting(true);
    // Simulate secure reset link dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 600);
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
            <h2 className="text-sm font-semibold text-[#172A21]">Reset Password</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Enter your corporate email address to receive password recovery instructions.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-md text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <h3 className="text-xs font-bold text-[#172A21]">Recovery Instructions Dispatched</h3>
                <p className="text-[11px] text-[#64748B]">
                  If an active account exists for <strong>{email}</strong>, a secure one-time password reset link has been dispatched to your inbox.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full h-9 bg-[#247A51] hover:bg-[#1D6342] text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#172A21]">
                  Corporate Email Address
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 bg-[#247A51] hover:bg-[#1D6342] text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#64748B] hover:text-[#172A21] inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
