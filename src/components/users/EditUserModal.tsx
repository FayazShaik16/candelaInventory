'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, AccountStatus, UpdateUserDTO } from '@/types/auth';
import { X, Save, AlertCircle, ShieldAlert } from 'lucide-react';

interface EditUserModalProps {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: UpdateUserDTO) => Promise<{ success: boolean; error?: string }>;
}

export function EditUserModal({
  user,
  currentUser,
  isOpen,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [status, setStatus] = useState<AccountStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSelf = user?.id === currentUser?.id;

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setRole(user.role);
      setStatus(user.account_status);
      setErrorMessage('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (isSelf && role !== 'admin') {
      setErrorMessage('Security rule: You cannot remove your own administrative clearance.');
      return;
    }

    if (isSelf && status !== 'active') {
      setErrorMessage('Security rule: You cannot deactivate your own account.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSave({
      id: user.id,
      full_name: fullName.trim(),
      role,
      account_status: status,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to update user profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21]">Edit Employee Profile</h2>
            <p className="text-xs text-[#64748B] font-mono">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSelf && (
            <div className="p-2.5 bg-[#FFFBEB] border border-[#FEF3C7] rounded text-[11px] text-[#D97706] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>You are editing your own profile. Critical role and status fields are locked.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Role
              </label>
              <select
                disabled={isSelf}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] disabled:opacity-50 disabled:bg-[#F5F7F5]"
              >
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Account Status
              </label>
              <select
                disabled={isSelf}
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] disabled:opacity-50 disabled:bg-[#F5F7F5]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

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
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
