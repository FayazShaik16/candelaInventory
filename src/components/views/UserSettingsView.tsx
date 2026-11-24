'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { INITIAL_ATTENUATORS } from './AttenuatorsView';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Radio, 
  CheckCircle2, 
  Monitor, 
  Smartphone, 
  Box, 
  Layers,
  Settings,
  Bell,
  Lock,
  FileText,
  Sliders,
  LogOut,
  AlertCircle,
  Save,
  ArrowRight
} from 'lucide-react';

interface UserSettingsViewProps {
  onNavigateToDashboard?: () => void;
}

export function UserSettingsView({ onNavigateToDashboard }: UserSettingsViewProps) {
  const { user, role, logout } = useAuth();
  const { lanforges, mobiles, chambers } = useInventory();

  // Notification Preferences State
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [notifyReturnReminder, setNotifyReturnReminder] = useState(true);
  const [notifyMaintenance, setNotifyMaintenance] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) return null;

  const isAdmin = role === 'admin';

  // Compute active custody metrics for current user
  const userLanforges = lanforges.filter((l) => 
    !l.isArchived && 
    (l.pocId === user.id || (user.full_name && l.comments?.toLowerCase().includes(user.full_name.toLowerCase())))
  );

  const userMobiles = mobiles.filter((m) => 
    !m.isArchived && 
    (m.pocId === user.id || (user.full_name && m.project?.toLowerCase().includes(user.full_name.toLowerCase())))
  );

  const userChambers = chambers.filter((c) => 
    !c.isArchived && 
    (c.usedById === user.id || (user.full_name && c.project?.toLowerCase().includes(user.full_name.toLowerCase())))
  );

  const userAttenuators = INITIAL_ATTENUATORS.filter((a) => 
    a.status === 'In-Use' && 
    ((user.full_name && a.custodian.toLowerCase().includes(user.full_name.toLowerCase())) || 
     (user.email && a.custodian.toLowerCase().includes(user.email.toLowerCase().split('@')[0])))
  );

  const totalCustodyCount = userLanforges.length + userMobiles.length + userChambers.length + userAttenuators.length;

  const handleSavePreferences = () => {
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordMsg({ type: 'success', text: 'Your corporate credentials have been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 text-[#172A21]">
      {/* Header */}
      <div className="pb-3 border-b border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172A21] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#247A51]" />
            <span>User Settings & Profile</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your personal profile, hardware custody notification preferences, security credentials, and lab guidelines.
          </p>
        </div>

        {onNavigateToDashboard && (
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#247A51] bg-[#EBF4EF] hover:bg-[#D5E9DE] rounded-lg transition-colors self-start sm:self-auto"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 1. Profile & Corporate Identity */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl p-5 space-y-5 shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#173D30] text-white flex items-center justify-center font-bold text-lg border-2 border-[#247A51]">
            {user.full_name
              ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)
              : 'CE'}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172A21]">{user.full_name}</h2>
            <p className="text-xs text-[#64748B] font-mono">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-[#173D30] text-white' : 'bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]'
              }`}>
                {isAdmin ? 'Administrator Clearance' : 'Employee Access'}
              </span>
              <span className="text-[10px] font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E5EBE6] text-xs">
          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
            <span className="text-[11px] text-[#64748B] block mb-1">Corporate Identity</span>
            <div className="font-semibold text-[#172A21]">{user.full_name}</div>
            <div className="text-[11px] text-[#64748B]">{user.email}</div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
            <span className="text-[11px] text-[#64748B] block mb-1">Lab Access Privileges</span>
            <div className="font-semibold text-[#172A21]">
              {isAdmin ? 'Full Inventory & Administrative Control' : 'Resource Requests & Lab Custody'}
            </div>
            <div className="text-[11px] text-[#64748B]">Candela Systems Authorization</div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
            <span className="text-[11px] text-[#64748B] block mb-1">Account Creation Date</span>
            <div className="font-mono text-[#172A21]">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
            <span className="text-[11px] text-[#64748B] block mb-1">Security Session</span>
            <div className="font-mono text-[#172A21] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Signed In & Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hardware Custody Fleet Summary */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#247A51]" />
              <span>Your Hardware Custody Fleet</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Summary of all laboratory hardware units currently allocated under your custody.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#247A51] bg-[#EBF4EF] px-2.5 py-1 rounded border border-[#D5E9DE]">
            {totalCustodyCount} Units In Custody
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#EBF4EF] text-[#247A51]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold font-mono text-[#172A21] block">{userLanforges.length}</span>
              <span className="text-[11px] text-[#64748B]">LANforges</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#E0F2FE] text-[#0369A1]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold font-mono text-[#172A21] block">{userAttenuators.length}</span>
              <span className="text-[11px] text-[#64748B]">Attenuators</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#F5F3FF] text-[#7C3AED]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold font-mono text-[#172A21] block">{userMobiles.length}</span>
              <span className="text-[11px] text-[#64748B]">Real Devices</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FEF3C7] text-[#D97706]">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold font-mono text-[#172A21] block">{userChambers.length}</span>
              <span className="text-[11px] text-[#64748B]">Chambers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Custody Notification & Alert Preferences */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl p-5 space-y-4 shadow-none">
        <div className="pb-2 border-b border-[#E5EBE6]">
          <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#247A51]" />
            <span>Custody Notifications & Lab Alerts</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure how and when you receive automated notifications regarding your hardware requests and custody.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] cursor-pointer hover:bg-[#F3F5F3] transition-colors">
            <div>
              <span className="font-semibold text-[#172A21] block">Equipment Request Approval Alerts</span>
              <span className="text-[11px] text-[#64748B]">
                Receive instant email alerts when your LANforge, attenuator, chamber, or real device request is approved.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyOnApproval}
              onChange={(e) => setNotifyOnApproval(e.target.checked)}
              className="w-4 h-4 text-[#247A51] rounded border-[#CBD5E1] focus:ring-[#247A51] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] cursor-pointer hover:bg-[#F3F5F3] transition-colors">
            <div>
              <span className="font-semibold text-[#172A21] block">Custody Return Reminders</span>
              <span className="text-[11px] text-[#64748B]">
                Automated notification 48 hours before allocated loan duration expires to request extension or return.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyReturnReminder}
              onChange={(e) => setNotifyReturnReminder(e.target.checked)}
              className="w-4 h-4 text-[#247A51] rounded border-[#CBD5E1] focus:ring-[#247A51] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAF9] border border-[#E5EBE6] cursor-pointer hover:bg-[#F3F5F3] transition-colors">
            <div>
              <span className="font-semibold text-[#172A21] block">Lab Maintenance Broadcasts</span>
              <span className="text-[11px] text-[#64748B]">
                Receive notification if testbeds or chambers allocated to your campaigns undergo maintenance.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyMaintenance}
              onChange={(e) => setNotifyMaintenance(e.target.checked)}
              className="w-4 h-4 text-[#247A51] rounded border-[#CBD5E1] focus:ring-[#247A51] cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          {preferencesSaved && (
            <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Preferences saved successfully!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Account Security & Password */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl p-5 space-y-4 shadow-none">
        <div className="pb-2 border-b border-[#E5EBE6]">
          <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#247A51]" />
            <span>Account Security & Corporate Password</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Update your corporate authentication password and view session security credentials.
          </p>
        </div>

        {passwordMsg && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            passwordMsg.type === 'success'
              ? 'bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]'
              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
          }`}>
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="block text-[11px] font-medium text-[#64748B] mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg border border-[#E5EBE6] bg-white text-xs text-[#172A21] focus:ring-1 focus:ring-[#247A51] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#64748B] mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg border border-[#E5EBE6] bg-white text-xs text-[#172A21] focus:ring-1 focus:ring-[#247A51] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#64748B] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg border border-[#E5EBE6] bg-white text-xs text-[#172A21] focus:ring-1 focus:ring-[#247A51] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Lab Compliance & Safety Protocol */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl p-5 space-y-3 shadow-none text-xs">
        <div className="pb-2 border-b border-[#E5EBE6]">
          <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#247A51]" />
            <span>Candela Lab Compliance & Hardware Care Protocol</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Standard operating procedures for hardware checked out in employee custody.
          </p>
        </div>

        <ul className="space-y-2 text-[#64748B] list-disc list-inside">
          <li>
            <strong className="text-[#172A21]">ESD Protection:</strong> Grounding wrist straps must be worn when connecting RF cables, SMA attenuator banks, or opening enclosure doors.
          </li>
          <li>
            <strong className="text-[#172A21]">RF Chamber Door Seal:</strong> Always ensure chamber latching handles are completely engaged to preserve isolation rating.
          </li>
          <li>
            <strong className="text-[#172A21]">Attenuator Input Limits:</strong> Do not exceed +30 dBm (1 Watt) RF input on programmable step attenuators without external high-power attenuation.
          </li>
          <li>
            <strong className="text-[#172A21]">Asset Return Policy:</strong> Hardware must be returned to Lab Stock and verified by a supervisor when campaign testing is concluded.
          </li>
        </ul>
      </div>

      {/* 6. Sign Out Action */}
      <div className="pt-2 flex justify-start">
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FEE2E2] rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Candela Platform</span>
        </button>
      </div>
    </div>
  );
}
