import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#F5F7F5] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl p-8 max-w-md w-full shadow-none text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#EBF4EF] border border-[#D5E9DE] text-[#247A51] mx-auto flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold text-[#247A51] uppercase tracking-wider">
            HTTP 404 — Record Not Found
          </span>
          <h1 className="text-base font-bold text-[#172A21] mt-1">
            Resource or Route Not Located
          </h1>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            The requested inventory view or asset identifier does not exist or has been relocated within the facility database.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inventory Operations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
