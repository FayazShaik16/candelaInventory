import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#F5F7F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-[#247A51] animate-spin" />
        <span className="text-xs font-medium text-[#64748B] tracking-wide">
          Synchronizing Candela Hardware Database...
        </span>
      </div>
    </div>
  );
}
