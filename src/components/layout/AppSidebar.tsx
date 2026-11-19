'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  Monitor, 
  Smartphone, 
  Box, 
  UserCheck, 
  History, 
  Users, 
  Settings, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeft, 
  CheckCircle2, 
  Boxes,
  User
} from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';

export type NavItemKey = 
  | 'dashboard' 
  | 'lanforges' 
  | 'desktops' 
  | 'mobiles' 
  | 'chambers' 
  | 'assignments' 
  | 'activity' 
  | 'users' 
  | 'settings' 
  | 'profile';

interface AppSidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const { role } = useAuth();
  const { metrics } = useInventory();
  const isAdmin = role === 'admin';

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('Inventory Operations');

  const mainNavItems = [
    {
      key: 'dashboard' as NavItemKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
  ];

  const categoryNavItems = [
    {
      key: 'lanforges' as NavItemKey,
      label: 'LANforges',
      icon: Radio,
      badge: String(metrics.totalLANforges),
    },
    {
      key: 'desktops' as NavItemKey,
      label: 'Desktops',
      icon: Monitor,
      badge: String(metrics.totalDesktops),
    },
    {
      key: 'mobiles' as NavItemKey,
      label: 'Mobiles',
      icon: Smartphone,
      badge: String(metrics.totalMobiles),
    },
    {
      key: 'chambers' as NavItemKey,
      label: 'Chambers',
      icon: Box,
      badge: String(metrics.totalChambers),
    },
  ];

  const operationsNavItems = [
    {
      key: 'assignments' as NavItemKey,
      label: 'Assignments',
      icon: UserCheck,
      badge: null,
    },
    {
      key: 'activity' as NavItemKey,
      label: 'Activity History',
      icon: History,
      badge: null,
    },
    {
      key: 'users' as NavItemKey,
      label: 'Users',
      icon: Users,
      badge: 'Admin',
      adminOnly: true,
    },
    {
      key: 'profile' as NavItemKey,
      label: 'My Profile',
      icon: User,
      badge: null,
      employeeOnly: true,
    },
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectNav(key);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-none lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#173D30] border-r border-[#1E4637] transition-all duration-200 select-none ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E4637] flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-[#247A51] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs tracking-wider border border-[#356750]">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#E5EDE8] tracking-tight leading-none">
                  CANDELA
                </div>
                <div className="text-[10px] text-[#8EA79B] font-mono tracking-wider uppercase mt-0.5">
                  Tech Platform
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded bg-[#247A51] flex items-center justify-center text-white font-bold text-xs border border-[#356750]">
                <Radio className="w-4 h-4" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded text-[#8EA79B] hover:text-[#E5EDE8] hover:bg-[#1E4637] transition-colors ${
              collapsed ? 'absolute -right-3.5 top-3.5 bg-[#173D30] border border-[#1E4637] rounded-full shadow-sm text-xs w-7 h-7 z-50' : ''
            }`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Selector */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#1F4738]/50 hover:bg-[#1F4738] border border-[#28513F] text-left transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Boxes className="w-3.5 h-3.5 text-[#247A51] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#E5EDE8] truncate">
                    {selectedWorkspace}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8EA79B] transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
              </button>

              {workspaceOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#173D30] border border-[#28513F] rounded shadow-lg py-1 text-xs">
                  {['Inventory Operations', 'Lab Allocation & QA', 'RF Chamber Assets', 'Global Hardware Registry'].map((ws) => (
                    <button
                      key={ws}
                      type="button"
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setWorkspaceOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#1E4637] ${
                        selectedWorkspace === ws ? 'text-white font-medium bg-[#28513F]' : 'text-[#8EA79B]'
                      }`}
                    >
                      <span>{ws}</span>
                      {selectedWorkspace === ws && <CheckCircle2 className="w-3 h-3 text-[#247A51]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-2.5 py-2 overflow-y-auto sidebar-scroll space-y-1">
          {/* Overview */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#28513F] text-[#FFFFFF] font-semibold'
                    : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#8EA79B]'}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </button>
            );
          })}

          {/* Dedicated Inventory Categories */}
          <div className="pt-3 px-2 pb-1 text-[10px] font-semibold text-[#8EA79B] uppercase tracking-wider">
            {!collapsed ? 'Inventory Categories' : '•••'}
          </div>

          {categoryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#28513F] text-[#FFFFFF] font-semibold'
                    : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#8EA79B]'}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-[#1E4637] text-white' : 'bg-[#1F4738]/60 text-[#8EA79B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Operations & System */}
          <div className="pt-3 px-2 pb-1 text-[10px] font-semibold text-[#8EA79B] uppercase tracking-wider">
            {!collapsed ? 'Operations' : '•••'}
          </div>

          {operationsNavItems
            .filter((item) => {
              if (item.adminOnly && !isAdmin) return false;
              if (item.employeeOnly && isAdmin) return false;
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#28513F] text-[#FFFFFF] font-semibold'
                      : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#8EA79B]'}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#1E4637] text-[#8EA79B] border border-[#28513F]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                activeNav === 'settings'
                  ? 'bg-[#28513F] text-[#FFFFFF] font-semibold'
                  : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className={`w-4 h-4 flex-shrink-0 ${activeNav === 'settings' ? 'text-white' : 'text-[#8EA79B]'}`} />
              {!collapsed && <span className="flex-1 truncate">Settings</span>}
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="p-2.5 border-t border-[#1E4637] flex-shrink-0">
          <UserProfileMenu collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
