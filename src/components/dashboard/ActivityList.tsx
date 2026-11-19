'use client';

import React from 'react';
import { ActivityLog } from '@/types/inventory';
import { 
  UserCheck, 
  RefreshCw, 
  AlertTriangle, 
  Sliders, 
  PlusCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface ActivityListProps {
  activities: ActivityLog[];
  onSelectUnit?: (assetTag: string) => void;
}

export function ActivityList({ activities, onSelectUnit }: ActivityListProps) {
  const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'assigned':
        return <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" />;
      case 'status_change':
        return <RefreshCw className="w-3.5 h-3.5 text-[#247A51]" />;
      case 'maintenance':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'config_updated':
        return <Sliders className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'added':
        return <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'assigned':
        return { label: 'Assigned', color: 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]' };
      case 'status_change':
        return { label: 'Status Change', color: 'bg-[#EBF4EF] text-[#247A51] border-[#D5E9DE]' };
      case 'maintenance':
        return { label: 'Diagnostic', color: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]' };
      case 'config_updated':
        return { label: 'Config Shift', color: 'bg-[#F0F9FF] text-[#0284C7] border-[#E0F2FE]' };
      case 'added':
        return { label: 'Registered', color: 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]' };
      default:
        return { label: 'Log', color: 'bg-[#F5F7F5] text-[#64748B] border-[#E5EBE6]' };
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg">
      <div className="px-4 py-3 border-b border-[#E5EBE6] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-[#172A21] tracking-tight">Recent Operations Log</h3>
          <p className="text-[11px] text-[#64748B]">Real-time operational audit trail across laboratory bays</p>
        </div>
        <span className="text-[10px] font-mono font-medium text-[#247A51] bg-[#EBF4EF] px-2 py-0.5 rounded border border-[#D5E9DE]">
          Live Stream
        </span>
      </div>

      <div className="divide-y divide-[#E5EBE6]">
        {activities.slice(0, 5).map((log) => {
          const badge = getActionBadge(log.action);
          return (
            <div
              key={log.id}
              className="p-3.5 hover:bg-[#F9FAF9] transition-colors flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-md bg-[#F5F7F5] border border-[#E5EBE6] flex items-center justify-center flex-shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-[#172A21]">
                    {log.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectUnit?.(log.unitAssetTag)}
                    className="text-[11px] font-mono font-medium text-[#247A51] hover:underline flex items-center gap-0.5"
                  >
                    <span>{log.unitAssetTag}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                  {log.description}
                </p>

                <div className="mt-1 flex items-center gap-3 text-[10px] text-[#94A3B8]">
                  <span>By {log.user.name} ({log.user.role})</span>
                  <span>•</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
