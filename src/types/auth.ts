export type UserRole = 'admin' | 'employee';
export type AccountStatus = 'active' | 'inactive';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  last_sign_in_at?: string | null;
}

export type Permission = 
  | 'canViewAllInventory'
  | 'canAddInventory'
  | 'canEditInventory'
  | 'canArchiveInventory'
  | 'canManageAssignments'
  | 'canViewActivityHistory'
  | 'canManageUsers'
  | 'canCreateAccounts'
  | 'canEditEmployeeRole'
  | 'canDeactivateAccount'
  | 'canManageSettings'
  | 'canExecuteAdminAIOperations';

export interface CreateUserDTO {
  full_name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  temporaryPassword?: string;
  sendInvite?: boolean;
}

export interface UpdateUserDTO {
  id: string;
  full_name?: string;
  role?: UserRole;
  account_status?: AccountStatus;
}
