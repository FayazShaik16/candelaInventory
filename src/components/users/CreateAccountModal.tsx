'use client';

import React, { useState } from 'react';
import { CreateUserDTO, UserRole, AccountStatus } from '@/types/auth';
import { X, UserPlus, Mail, User, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserDTO) => Promise<{ success: boolean; error?: string }>;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAccountModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [status, setStatus] = useState<AccountStatus>('active');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [sendInvite, setSendInvite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Employee full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid corporate email address is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      account_status: status,
      temporaryPassword: temporaryPassword.trim() || undefined,
      sendInvite,
    });
    setIsSubmitting(false);

    if (result.success) {
      // Reset form
      setFullName('');
      setEmail('');
      setRole('employee');
      setStatus('active');
      setTemporaryPassword('');
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to create employee account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#247A51] text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172A21]">Create Employee Account</h2>
              <p className="text-xs text-[#64748B]">Provision corporate access to Candela Inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Employee Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Corporate Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rachel.adams@candelatech.com"
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>
          </div>

          {/* Role and Initial Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Role Assignment *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="employee">Employee (Standard)</option>
                <option value="admin">Admin (Full Clearance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Account Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Optional Temporary Password */}
          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Temporary Password (Optional)
            </label>
            <input
              type="text"
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
            <p className="text-[10px] text-[#64748B] mt-1">
              If omitted, a secure random key will be provisioned in Supabase.
            </p>
          </div>

          {/* Send invite check */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#247A51] focus:ring-[#247A51] accent-[#247A51] w-3.5 h-3.5"
              />
              <span className="text-[#172A21]">Send activation link & instructions via email</span>
            </label>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
