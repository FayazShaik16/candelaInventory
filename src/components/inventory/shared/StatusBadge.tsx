'use client';

import React from 'react';
import { GlobalInventoryStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: GlobalInventoryStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'sm', showLabel = false }: StatusBadgeProps) {
  const config = (() => {
    switch (status) {
      case 'Available':
        return {
          dot: 'bg-[#16A34A]',
          ring: 'ring-[#DCFCE7]',
          pill: 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]',
          label: 'Available',
        };
      case 'In-Use':
        return {
          dot: 'bg-[#0284C7]',
          ring: 'ring-[#E0F2FE]',
          pill: 'bg-[#F0F9FF] text-[#0284C7] border-[#E0F2FE]',
          label: 'In-Use',
        };
      case 'Under Maintenance':
        return {
          dot: 'bg-[#DC2626]',
          ring: 'ring-[#FEE2E2]',
          pill: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]',
          label: 'Under Maintenance',
        };
      default:
        return {
          dot: 'bg-[#64748B]',
          ring: 'ring-[#E5EBE6]',
          pill: 'bg-[#F5F7F5] text-[#64748B] border-[#E5EBE6]',
          label: status,
        };
    }
  })();

  if (!showLabel) {
    return (
      <span
        title={config.label}
        aria-label={config.label}
        className="inline-flex items-center justify-center"
      >
        <span
          className={`inline-block rounded-full ${config.dot} ring-4 ${config.ring} ${
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
          }`}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.pill} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function StatusLegend() {
  return (
    <div className="px-4 py-2 bg-[#F9FAF9] border-b border-[#E5EBE6] flex flex-wrap items-center justify-end gap-4 text-[11px] font-medium text-[#64748B]">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8]">Status Legend:</span>
      <span className="inline-flex items-center gap-1.5 text-[#172A21]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-[#DCFCE7]" />
        <span>Available</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-[#172A21]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] ring-2 ring-[#E0F2FE]" />
        <span>In-Use</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-[#172A21]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] ring-2 ring-[#FEE2E2]" />
        <span>Under Maintenance</span>
      </span>
    </div>
  );
}
