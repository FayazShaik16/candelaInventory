'use client';

import React, { useState } from 'react';
import { LANforgeItem } from '@/types/inventory';
import { StatusBadge } from '../shared/StatusBadge';
import { useInventory } from '@/context/InventoryContext';
import { 
  X, 
  Radio, 
  User, 
  MapPin, 
  Network, 
  Cpu, 
  History, 
  Clock, 
  Edit3, 
  Archive,
  Layers,
  FileText,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LANforgeDetailPanelProps {
  item: LANforgeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: LANforgeItem) => void;
  onArchive: (item: LANforgeItem) => void;
  isAdmin: boolean;
}

export function LANforgeDetailPanel({
  item,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  isAdmin,
}: LANforgeDetailPanelProps) {
  const { getEquipmentHistory } = useInventory();
  const [activeTab, setActiveTab] = useState<'specs' | 'history'>('specs');

  if (!isOpen || !item) return null;

  const historyData = getEquipmentHistory('lanforge', item.id);

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-none transition-opacity" 
        onClick={onClose} 
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#FFFFFF] border-l border-[#E5EBE6] shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-14 px-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#247A51] text-white flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold font-mono text-[#172A21]">{item.lanforgeId}</h2>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-[11px] text-[#64748B]">{item.lanforgeModel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#172A21] hover:bg-[#E5EBE6] rounded transition-colors"
          >
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
            Hardware Specs
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {activeTab === 'specs' ? (
            <>
              {/* Location & Network */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                    Facility Location
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#172A21]">
                    <MapPin className="w-3.5 h-3.5 text-[#247A51]" />
                    <span>{item.location} Lab</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                    Testbed IPv4 Address
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-medium text-[#172A21]">
                    <Network className="w-3.5 h-3.5 text-[#247A51]" />
                    <span>{item.testbedIp && item.testbedIp !== '0.0.0.0' ? item.testbedIp : 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Custody & Project */}
              <div className="p-3 bg-white border border-[#E5EBE6] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                    Current Point of Contact / Custodian
                  </span>
                  <span className="text-[10px] font-semibold text-[#247A51] bg-[#EBF4EF] px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#173D30] text-white flex items-center justify-center font-bold text-[10px]">
                    {(item.pocName || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[#172A21]">{item.pocName || 'Unassigned'}</div>
                    <div className="text-[11px] text-[#64748B]">Project: {item.project}</div>
                  </div>
                </div>
              </div>

              {/* Ethernet & Client Capacity Breakdown */}
              <div className="p-3 bg-white border border-[#E5EBE6] rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#247A51]" />
                    <span>Simulated Client Fleet</span>
                  </span>
                  <span className="font-mono font-bold text-[#247A51] bg-[#EBF4EF] px-2 py-0.5 rounded text-[11px]">
                    {item.totalClients} Total
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 bg-[#F9FAF9] rounded border border-[#E5EBE6]">
                    <span className="text-[10px] text-[#64748B] block font-mono">11be</span>
                    <span className="text-xs font-bold text-[#172A21]">{item.noOf11beClients}</span>
                  </div>
                  <div className="p-2 bg-[#F9FAF9] rounded border border-[#E5EBE6]">
                    <span className="text-[10px] text-[#64748B] block font-mono">11ax</span>
                    <span className="text-xs font-bold text-[#172A21]">{item.noOf11axClients}</span>
                  </div>
                  <div className="p-2 bg-[#F9FAF9] rounded border border-[#E5EBE6]">
                    <span className="text-[10px] text-[#64748B] block font-mono">11ac</span>
                    <span className="text-xs font-bold text-[#172A21]">{item.noOf11acClients}</span>
                  </div>
                  <div className="p-2 bg-[#F9FAF9] rounded border border-[#E5EBE6]">
                    <span className="text-[10px] text-[#64748B] block font-mono">11n</span>
                    <span className="text-xs font-bold text-[#172A21]">{item.noOf11nClients}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] flex items-center justify-between pt-1 border-t border-[#E5EBE6]">
                  <span>Max Port Ethernet Rate:</span>
                  <span className="font-semibold text-[#172A21]">{item.maxEthernetSpeed}</span>
                </div>
              </div>

              {/* Repeatable Installed Radios */}
              <div className="p-3 bg-white border border-[#E5EBE6] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#247A51]" />
                    <span>Installed Radios</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#247A51] bg-[#EBF4EF] px-1.5 rounded">
                    {item.radios.reduce((acc, r) => acc + r.quantity, 0)} Total Interfaces
                  </span>
                </div>

                {item.radios.length === 0 ? (
                  <p className="text-[11px] text-[#94A3B8] italic">No active radio hardware.</p>
                ) : (
                  <div className="divide-y divide-[#E5EBE6]">
                    {item.radios.map((rad, idx) => (
                      <div key={rad.id || idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-medium text-[#172A21]">{rad.chipset}</span>
                        <span className="font-mono text-[#64748B] bg-[#F5F7F5] px-1.5 py-0.5 rounded">
                          Qty: {rad.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previously Used By */}
              <div className="p-3 bg-white border border-[#E5EBE6] rounded-lg space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider flex items-center gap-1">
                  <History className="w-3 h-3 text-[#247A51]" />
                  <span>Previously Used By</span>
                </span>
                {item.previouslyUsedBy && item.previouslyUsedBy.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.previouslyUsedBy.map((name, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 rounded bg-[#F5F7F5] border border-[#E5EBE6] text-[11px] text-[#172A21]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#94A3B8] italic pt-1">
                    No previous custodians recorded in historical assignment log.
                  </p>
                )}
              </div>

              {/* Comments */}
              {item.comments && (
                <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                    Engineering Comments
                  </span>
                  <p className="text-[11px] text-[#172A21] leading-relaxed">{item.comments}</p>
                </div>
              )}
            </>
          ) : (
            /* Tab: CHRONOLOGICAL CUSTODY HISTORY (Newest First) */
            <div className="space-y-3">
              <div className="text-[11px] text-[#64748B]">
                Complete audit trail of equipment allocations, returns, and transfers for {item.lanforgeId}.
              </div>

              {historyData.assignments.length === 0 ? (
                <div className="p-6 bg-[#F9FAF9] rounded border border-[#E5EBE6] text-center text-[#64748B]">
                  <Clock className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
                  <p className="font-semibold text-xs text-[#172A21]">No assignment history recorded</p>
                  <p className="text-[11px] text-[#94A3B8]">Unit has not been assigned to an engineer yet.</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EBE6]">
                  {historyData.assignments.map((asgn) => {
                    const isCurrent = asgn.status === 'active';
                    const isTransferred = asgn.status === 'transferred';
                    return (
                      <div key={asgn.id} className="relative space-y-1">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                            isCurrent
                              ? 'border-[#16A34A] ring-2 ring-[#DCFCE7]'
                              : isTransferred
                              ? 'border-[#3B82F6]'
                              : 'border-[#94A3B8]'
                          }`}
                        />

                        <div className="p-3 rounded bg-white border border-[#E5EBE6] space-y-1.5">
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

                          {asgn.returnDate && (
                            <div className="text-[11px] text-[#64748B]">
                              Closed: {new Date(asgn.returnDate).toLocaleDateString()} {asgn.returnedBy ? `(by ${asgn.returnedBy})` : ''}
                            </div>
                          )}

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

        {/* Footer Actions */}
        {isAdmin && (
          <div className="p-3 border-t border-[#E5EBE6] bg-[#F9FAF9] flex items-center justify-between flex-shrink-0">
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
              <span>Edit Record</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
