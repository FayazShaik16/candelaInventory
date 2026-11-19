'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-[#DC2626] hover:bg-[#B91C1C] text-white';
      case 'warning':
        return 'bg-[#D97706] hover:bg-[#B45309] text-white';
      default:
        return 'bg-[#247A51] hover:bg-[#1D6342] text-white';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-[#DC2626]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#D97706]" />;
      default:
        return <Info className="w-5 h-5 text-[#247A51]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-lg p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F5F7F5] border border-[#E5EBE6] flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#172A21]">{title}</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE6]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded bg-white hover:bg-[#F5F7F5]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors ${getButtonStyles()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
