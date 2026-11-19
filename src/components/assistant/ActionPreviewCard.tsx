'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Cpu, 
  UserCheck, 
  Radio, 
  Clock 
} from 'lucide-react';
import { AIAssistantMessage } from '@/types/inventory';

interface ActionPreviewCardProps {
  action: NonNullable<AIAssistantMessage['actionPreview']>;
  onConfirm?: () => void;
  onCancel?: () => void;
  onViewUnit?: (tag: string) => void;
}

export function ActionPreviewCard({
  action,
  onConfirm,
  onCancel,
  onViewUnit,
}: ActionPreviewCardProps) {
  const isApplied = action.status === 'applied';
  const isCancelled = action.status === 'cancelled';
  const isPending = action.status === 'pending';

  return (
    <div className="mt-2.5 rounded-lg border border-[#E5EBE6] bg-[#FFFFFF] overflow-hidden text-xs shadow-none">
      {/* Header */}
      <div className="px-3 py-2 bg-[#F9FAF9] border-b border-[#E5EBE6] flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded bg-[#EBF4EF] text-[#247A51] flex items-center justify-center flex-shrink-0">
            {action.type === 'assignment' ? (
              <UserCheck className="w-2.5 h-2.5" />
            ) : (
              <Radio className="w-2.5 h-2.5" />
            )}
          </div>
          <span className="font-semibold text-[#172A21] truncate">{action.title}</span>
        </div>

        {/* Status Tag */}
        {isApplied && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Applied
          </span>
        )}
        {isCancelled && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
            <XCircle className="w-2.5 h-2.5" />
            Declined
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
            <Clock className="w-2.5 h-2.5" />
            Awaiting Confirmation
          </span>
        )}
      </div>

      {/* Target Unit Banner */}
      <div className="px-3 py-1.5 bg-[#F5F7F5] border-b border-[#E5EBE6] flex items-center justify-between text-[11px]">
        <span className="text-[#64748B]">Target Hardware:</span>
        <button
          type="button"
          onClick={() => onViewUnit?.(action.unitAssetTag)}
          className="font-mono font-semibold text-[#247A51] hover:underline"
        >
          {action.unitAssetTag} ({action.model})
        </button>
      </div>

      {/* Changes list */}
      <div className="p-3 space-y-2">
        {action.changes.map((ch, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-[11px] gap-2 py-1 border-b border-[#F5F7F5] last:border-none"
          >
            <span className="text-[#64748B] font-medium">{ch.field}</span>
            <div className="flex items-center gap-1.5 font-mono text-right truncate">
              {ch.from && (
                <>
                  <span className="text-[#94A3B8] line-through truncate max-w-[90px]">
                    {ch.from}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#CBD5E1] flex-shrink-0" />
                </>
              )}
              <span className="text-[#172A21] font-semibold text-[#247A51] truncate max-w-[120px]">
                {ch.to}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions (if pending) */}
      {isPending && (
        <div className="px-3 py-2 bg-[#F9FAF9] border-t border-[#E5EBE6] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 text-[11px] text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded bg-white hover:bg-[#F5F7F5]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
          >
            Confirm & Execute
          </button>
        </div>
      )}
    </div>
  );
}
