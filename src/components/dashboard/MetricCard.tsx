'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  subValue?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  };
  onClick?: () => void;
  isActive?: boolean;
}

export function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  onClick,
  isActive = false,
}: MetricCardProps) {
  const getBadgeClasses = (variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info') => {
    switch (variant) {
      case 'success':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
      case 'warning':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
      case 'danger':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]';
      case 'info':
        return 'bg-[#EBF4EF] text-[#247A51] border-[#D5E9DE]';
      default:
        return 'bg-[#F5F7F5] text-[#64748B] border-[#E5EBE6]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-lg bg-[#FFFFFF] border transition-all text-left ${
        isActive
          ? 'border-[#247A51] ring-1 ring-[#247A51]'
          : 'border-[#E5EBE6] hover:border-[#CBD5E1]'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#64748B] truncate">{label}</span>
        <div className="w-7 h-7 rounded-md bg-[#F5F7F5] border border-[#E5EBE6] flex items-center justify-center flex-shrink-0 text-[#247A51]">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#172A21]">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getBadgeClasses(
              badge.variant
            )}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subValue && (
        <div className="mt-1 text-[11px] text-[#64748B] truncate">
          {subValue}
        </div>
      )}
    </div>
  );
}
