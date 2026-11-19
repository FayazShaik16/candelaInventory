'use client';

import React, { useState } from 'react';
import { MobileItem } from '@/types/inventory';
import { StatusBadge } from '../shared/StatusBadge';
import { useInventory } from '@/context/InventoryContext';
import { 
  X, 
  Smartphone, 
  User, 
  Calendar, 
  Edit3, 
  Archive,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

interface MobileDetailPanelProps {
  item: MobileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: MobileItem) => void;
  onArchive: (item: MobileItem) => void;
  isAdmin: boolean;
}

export function MobileDetailPanel({
  item,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  isAdmin,
}: MobileDetailPanelProps) {
  const { getEquipmentHistory } = useInventory();
  const [activeTab, setActiveTab] = useState<'specs' | 'history'>('specs');

  if (!isOpen || !item) return null;

  const historyData = getEquipmentHistory('mobile', item.id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-none" onClick={onClose} />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#FFFFFF] border-l border-[#E5EBE6] shadow-xl flex flex-col text-xs animate-in slide-in-from-right duration-200">
        <div className="h-14 px-5 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#247A51] text-white flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#172A21]">{item.deviceId}</span>
                <StatusBadge status={item.status} size="sm" />
              </div>
              <p className="text-[11px] text-[#64748B]">{item.deviceBrand} {item.model}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] hover:text-[#172A21] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5EBE6] bg-[#FFFFFF] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
              activeTab === 'specs'
                ? 'border-[#247A51] text-[#247A51] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#172A21]'
            }`}
          >
            Device Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'history'
                ? 'border-[#247A51] text-[#247A51] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#172A21]'
            }`}
          >
            <span>Custody History</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F5F7F5] border border-[#E5EBE6]">
              {historyData.assignments.length}
            </span>
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {activeTab === 'specs' ? (
            <>
              <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg space-y-2">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Assigned Project</span>
                  <p className="font-semibold text-[#172A21] text-xs mt-0.5">{item.project}</p>
                </div>
                <div className="pt-2 border-t border-[#E5EBE6] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#247A51]" />
                    <span>Point of Contact:</span>
                  </span>
                  <span className="font-semibold text-[#172A21]">{item.pocName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-white border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Brand</span>
                  <span className="font-bold text-[#172A21] mt-0.5 block">{item.deviceBrand}</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Model</span>
                  <span className="font-bold text-[#172A21] mt-0.5 block truncate">{item.model}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[#94A3B8] flex items-center justify-between border-t border-[#E5EBE6]">
                <span>System S.No: {item.sNo}</span>
                <span>Registered: {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] text-[#64748B]">
                Custody history and roaming allocations for {item.deviceId}.
              </div>

              {historyData.assignments.length === 0 ? (
                <div className="p-6 bg-[#F9FAF9] rounded border border-[#E5EBE6] text-center text-[#64748B]">
                  <Clock className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
                  <p className="font-semibold text-xs text-[#172A21]">No assignment history</p>
                  <p className="text-[11px] text-[#94A3B8]">Unit has not been assigned to an engineer yet.</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EBE6]">
                  {historyData.assignments.map((asgn) => {
                    const isCurrent = asgn.status === 'active';
                    const isTransferred = asgn.status === 'transferred';
                    return (
                      <div key={asgn.id} className="relative space-y-1">
                        <div
                          className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                            isCurrent
                              ? 'border-[#16A34A] ring-2 ring-[#DCFCE7]'
                              : isTransferred
                              ? 'border-[#3B82F6]'
                              : 'border-[#94A3B8]'
                          }`}
                        />
                        <div className="p-3 rounded bg-white border border-[#E5EBE6] space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                                isCurrent
                                  ? 'bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]'
                                  : isTransferred
                                  ? 'bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]'
                                  : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                              }`}
                            >
                              {isCurrent ? '● Active Custody' : isTransferred ? 'Transferred' : 'Returned'}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {new Date(asgn.assignedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="font-semibold text-[#172A21] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#247A51]" />
                            <span>{asgn.employeeName}</span>
                          </div>
                          {asgn.notes && (
                            <div className="text-[11px] text-[#64748B] bg-[#F9FAF9] p-2 rounded border border-[#E5EBE6]">
                              <span className="font-semibold text-[#172A21]">Notes:</span> {asgn.notes}
                            </div>
                          )}
                          <div className="text-[10px] text-[#94A3B8] pt-1 border-t border-[#E5EBE6] flex items-center justify-between">
                            <span>Assigned by: {asgn.assignedBy}</span>
                            <span>Project: {asgn.project || item.project}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="p-3 border-t border-[#E5EBE6] bg-[#F9FAF9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onArchive(item)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded border border-[#FEE2E2]"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
