'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  PanelRight, 
  PanelRightClose,
  Menu, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus,
  Sparkles,
  ShieldCheck,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { NavItemKey } from './AppSidebar';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  activeNav: NavItemKey;
  onOpenMobileSidebar: () => void;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddUnit: () => void;
}

export function AppHeader({
  activeNav,
  onOpenMobileSidebar,
  assistantOpen,
  onToggleAssistant,
  searchQuery,
  onSearchChange,
  onOpenAddUnit,
}: AppHeaderProps) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
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
      case 'desktops':
        return 'Workstations & Desktops';
      case 'mobiles':
        return 'Mobile Client Fleet';
      case 'chambers':
        return 'RF & Anechoic Chambers';
      case 'assignments':
        return 'Unit Assignments';
      case 'activity':
        return 'Activity & Audit Log';
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

  const notifications = [
    {
      id: 1,
      title: 'Calibration Warning',
      description: 'Candela RF-ATT-8x8 (CAN-ATT-0019) calibration due in 2 days.',
      time: '15m ago',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Unit Assigned',
      description: 'LANforge CT521B assigned to Fayaz Ahmed.',
      time: '1h ago',
      type: 'success',
    },
    {
      id: 3,
      title: 'Firmware Ready',
      description: 'v5.5.0-beta2 build verified for CT523c series.',
      time: '3h ago',
      type: 'info',
    },
  ];

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

        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span className="font-medium text-[#172A21] hidden sm:inline">Candela Operations</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:inline" />
          <span className="font-semibold text-[#172A21] truncate">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Global search asset tag, serial, model, location..."
            className="w-full h-8 pl-8 pr-12 text-xs bg-[#F5F7F5] hover:bg-[#F0F2F0] focus:bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-md text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#E5EBE6] text-[10px] font-mono text-[#64748B]">
            <span>Ctrl</span>
            <span>K</span>
          </div>
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

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded-md text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] border border-[#E5EBE6] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D97706]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md shadow-sm z-50 py-2">
              <div className="px-3 pb-2 border-b border-[#E5EBE6] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#172A21]">Activity Notifications</span>
                <span className="text-[10px] bg-[#EBF4EF] text-[#247A51] font-medium px-1.5 py-0.5 rounded">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-[#E5EBE6] max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#F5F7F5] transition-colors text-left cursor-pointer">
                    <div className="flex items-start gap-2">
                      {n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#247A51] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#172A21]">{n.title}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{n.description}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 px-3 border-t border-[#E5EBE6] text-center">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-[#247A51] hover:underline font-medium"
                >
                  Mark all as reviewed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Assistant Toggle Button */}
        <button
          type="button"
          onClick={onToggleAssistant}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            assistantOpen
              ? 'bg-[#EBF4EF] text-[#247A51] border-[#247A51]/30'
              : 'bg-[#FFFFFF] text-[#64748B] border-[#E5EBE6] hover:bg-[#F5F7F5] hover:text-[#172A21]'
          }`}
          title={assistantOpen ? 'Collapse Assistant' : 'Open Assistant'}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#247A51]" />
          <span className="hidden sm:inline">Assistant</span>
          {assistantOpen ? (
            <PanelRightClose className="w-3.5 h-3.5 hidden md:inline ml-0.5 text-[#247A51]" />
          ) : (
            <PanelRight className="w-3.5 h-3.5 hidden md:inline ml-0.5 text-[#64748B]" />
          )}
        </button>

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
