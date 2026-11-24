'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronRight, 
  Plus,
  ShieldCheck,
  LogOut,
  User,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  ArrowLeft
} from 'lucide-react';
import { NavItemKey } from './AppSidebar';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  activeNav: NavItemKey;
  onOpenMobileSidebar: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  assistantOpen?: boolean;
  onToggleAssistant?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenAddUnit: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onNavigateHome?: () => void;
}

export function AppHeader({
  activeNav,
  onOpenMobileSidebar,
  onToggleSidebar,
  sidebarCollapsed = true,
  onOpenAddUnit,
  onBack,
  canGoBack = false,
  onNavigateHome,
}: AppHeaderProps) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'lanforges':
        return 'LANforges Testbeds';
      case 'attenuators':
        return 'RF Programmable Attenuators';
      case 'desktops':
        return 'Workstations & Desktops';
      case 'mobiles':
        return 'Real Client Devices Fleet';
      case 'chambers':
        return 'RF & Anechoic Chambers';
      case 'assignments':
        return 'Unit Assignments';
      case 'requests':
        return isAdmin ? 'Resource Requests Management' : 'My Resource Requests';
      case 'logs':
        return 'Activity & Transaction Logs';
      case 'users':
        return 'User Management';
      case 'settings':
        return 'System Settings';
      case 'profile':
        return 'Employee Profile';
      default:
        return 'Inventory Platform';
    }
  };

  const fullName = user?.full_name || 'Candela Employee';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#E5EBE6] px-4 flex items-center justify-between gap-3 flex-shrink-0 z-20">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 -ml-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded-md transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden lg:flex p-1.5 -ml-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded-md transition-colors"
            title={sidebarCollapsed ? 'Open Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5 text-[#247A51]" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-[#64748B]" />
            )}
          </button>
        )}

        {/* Page Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
              canGoBack
                ? 'text-[#172A21] bg-[#FFFFFF] hover:bg-[#F5F7F5] border-[#E5EBE6] hover:border-[#CBD5E1] cursor-pointer shadow-none'
                : 'text-[#94A3B8] bg-[#F8FAF9] border-[#E5EBE6] opacity-40 cursor-not-allowed'
            }`}
            title={canGoBack ? 'Go back to previous page' : 'Already on initial page'}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-sm text-[#1E293B]">
          {onNavigateHome ? (
            <button
              type="button"
              onClick={onNavigateHome}
              className="font-semibold text-[#0B1310] hidden sm:inline hover:text-[#247A51] transition-colors cursor-pointer text-left"
              title="Go to Operations Dashboard"
            >
              Candela Operations
            </button>
          ) : (
            <span className="font-semibold text-[#0B1310] hidden sm:inline">Candela Operations</span>
          )}
          <ChevronRight className="w-4 h-4 text-[#475569] hidden sm:inline" />
          <span className="font-bold text-[#0B1310] truncate">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Role & Profile menu */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button (Admin only) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAddUnit}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Unit</span>
          </button>
        )}

        {/* User Account Menu in Top Header */}
        <div className="relative border-l border-[#E5EBE6] pl-2 ml-1" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#F5F7F5] transition-colors focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-[#173D30] text-[#E5EDE8] flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="text-xs font-semibold text-[#172A21] truncate max-w-[120px]">
                {fullName}
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isAdmin ? 'bg-[#247A51]' : 'bg-[#0284C7]'
                  }`}
                />
                <span className={isAdmin ? 'text-[#247A51] font-medium' : 'text-[#0284C7] font-medium'}>
                  {isAdmin ? 'Admin' : 'Employee'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] hidden lg:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E5EBE6] rounded-md shadow-sm z-50 py-1.5 text-xs text-[#172A21]">
              <div className="px-3 py-2 border-b border-[#E5EBE6]">
                <div className="font-semibold text-[#172A21]">{fullName}</div>
                <div className="text-[11px] text-[#64748B] truncate">{user?.email}</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      isAdmin
                        ? 'bg-[#EBF4EF] text-[#247A51]'
                        : 'bg-[#F0F9FF] text-[#0284C7]'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isAdmin ? 'Admin Role' : 'Employee Role'}</span>
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    alert(`Signed in as: ${fullName}\nEmail: ${user?.email}\nRole: ${user?.role}\nStatus: Active`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#F5F7F5] text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>My Account</span>
                </button>
              </div>

              <div className="border-t border-[#E5EBE6] pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setProfileOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[#DC2626] hover:bg-[#FEF2F2] text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
