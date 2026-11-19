'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, CreateUserDTO, UpdateUserDTO } from '@/types/auth';
import { INITIAL_MOCK_PROFILES } from '@/lib/auth/mockUsers';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  usersList: UserProfile[];
  createEmployeeAccount: (dto: CreateUserDTO) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  updateUser: (dto: UpdateUserDTO) => Promise<{ success: boolean; error?: string }>;
  deactivateAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  activateAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  resetUserPassword: (userId: string) => Promise<{ success: boolean; error?: string; resetLink?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'candela_users_registry';
const CURRENT_USER_KEY = 'candela_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_MOCK_PROFILES);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to sync session cookie for Next.js SSR middleware
  const setSessionCookie = (profile: UserProfile | null) => {
    if (typeof document === 'undefined') return;
    if (profile) {
      document.cookie = `candela_session=${profile.id}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `candela_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `candela_status=${profile.account_status}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'candela_session=; path=/; max-age=0';
      document.cookie = 'candela_role=; path=/; max-age=0';
      document.cookie = 'candela_status=; path=/; max-age=0';
    }
  };

  // Initialize session on mount
  useEffect(() => {
    // 1. Fetch live profiles from Supabase API
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          setUsersList(data.users);
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data.users));
          } catch {}
        }
      })
      .catch((err) => console.warn('Could not fetch users from server:', err));

    try {
      // 2. Initialize user list from localStorage or default
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        setUsersList(JSON.parse(savedUsers));
      } else {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PROFILES));
      }

      // 3. Check if Supabase client is active
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
          if (authUser) {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single()
              .then(({ data: profileData }) => {
                if (profileData && profileData.account_status === 'active') {
                  setUser(profileData);
                  setSessionCookie(profileData);
                } else {
                  setUser(null);
                  setSessionCookie(null);
                }
                setIsLoading(false);
              });
            return;
          }
          checkLocalSession();
        });
      } else {
        checkLocalSession();
      }
    } catch {
      checkLocalSession();
    }

    function checkLocalSession() {
      try {
        const savedSession = localStorage.getItem(CURRENT_USER_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession) as UserProfile;
          // Verify account is still active in usersList
          const latestList = localStorage.getItem(USERS_STORAGE_KEY);
          const currentList: UserProfile[] = latestList ? JSON.parse(latestList) : INITIAL_MOCK_PROFILES;
          const freshProfile = currentList.find((u) => u.id === parsed.id);

          if (freshProfile && freshProfile.account_status === 'active') {
            setUser(freshProfile);
            setSessionCookie(freshProfile);
          } else {
            // Deactivated or removed
            localStorage.removeItem(CURRENT_USER_KEY);
            setUser(null);
            setSessionCookie(null);
          }
        } else {
          // Default initial session for immediate exploration is Admin Alex Mercer
          const defaultAdmin = INITIAL_MOCK_PROFILES[0];
          setUser(defaultAdmin);
          setSessionCookie(defaultAdmin);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultAdmin));
        }
      } catch {
        setUser(null);
        setSessionCookie(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const saveUsersToStorage = (updated: UserProfile[]) => {
    setUsersList(updated);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Login handler
  const login = async (
    email: string,
    pass: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // If real Supabase configured:
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile?.account_status === 'inactive') {
            await supabase.auth.signOut();
            setIsLoading(false);
            return {
              success: false,
              error: 'This account has been deactivated. Please contact your Candela system administrator.',
            };
          }

          setUser(profile);
          setSessionCookie(profile);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Mock validation
      // Retrieve latest users
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const currentList: UserProfile[] = stored ? JSON.parse(stored) : usersList;
      const matched = currentList.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!matched) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email address or password.' };
      }

      // Check account status
      if (matched.account_status === 'inactive') {
        setIsLoading(false);
        return {
          success: false,
          error: 'This account is deactivated. Please contact your Candela administrator.',
        };
      }

      // Update last sign in
      const updatedProfile: UserProfile = {
        ...matched,
        last_sign_in_at: new Date().toISOString(),
      };

      const updatedList = currentList.map((u) => (u.id === matched.id ? updatedProfile : u));
      saveUsersToStorage(updatedList);

      setUser(updatedProfile);
      setSessionCookie(updatedProfile);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'An authentication error occurred.' };
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {}

    setUser(null);
    setSessionCookie(null);
    setIsLoading(false);

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Admin: Create employee account
  const createEmployeeAccount = async (
    dto: CreateUserDTO
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only administrators can create employee accounts.' };
    }

    const email = dto.email.trim().toLowerCase();

    // Check duplicate email
    if (usersList.some((u) => u.email.toLowerCase() === email)) {
      return { success: false, error: `An account with email "${email}" already exists.` };
    }

    // Call server API for Supabase Admin creation if available
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          const updated = [json.user, ...usersList];
          saveUsersToStorage(updated);
          return { success: true, user: json.user };
        }
      }
    } catch {
      // Fallback to local store
    }

    // Local fallback creation
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: dto.full_name.trim(),
      email,
      role: dto.role,
      account_status: dto.account_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
      last_sign_in_at: null,
    };

    const updated = [newProfile, ...usersList];
    saveUsersToStorage(updated);
    return { success: true, user: newProfile };
  };

  // Admin: Update user
  const updateUser = async (dto: UpdateUserDTO): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Administrator privileges required.' };
    }

    // Prevent admin from demoting themselves
    if (dto.id === user.id && dto.role && dto.role !== 'admin') {
      return { success: false, error: 'Protection: You cannot remove your own administrative privileges.' };
    }

    // Prevent admin from deactivating themselves
    if (dto.id === user.id && dto.account_status && dto.account_status !== 'active') {
      return { success: false, error: 'Protection: You cannot deactivate your own administrative account.' };
    }

    const updatedList = usersList.map((u) => {
      if (u.id === dto.id) {
        return {
          ...u,
          full_name: dto.full_name ?? u.full_name,
          role: dto.role ?? u.role,
          account_status: dto.account_status ?? u.account_status,
          updated_at: new Date().toISOString(),
        };
      }
      return u;
    });

    saveUsersToStorage(updatedList);

    // If updating current user, refresh state
    if (dto.id === user.id) {
      const refreshed = updatedList.find((u) => u.id === user.id);
      if (refreshed) {
        setUser(refreshed);
        setSessionCookie(refreshed);
      }
    }

    return { success: true };
  };

  // Deactivate account
  const deactivateAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Administrator privileges required.' };
    }

    if (userId === user.id) {
      return { success: false, error: 'Protection: You cannot deactivate your own active account.' };
    }

    return updateUser({ id: userId, account_status: 'inactive' });
  };

  // Activate account
  const activateAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Administrator privileges required.' };
    }

    return updateUser({ id: userId, account_status: 'active' });
  };

  // Reset user password
  const resetUserPassword = async (
    userId: string
  ): Promise<{ success: boolean; error?: string; resetLink?: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Administrator privileges required.' };
    }

    const targetUser = usersList.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Target employee not found.' };
    }

    // Generated simulated reset link
    const resetLink = `https://candela.internal/reset-password?token=sec_${Math.random()
      .toString(36)
      .slice(2)}&email=${encodeURIComponent(targetUser.email)}`;

    return {
      success: true,
      resetLink,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        usersList,
        createEmployeeAccount,
        updateUser,
        deactivateAccount,
        activateAccount,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
