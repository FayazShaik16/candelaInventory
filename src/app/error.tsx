'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error in production
    console.error('Application runtime exception caught by boundary:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7F5] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl p-8 max-w-md w-full shadow-none text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-base font-bold text-[#172A21]">
            Temporary Operation Interruption
          </h1>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            The platform encountered an unexpected runtime condition. Hardware assets and database records remain safe and synchronized.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-[#94A3B8] mt-2">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#172A21] bg-[#FFFFFF] hover:bg-[#F9FAF9] border border-[#E5EBE6] rounded transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
