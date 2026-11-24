import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { DropdownProvider } from '@/context/DropdownContext';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

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
      <body className={`h-full bg-[#F5F7F5] text-[#0F172A] overflow-hidden antialiased ${outfit.className} ${outfit.variable}`}>
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
