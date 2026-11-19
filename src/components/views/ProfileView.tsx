'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { StatusBadge } from '../inventory/shared/StatusBadge';
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
  Layers 
} from 'lucide-react';

export function ProfileView() {
  const { user, role } = useAuth();
  const { getEmployeeEquipment } = useInventory();
  const isAdmin = role === 'admin';

  if (!user) return null;

  const empEquipment = getEmployeeEquipment(user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-[#E5EBE6]">
        <h1 className="text-xl font-bold tracking-tight text-[#172A21]">Employee Profile & Hardware Custody</h1>
        <p className="text-xs text-[#64748B]">Personal clearance, assigned laboratory assets, and custody history.</p>
      </div>

      {/* User Card */}
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#173D30] text-white flex items-center justify-center font-bold text-lg border-2 border-[#247A51]">
            {user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-md">
            <span className="text-[11px] text-[#64748B] block mb-1">Corporate Identity</span>
            <div className="font-semibold text-[#172A21]">{user.full_name}</div>
            <div className="text-[11px] text-[#64748B]">{user.email}</div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-md">
            <span className="text-[11px] text-[#64748B] block mb-1">Access Privileges</span>
            <div className="font-semibold text-[#172A21]">
              {isAdmin ? 'Full Inventory & User Management' : 'Inventory Viewing & Lab Custody'}
            </div>
            <div className="text-[11px] text-[#64748B]">Enforced via Supabase RLS</div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-md">
            <span className="text-[11px] text-[#64748B] block mb-1">Account Creation Date</span>
            <div className="font-mono text-[#172A21]">{new Date(user.created_at).toLocaleDateString()}</div>
          </div>

          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-md">
            <span className="text-[11px] text-[#64748B] block mb-1">Last Sign-In Timestamp</span>
            <div className="font-mono text-[#172A21]">
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Current Session Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Currently Assigned Hardware */}
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21]">Your Active Hardware Fleet</h2>
            <p className="text-xs text-[#64748B]">Candela laboratory assets currently checked out under your custody.</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#247A51] bg-[#EBF4EF] px-2.5 py-1 rounded border border-[#D5E9DE]">
            {empEquipment.totalActiveCount} Active Units
          </span>
        </div>

        {empEquipment.totalActiveCount === 0 ? (
          <div className="p-6 text-center bg-[#F9FAF9] rounded border border-[#E5EBE6] text-[#64748B]">
            <Layers className="w-8 h-8 text-[#94A3B8] mx-auto mb-1.5" />
            <p className="font-semibold text-xs text-[#172A21]">No active hardware currently assigned</p>
            <p className="text-[11px] text-[#94A3B8]">Contact an administrator to allocate a LANforge testbed or workstation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {empEquipment.activeLANforges.map((lf) => (
              <div key={lf.id} className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#EBF4EF] text-[#247A51] flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-[#172A21] block">{lf.lanforgeId}</span>
                    <span className="text-[11px] text-[#64748B]">{lf.lanforgeModel} ({lf.location})</span>
                  </div>
                </div>
                <StatusBadge status={lf.status} size="sm" />
              </div>
            ))}

            {empEquipment.activeDesktops.map((dt) => (
              <div key={dt.id} className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-[#172A21] block">{dt.deviceId}</span>
                    <span className="text-[11px] text-[#64748B]">{dt.deviceBrand} {dt.model}</span>
                  </div>
                </div>
                <StatusBadge status={dt.status} size="sm" />
              </div>
            ))}

            {empEquipment.activeMobiles.map((mb) => (
              <div key={mb.id} className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-[#172A21] block">{mb.deviceId}</span>
                    <span className="text-[11px] text-[#64748B]">{mb.deviceBrand} {mb.model}</span>
                  </div>
                </div>
                <StatusBadge status={mb.status} size="sm" />
              </div>
            ))}

            {empEquipment.activeChambers.map((ch) => (
              <div key={ch.id} className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-[#172A21] block">{ch.chamberId}</span>
                    <span className="text-[11px] text-[#64748B]">{ch.chamberType}</span>
                  </div>
                </div>
                <StatusBadge status={ch.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Custody Usage */}
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-5 space-y-4">
        <div className="pb-2 border-b border-[#E5EBE6]">
          <h2 className="text-sm font-bold text-[#172A21]">Your Historical Equipment Usage</h2>
          <p className="text-xs text-[#64748B]">Complete audit trail of past hardware allocations, returns, and transfers.</p>
        </div>

        {empEquipment.assignmentHistory.length === 0 ? (
          <p className="text-xs text-[#94A3B8] italic py-2">No historical equipment usage recorded.</p>
        ) : (
          <div className="divide-y divide-[#E5EBE6] text-xs">
            {empEquipment.assignmentHistory.map((asgn) => (
              <div key={asgn.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#172A21]">{asgn.equipmentTag}</span>
                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.2 bg-[#F5F7F5] rounded border border-[#E5EBE6] text-[#64748B]">
                      {asgn.equipmentCategory}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Assigned: {new Date(asgn.assignedDate).toLocaleDateString()}
                    {asgn.returnDate && ` • Closed: ${new Date(asgn.returnDate).toLocaleDateString()}`}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  asgn.status === 'active'
                    ? 'bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]'
                    : asgn.status === 'transferred'
                    ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]'
                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                }`}>
                  {asgn.status === 'active' ? '● Active' : asgn.status === 'transferred' ? 'Transferred' : 'Returned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
