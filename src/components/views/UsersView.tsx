'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, CreateUserDTO, UpdateUserDTO, UserRole } from '@/types/auth';
import { UserManagementTable } from '../users/UserManagementTable';
import { CreateAccountModal } from '../users/CreateAccountModal';
import { EditUserModal } from '../users/EditUserModal';
import { ViewUserModal } from '../users/ViewUserModal';
import { ConfirmDialog } from '../users/ConfirmDialog';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export function UsersView() {
  const {
    user: currentUser,
    usersList,
    createEmployeeAccount,
    updateUser,
    deactivateAccount,
    activateAccount,
    resetUserPassword,
  } = useAuth();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'primary';
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'primary',
    action: () => {},
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handlers
  const handleToggleStatus = (target: UserProfile) => {
    const isActivating = target.account_status === 'inactive';
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? 'Activate Employee Account' : 'Deactivate Employee Account',
      description: isActivating
        ? `Are you sure you want to restore active access for ${target.full_name} (${target.email})?`
        : `Deactivating ${target.full_name} will immediately revoke access and invalidate any active sessions.`,
      variant: isActivating ? 'primary' : 'warning',
      action: async () => {
        if (isActivating) {
          const res = await activateAccount(target.id);
          if (res.success) showToast(`Account for ${target.full_name} activated.`);
        } else {
          const res = await deactivateAccount(target.id);
          if (res.success) showToast(`Account for ${target.full_name} deactivated.`);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleChangeRole = (target: UserProfile) => {
    const newRole: UserRole = target.role === 'admin' ? 'employee' : 'admin';
    setConfirmDialog({
      isOpen: true,
      title: newRole === 'admin' ? 'Promote to Administrator' : 'Demote to Employee',
      description:
        newRole === 'admin'
          ? `Grant full administrative privileges to ${target.full_name}? They will be able to manage inventory, settings, and employee credentials.`
          : `Remove administrative access for ${target.full_name}? They will only have standard employee viewing and assignment privileges.`,
      variant: newRole === 'admin' ? 'warning' : 'primary',
      action: async () => {
        const res = await updateUser({ id: target.id, role: newRole });
        if (res.success) {
          showToast(`Role for ${target.full_name} changed to ${newRole.toUpperCase()}.`);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResetPassword = (target: UserProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Issue Password Reset',
      description: `Generate a secure credential reset link for ${target.full_name} (${target.email})?`,
      variant: 'primary',
      action: async () => {
        const res = await resetUserPassword(target.id);
        if (res.success) {
          showToast(`Password reset link generated for ${target.full_name}.`);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] text-xs text-[#16A34A] rounded-md flex items-center justify-between animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5EBE6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
              User Management
            </h1>
            <span className="text-[10px] font-semibold text-[#247A51] bg-[#EBF4EF] px-2 py-0.5 rounded border border-[#D5E9DE] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Administrator Clearance
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage employee access to the Candela Inventory Platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors shadow-none self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Table */}
      <UserManagementTable
        users={usersList}
        currentUserId={currentUser?.id}
        onViewUser={(u) => setViewingUser(u)}
        onEditUser={(u) => setEditingUser(u)}
        onToggleStatus={handleToggleStatus}
        onChangeRole={handleChangeRole}
        onResetPassword={handleResetPassword}
      />

      {/* Modals */}
      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (dto) => {
          const res = await createEmployeeAccount(dto);
          if (res.success) {
            showToast(`Employee account created for ${dto.full_name}.`);
          }
          return res;
        }}
      />

      <EditUserModal
        user={editingUser}
        currentUser={currentUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSave={async (dto) => {
          const res = await updateUser(dto);
          if (res.success) {
            showToast('Employee profile updated successfully.');
          }
          return res;
        }}
      />

      <ViewUserModal
        user={viewingUser}
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => {
          setViewingUser(null);
          setEditingUser(u);
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
