import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { DropdownProvider } from '@/context/DropdownContext';

export const metadata: Metadata = {
  title: 'Candela | Inventory Operations Platform',
  description: 'Enterprise hardware allocation, unit tracking, and AI-assisted inventory management for Candela Technologies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#F5F7F5] text-[#172A21] overflow-hidden antialiased">
        <AuthProvider>
          <InventoryProvider>
            <DropdownProvider>
              {children}
            </DropdownProvider>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
