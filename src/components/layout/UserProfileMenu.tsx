'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  ChevronUp, 
  HelpCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { NavItemKey } from './AppSidebar';

interface UserProfileMenuProps {
  collapsed?: boolean;
  onSelectNav?: (key: NavItemKey) => void;
}

export function UserProfileMenu({ collapsed = false, onSelectNav }: UserProfileMenuProps) {
  const { user, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = user?.full_name || 'Candela Employee';
  const email = user?.email || 'user@candelatech.com';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isAdmin = role === 'admin';

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#1E4637] transition-colors text-left focus:outline-none focus:ring-1 focus:ring-[#247A51] ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${fullName} (${isAdmin ? 'Admin' : 'Employee'})`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-[#28513F] border border-[#356750] flex items-center justify-center text-xs font-semibold text-[#E5EDE8]">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#16A34A] border-2 border-[#173D30] rounded-full" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#E5EDE8] truncate">
                {fullName}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8EA79B] truncate">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-[#247A51]' : 'bg-[#0284C7]'}`} />
                <span>{isAdmin ? 'Administrator' : 'Employee'}</span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronUp
            className={`w-4 h-4 text-[#8EA79B] flex-shrink-0 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mb-2 w-56 rounded-md bg-[#FFFFFF] border border-[#E5EBE6] shadow-sm py-1.5 text-[#172A21] ${
            collapsed ? 'left-14 bottom-0' : 'left-0 bottom-full'
          }`}
        >
          <div className="px-3 py-2 border-b border-[#E5EBE6]">
            <p className="text-xs font-semibold text-[#172A21]">{fullName}</p>
            <p className="text-[11px] text-[#64748B] truncate">{email}</p>
            <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded w-fit ${
              isAdmin
                ? 'text-[#247A51] bg-[#EBF4EF]'
                : 'text-[#0284C7] bg-[#F0F9FF]'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              <span>{isAdmin ? 'Admin Clearance' : 'Employee Access'}</span>
            </div>
          </div>

          <div className="py-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSelectNav) {
                  onSelectNav('settings');
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#F5F7F5] text-[#172A21] transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-[#64748B]" />
              <span>{isAdmin ? 'System Settings' : 'User Settings'}</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onSelectNav) {
                    onSelectNav('users');
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#F5F7F5] text-[#172A21] transition-colors text-left"
              >
                <Shield className="w-4 h-4 text-[#64748B]" />
                <span>Manage Users</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#F5F7F5] text-[#172A21] transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-[#64748B]" />
              <span>Documentation & Support</span>
            </button>
          </div>

          <div className="border-t border-[#E5EBE6] pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-[#DC2626]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
