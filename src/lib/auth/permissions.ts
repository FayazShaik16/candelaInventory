import { Permission, UserRole, UserProfile } from '@/types/auth';

const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  admin: {
    canViewAllInventory: true,
    canAddInventory: true,
    canEditInventory: true,
    canArchiveInventory: true,
    canManageAssignments: true,
    canViewActivityHistory: true,
    canManageUsers: true,
    canCreateAccounts: true,
    canEditEmployeeRole: true,
    canDeactivateAccount: true,
    canManageSettings: true,
    canExecuteAdminAIOperations: true,
  },
  employee: {
    canViewAllInventory: true,
    canAddInventory: false,
    canEditInventory: false,
    canArchiveInventory: false,
    canManageAssignments: false,
    canViewActivityHistory: true,
    canManageUsers: false,
    canCreateAccounts: false,
    canEditEmployeeRole: false,
    canDeactivateAccount: false,
    canManageSettings: false,
    canExecuteAdminAIOperations: false,
  },
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

/**
 * Check if a user profile is active and has permission
 */
export function canUserPerform(user: UserProfile | null | undefined, permission: Permission): boolean {
  if (!user || user.account_status !== 'active') return false;
  return hasPermission(user.role, permission);
}

/**
 * Throw an error if a user profile is not an active admin
 */
export function assertAdmin(user: UserProfile | null | undefined): void {
  if (!user || user.account_status !== 'active' || user.role !== 'admin') {
    throw new Error('Unauthorized: Operation requires active Administrator privileges.');
  }
}
