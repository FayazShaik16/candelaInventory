'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/auth';
import { useInventory } from '@/context/InventoryContext';
import { StatusBadge } from '../inventory/shared/StatusBadge';
import { 
  X, 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Edit3, 
  Radio, 
  Monitor, 
  Smartphone, 
  Box, 
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ViewUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: UserProfile) => void;
}

export function ViewUserModal({
  user,
  isOpen,
  onClose,
  onEdit,
}: ViewUserModalProps) {
  const { getEmployeeEquipment } = useInventory();
  const [activeTab, setActiveTab] = useState<'info' | 'equipment' | 'history'>('equipment');

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'admin';
  const isActive = user.account_status === 'active';
  const empEquipment = getEmployeeEquipment(user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#173D30] text-white flex items-center justify-center font-bold text-sm border-2 border-[#247A51]">
              {user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#172A21]">{user.full_name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isAdmin ? 'bg-[#173D30] text-white' : 'bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]'
                  }`}
                >
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-mono">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5EBE6] bg-[#FFFFFF] text-xs flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'equipment'
                ? 'border-[#247A51] text-[#247A51] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#172A21]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Assigned Fleet ({empEquipment.totalActiveCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#247A51] text-[#247A51] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#172A21]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Custody History ({empEquipment.assignmentHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-[#247A51] text-[#247A51] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#172A21]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* TAB 1: CURRENTLY ASSIGNED EQUIPMENT */}
          {activeTab === 'equipment' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#E5EBE6]">
                <span className="text-[11px] text-[#64748B]">
                  Hardware actively assigned under <strong className="text-[#172A21]">{user.full_name}</strong>
                </span>
                <span className="text-[10px] font-mono font-bold text-[#247A51] bg-[#EBF4EF] px-2 py-0.5 rounded">
                  {empEquipment.totalActiveCount} Active Deployments
                </span>
              </div>

              {empEquipment.totalActiveCount === 0 ? (
                <div className="p-8 text-center bg-[#F9FAF9] rounded border border-[#E5EBE6] text-[#64748B]">
                  <Layers className="w-8 h-8 text-[#94A3B8] mx-auto mb-1.5" />
                  <p className="font-semibold text-xs text-[#172A21]">No equipment currently assigned</p>
                  <p className="text-[11px] text-[#94A3B8]">This employee does not currently hold custody of any hardware.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* LANforges */}
                  {empEquipment.activeLANforges.map((lf) => (
                    <div key={lf.id} className="p-3 rounded bg-white border border-[#E5EBE6] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#EBF4EF] text-[#247A51] flex items-center justify-center">
                          <Radio className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-[#172A21]">{lf.lanforgeId}</div>
                          <div className="text-[11px] text-[#64748B]">{lf.lanforgeModel} — Location: {lf.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={lf.status} size="sm" />
                        <span className="text-[10px] text-[#64748B] block mt-1">{lf.totalClients} Clients</span>
                      </div>
                    </div>
                  ))}

                  {/* Desktops */}
                  {empEquipment.activeDesktops.map((dt) => (
                    <div key={dt.id} className="p-3 rounded bg-white border border-[#E5EBE6] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center">
                          <Monitor className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-[#172A21]">{dt.deviceId}</div>
                          <div className="text-[11px] text-[#64748B]">{dt.deviceBrand} {dt.model}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={dt.status} size="sm" />
                        <span className="text-[10px] text-[#64748B] block mt-1">{dt.project}</span>
                      </div>
                    </div>
                  ))}

                  {/* Mobiles */}
                  {empEquipment.activeMobiles.map((mb) => (
                    <div key={mb.id} className="p-3 rounded bg-white border border-[#E5EBE6] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-[#172A21]">{mb.deviceId}</div>
                          <div className="text-[11px] text-[#64748B]">{mb.deviceBrand} {mb.model}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={mb.status} size="sm" />
                        <span className="text-[10px] text-[#64748B] block mt-1">{mb.project}</span>
                      </div>
                    </div>
                  ))}

                  {/* Chambers */}
                  {empEquipment.activeChambers.map((ch) => (
                    <div key={ch.id} className="p-3 rounded bg-white border border-[#E5EBE6] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                          <Box className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-[#172A21]">{ch.chamberId}</div>
                          <div className="text-[11px] text-[#64748B]">{ch.chamberType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={ch.status} size="sm" />
                        <span className="text-[10px] text-[#64748B] block mt-1">{ch.project}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTODY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-[11px] text-[#64748B] pb-1 border-b border-[#E5EBE6]">
                Chronological record of all equipment assigned to, returned by, or transferred from {user.full_name}.
              </div>

              {empEquipment.assignmentHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#F9FAF9] rounded border border-[#E5EBE6] text-[#64748B]">
                  <Clock className="w-8 h-8 text-[#94A3B8] mx-auto mb-1.5" />
                  <p className="font-semibold text-xs text-[#172A21]">No assignment history recorded</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5EBE6]">
                  {empEquipment.assignmentHistory.map((asgn) => {
                    const isCurrent = asgn.status === 'active';
                    const isTransferred = asgn.status === 'transferred';
                    return (
                      <div key={asgn.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#172A21]">{asgn.equipmentTag}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded capitalize bg-[#F5F7F5] border border-[#E5EBE6] text-[#64748B]">
                              {asgn.equipmentCategory}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              isCurrent
                                ? 'bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]'
                                : isTransferred
                                ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]'
                                : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                            }`}
                          >
                            {isCurrent ? '● Active' : isTransferred ? 'Transferred' : 'Returned'}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                          <span>Assigned: {new Date(asgn.assignedDate).toLocaleDateString()}</span>
                          {asgn.returnDate && <span>Closed: {new Date(asgn.returnDate).toLocaleDateString()}</span>}
                        </div>

                        {asgn.notes && (
                          <div className="text-[11px] text-[#64748B] bg-[#F9FAF9] p-1.5 rounded border border-[#E5EBE6]">
                            <span className="font-semibold text-[#172A21]">Notes:</span> {asgn.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT DETAILS */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">Assigned Role</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isAdmin ? 'bg-[#173D30] text-white' : 'bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isAdmin ? 'Administrator' : 'Employee'}</span>
                  </span>
                </div>

                <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">Account Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isActive ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]' : 'bg-[#F5F7F5] text-[#64748B] border border-[#E5EBE6]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#16A34A]' : 'bg-[#64748B]'}`} />
                    <span>{isActive ? 'Active Clearance' : 'Deactivated'}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#E5EBE6] pt-3">
                <div className="flex items-center justify-between py-1 text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Account Created:</span>
                  </span>
                  <span className="font-mono text-[#172A21]">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between py-1 text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Last Sign In:</span>
                  </span>
                  <span className="font-mono text-[#172A21]">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never recorded'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>User Identifier:</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#172A21] truncate max-w-[180px]">{user.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5EBE6] bg-[#F9FAF9] flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#247A51] bg-[#EBF4EF] hover:bg-[#D5E9DE] rounded border border-[#D5E9DE] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] bg-white border border-[#E5EBE6] rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
