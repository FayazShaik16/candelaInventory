'use client';

import React from 'react';
import { GlobalInventoryStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: GlobalInventoryStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  switch (status) {
    case 'Available':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Available
        </span>
      );
    case 'In-Use':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE] ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
          In-Use
        </span>
      );
    case 'Under Maintenance':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7] ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          Under Maintenance
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F7F5] text-[#64748B] border border-[#E5EBE6]">
          {status}
        </span>
      );
  }
}
