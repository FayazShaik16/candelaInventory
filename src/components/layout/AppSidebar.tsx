'use client';

import React from 'react';
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
  PanelLeftClose, 
  PanelLeft, 
  CheckCircle2, 
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

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 overflow-y-auto sidebar-scroll space-y-1">
          {/* Overview */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#28513F] text-[#FFFFFF] font-semibold shadow-sm'
                    : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#A3BFB2]'}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </button>
            );
          })}

          {/* Dedicated Inventory Categories */}
          <div className="pt-4 px-2 pb-1.5 text-[11px] font-bold text-[#A3BFB2] uppercase tracking-wider">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#28513F] text-[#FFFFFF] font-semibold shadow-sm'
                    : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#A3BFB2]'}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive ? 'bg-[#1E4637] text-white' : 'bg-[#1F4738] text-[#C2D6CC]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Operations & System */}
          <div className="pt-4 px-2 pb-1.5 text-[11px] font-bold text-[#A3BFB2] uppercase tracking-wider">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#28513F] text-[#FFFFFF] font-semibold shadow-sm'
                      : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFFFFF]' : 'text-[#A3BFB2]'}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-[#1E4637] text-[#C2D6CC] border border-[#28513F]">
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-left ${
                activeNav === 'settings'
                  ? 'bg-[#28513F] text-[#FFFFFF] font-semibold shadow-sm'
                  : 'text-[#E5EDE8] hover:bg-[#1E4637] hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className={`w-4 h-4 flex-shrink-0 ${activeNav === 'settings' ? 'text-white' : 'text-[#A3BFB2]'}`} />
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
