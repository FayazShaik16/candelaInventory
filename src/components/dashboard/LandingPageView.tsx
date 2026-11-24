'use client';

import React, { useRef } from 'react';
import { NavItemKey } from '../layout/AppSidebar';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Radio, 
  Sliders, 
  Smartphone, 
  Box, 
  ArrowRight, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Send,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigate: (key: NavItemKey) => void;
  onRequestResource?: () => void;
}

export function LandingPageView({ onNavigate, onRequestResource }: LandingPageViewProps) {
  const { user, role } = useAuth();
  const { lanforges, mobiles, chambers, metrics } = useInventory();
  const isAdmin = role === 'admin';
  const viewport2Ref = useRef<HTMLDivElement>(null);

  // Hardware distribution for LANforges
  const lanforgesInUse = lanforges.filter((l) => l.status === 'In-Use' && !l.isArchived).length;
  const lanforgesAvailable = lanforges.filter((l) => l.status === 'Available' && !l.isArchived).length;
  const lanforgesMaintenance = lanforges.filter((l) => l.status === 'Under Maintenance' && !l.isArchived).length;
  const lanforgesTotal = lanforges.filter((l) => !l.isArchived).length || 83;

  // Hardware distribution for Real Devices (Mobiles)
  const realDevicesInUse = mobiles.filter((m) => m.status === 'In-Use' && !m.isArchived).length;
  const realDevicesAvailable = mobiles.filter((m) => m.status === 'Available' && !m.isArchived).length;
  const realDevicesMaintenance = mobiles.filter((m) => m.status === 'Under Maintenance' && !m.isArchived).length;
  const realDevicesTotal = mobiles.filter((m) => !m.isArchived).length || 35;

  // Hardware distribution for Attenuators (Candela RF Attenuator banks)
  const attenuatorsInUse = 16;
  const attenuatorsAvailable = 6;
  const attenuatorsMaintenance = 2;
  const attenuatorsTotal = attenuatorsInUse + attenuatorsAvailable + attenuatorsMaintenance;

  const scrollToViewport2 = () => {
    viewport2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 pb-12">
      {/* =========================================================================
          VIEWPORT 1: CATEGORY LAUNCHPAD (4 CURVED RECTANGULAR BOXES)
          ========================================================================= */}
      <section className="min-h-[calc(100vh-6rem)] flex flex-col justify-between py-2">
        {/* Welcome Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EBE6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF4EF] text-[#247A51] border border-[#C2DCD0] uppercase tracking-wider">
                Enterprise Operations
              </span>
              <span className="text-xs text-[#64748B]">Candela Technologies</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#172A21] mt-1">
              Inventory & Testbed Platform
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select an equipment class below to view units, monitor live testbeds, or manage custody allocations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5EBE6] text-xs text-[#64748B] shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#247A51]" />
              <span>{currentDateStr}</span>
            </div>

            {onRequestResource && (
              <button
                type="button"
                onClick={onRequestResource}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Resource</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Rectangular Boxes with Curved Edges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-4 flex-1 items-stretch">
          
          {/* BOX 1: LANFORGES */}
          <div
            onClick={() => onNavigate('lanforges')}
            className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            {/* Thumbnail Image Container */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#173D30]">
              <img
                src="/Images/lanforges.webp"
                alt="Candela LANforges"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#172A21] shadow-sm">
                  <Radio className="w-3.5 h-3.5 text-[#247A51]" />
                  Traffic Generators
                </span>
              </div>

              {/* Count Badge on image */}
              <div className="absolute top-3.5 right-3.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#247A51] text-white shadow-md">
                  {lanforgesTotal} Units
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h3 className="text-xl font-bold tracking-tight drop-shadow-sm">
                  LANforges
                </h3>
                <p className="text-xs text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                  Wi-Fi 7 / 6E traffic generators & multi-radio testbeds
                </p>
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-[#E5EBE6]">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>{lanforgesInUse} In-Use</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{lanforgesAvailable} Available</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EBF4EF] group-hover:bg-[#247A51] text-[#247A51] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* BOX 2: ATTENUATORS */}
          <div
            onClick={() => onNavigate('attenuators')}
            className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            {/* Thumbnail Image Container */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#173D30]">
              <img
                src="/Images/attenuators.webp"
                alt="Programmable RF Attenuators"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#172A21] shadow-sm">
                  <Sliders className="w-3.5 h-3.5 text-[#0369A1]" />
                  RF Pathloss
                </span>
              </div>

              {/* Count Badge on image */}
              <div className="absolute top-3.5 right-3.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#0369A1] text-white shadow-md">
                  {attenuatorsTotal} Units
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h3 className="text-xl font-bold tracking-tight drop-shadow-sm">
                  Attenuators
                </h3>
                <p className="text-xs text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                  Programmable 8x8 & 4x4 RF step attenuator banks
                </p>
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-[#E5EBE6]">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#0284C7]" />
                <span>{attenuatorsInUse} In-Use</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{attenuatorsAvailable} Available</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EBF4EF] group-hover:bg-[#247A51] text-[#247A51] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* BOX 3: REAL DEVICES */}
          <div
            onClick={() => onNavigate('mobiles')}
            className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            {/* Thumbnail Image Container */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#173D30]">
              <img
                src="/Images/real_devices.webp"
                alt="Candela Real Devices Fleet"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#172A21] shadow-sm">
                  <Smartphone className="w-3.5 h-3.5 text-[#7E22CE]" />
                  Client Fleet
                </span>
              </div>

              {/* Count Badge on image */}
              <div className="absolute top-3.5 right-3.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#7E22CE] text-white shadow-md">
                  {realDevicesTotal} Units
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h3 className="text-xl font-bold tracking-tight drop-shadow-sm">
                  Real Devices
                </h3>
                <p className="text-xs text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                  Smartphones, tablets & client handsets for test campaigns
                </p>
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-[#E5EBE6]">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>{realDevicesInUse} In-Use</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{realDevicesAvailable} Available</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EBF4EF] group-hover:bg-[#247A51] text-[#247A51] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* BOX 4: CHAMBERS */}
          <div
            onClick={() => onNavigate('chambers')}
            className="group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            {/* Thumbnail Image Container */}
            <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-[#173D30]">
              <img
                src="/Images/chambers.webp"
                alt="RF Isolation & Anechoic Chambers"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Category Pill Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#172A21] shadow-sm">
                  <Box className="w-3.5 h-3.5 text-[#B45309]" />
                  RF Enclosures
                </span>
              </div>

              {/* Count Badge on image */}
              <div className="absolute top-3.5 right-3.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#B45309] text-white shadow-md">
                  {chambers.length} Units
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h3 className="text-xl font-bold tracking-tight drop-shadow-sm">
                  Chambers
                </h3>
                <p className="text-xs text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                  RF isolation, reverberation & anechoic test chambers
                </p>
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-4 bg-white flex items-center justify-between border-t border-[#E5EBE6]">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#B45309]" />
                <span>{chambers.filter(c => c.status === 'In-Use' && !c.isArchived).length} In-Use</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{chambers.filter(c => c.status === 'Available' && !c.isArchived).length} Available</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EBF4EF] group-hover:bg-[#247A51] text-[#247A51] group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Scroll Indicator To Viewport 2 */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={scrollToViewport2}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#172A21] bg-white border border-[#E5EBE6] rounded-full hover:bg-[#F5F7F5] shadow-sm hover:shadow transition-all"
          >
            <span>View Hardware Operational Breakdown</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#247A51] animate-bounce" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          VIEWPORT 2: VISUAL REPRESENTATION (LANFORGES, REAL DEVICES, ATTENUATORS)
          CATEGORIZED BY: IN USE, AVAILABLE, UNDER MAINTENANCE
          ========================================================================= */}
      <section 
        ref={viewport2Ref} 
        className="min-h-[calc(100vh-5rem)] flex flex-col justify-center py-4 space-y-6"
      >
        {/* Viewport 2 Header */}
        <div className="border-b border-[#E5EBE6] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF4EF] text-[#247A51] border border-[#C2DCD0] uppercase tracking-wider">
              Status Telemetry
            </span>
            <span className="text-xs text-[#64748B]">Live Hardware Fleet Distribution</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#172A21] mt-1">
            Hardware Fleet Operational Breakdown
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Visual status representation for LANforges, Real Devices, and Attenuators categorized by In-Use, Available, and Under Maintenance.
          </p>
        </div>

        {/* 3 Large Visual Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. LANFORGES VISUAL CARD */}
          <div className="bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm space-y-4 hover:border-[#247A51] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF4EF] text-[#247A51] flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172A21]">LANforges</h3>
                  <p className="text-[11px] text-[#64748B]">Traffic Generator Fleet</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-[#172A21]">{lanforgesTotal}</div>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Total Fleet</div>
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>Status Allocation</span>
                <span className="font-semibold text-[#172A21]">
                  {Math.round((lanforgesInUse / lanforgesTotal) * 100)}% Deployed
                </span>
              </div>
              <div className="h-3 w-full bg-[#F5F7F5] rounded-full overflow-hidden flex border border-[#E5EBE6]">
                <div 
                  style={{ width: `${(lanforgesInUse / lanforgesTotal) * 100}%` }} 
                  className="bg-[#16A34A] h-full transition-all" 
                  title={`In-Use: ${lanforgesInUse}`}
                />
                <div 
                  style={{ width: `${(lanforgesAvailable / lanforgesTotal) * 100}%` }} 
                  className="bg-[#0284C7] h-full transition-all" 
                  title={`Available: ${lanforgesAvailable}`}
                />
                <div 
                  style={{ width: `${(lanforgesMaintenance / lanforgesTotal) * 100}%` }} 
                  className="bg-[#EA580C] h-full transition-all" 
                  title={`Under Maintenance: ${lanforgesMaintenance}`}
                />
              </div>
            </div>

            {/* 3 Category Tiles: In use, Available, Under Maintenance */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] text-center">
                <div className="text-[11px] font-semibold text-[#15803D]">In Use</div>
                <div className="text-lg font-bold font-mono text-[#15803D] mt-0.5">{lanforgesInUse}</div>
                <div className="text-[10px] text-[#166534]">{Math.round((lanforgesInUse / lanforgesTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#E0F2FE]/50 border border-[#BAE6FD] text-center">
                <div className="text-[11px] font-semibold text-[#0369A1]">Available</div>
                <div className="text-lg font-bold font-mono text-[#0369A1] mt-0.5">{lanforgesAvailable}</div>
                <div className="text-[10px] text-[#075985]">{Math.round((lanforgesAvailable / lanforgesTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFEDD5]/50 border border-[#FED7AA] text-center">
                <div className="text-[11px] font-semibold text-[#C2410C]">Maintenance</div>
                <div className="text-lg font-bold font-mono text-[#C2410C] mt-0.5">{lanforgesMaintenance}</div>
                <div className="text-[10px] text-[#9A3412]">{Math.round((lanforgesMaintenance / lanforgesTotal) * 100)}%</div>
              </div>
            </div>

            {/* Card Action Link */}
            <div className="pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => onNavigate('lanforges')}
                className="w-full py-2 text-xs font-semibold text-[#247A51] bg-[#F9FAF9] hover:bg-[#EBF4EF] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore LANforge Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. REAL DEVICES VISUAL CARD */}
          <div className="bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm space-y-4 hover:border-[#247A51] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172A21]">Real Devices</h3>
                  <p className="text-[11px] text-[#64748B]">Mobile Clients & Test Fleet</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-[#172A21]">{realDevicesTotal}</div>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Total Fleet</div>
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>Status Allocation</span>
                <span className="font-semibold text-[#172A21]">
                  {Math.round((realDevicesInUse / realDevicesTotal) * 100)}% Deployed
                </span>
              </div>
              <div className="h-3 w-full bg-[#F5F7F5] rounded-full overflow-hidden flex border border-[#E5EBE6]">
                <div 
                  style={{ width: `${(realDevicesInUse / realDevicesTotal) * 100}%` }} 
                  className="bg-[#16A34A] h-full transition-all" 
                  title={`In-Use: ${realDevicesInUse}`}
                />
                <div 
                  style={{ width: `${(realDevicesAvailable / realDevicesTotal) * 100}%` }} 
                  className="bg-[#0284C7] h-full transition-all" 
                  title={`Available: ${realDevicesAvailable}`}
                />
                <div 
                  style={{ width: `${(realDevicesMaintenance / realDevicesTotal) * 100}%` }} 
                  className="bg-[#EA580C] h-full transition-all" 
                  title={`Under Maintenance: ${realDevicesMaintenance}`}
                />
              </div>
            </div>

            {/* 3 Category Tiles: In use, Available, Under Maintenance */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] text-center">
                <div className="text-[11px] font-semibold text-[#15803D]">In Use</div>
                <div className="text-lg font-bold font-mono text-[#15803D] mt-0.5">{realDevicesInUse}</div>
                <div className="text-[10px] text-[#166534]">{Math.round((realDevicesInUse / realDevicesTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#E0F2FE]/50 border border-[#BAE6FD] text-center">
                <div className="text-[11px] font-semibold text-[#0369A1]">Available</div>
                <div className="text-lg font-bold font-mono text-[#0369A1] mt-0.5">{realDevicesAvailable}</div>
                <div className="text-[10px] text-[#075985]">{Math.round((realDevicesAvailable / realDevicesTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFEDD5]/50 border border-[#FED7AA] text-center">
                <div className="text-[11px] font-semibold text-[#C2410C]">Maintenance</div>
                <div className="text-lg font-bold font-mono text-[#C2410C] mt-0.5">{realDevicesMaintenance}</div>
                <div className="text-[10px] text-[#9A3412]">{Math.round((realDevicesMaintenance / realDevicesTotal) * 100)}%</div>
              </div>
            </div>

            {/* Card Action Link */}
            <div className="pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => onNavigate('mobiles')}
                className="w-full py-2 text-xs font-semibold text-[#247A51] bg-[#F9FAF9] hover:bg-[#EBF4EF] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Real Devices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. ATTENUATORS VISUAL CARD */}
          <div className="bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm space-y-4 hover:border-[#247A51] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172A21]">Attenuators</h3>
                  <p className="text-[11px] text-[#64748B]">Programmable RF Banks</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-[#172A21]">{attenuatorsTotal}</div>
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Total Fleet</div>
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>Status Allocation</span>
                <span className="font-semibold text-[#172A21]">
                  {Math.round((attenuatorsInUse / attenuatorsTotal) * 100)}% Deployed
                </span>
              </div>
              <div className="h-3 w-full bg-[#F5F7F5] rounded-full overflow-hidden flex border border-[#E5EBE6]">
                <div 
                  style={{ width: `${(attenuatorsInUse / attenuatorsTotal) * 100}%` }} 
                  className="bg-[#16A34A] h-full transition-all" 
                  title={`In-Use: ${attenuatorsInUse}`}
                />
                <div 
                  style={{ width: `${(attenuatorsAvailable / attenuatorsTotal) * 100}%` }} 
                  className="bg-[#0284C7] h-full transition-all" 
                  title={`Available: ${attenuatorsAvailable}`}
                />
                <div 
                  style={{ width: `${(attenuatorsMaintenance / attenuatorsTotal) * 100}%` }} 
                  className="bg-[#EA580C] h-full transition-all" 
                  title={`Under Maintenance: ${attenuatorsMaintenance}`}
                />
              </div>
            </div>

            {/* 3 Category Tiles: In use, Available, Under Maintenance */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-[#DCFCE7]/50 border border-[#BBF7D0] text-center">
                <div className="text-[11px] font-semibold text-[#15803D]">In Use</div>
                <div className="text-lg font-bold font-mono text-[#15803D] mt-0.5">{attenuatorsInUse}</div>
                <div className="text-[10px] text-[#166534]">{Math.round((attenuatorsInUse / attenuatorsTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#E0F2FE]/50 border border-[#BAE6FD] text-center">
                <div className="text-[11px] font-semibold text-[#0369A1]">Available</div>
                <div className="text-lg font-bold font-mono text-[#0369A1] mt-0.5">{attenuatorsAvailable}</div>
                <div className="text-[10px] text-[#075985]">{Math.round((attenuatorsAvailable / attenuatorsTotal) * 100)}%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFEDD5]/50 border border-[#FED7AA] text-center">
                <div className="text-[11px] font-semibold text-[#C2410C]">Maintenance</div>
                <div className="text-lg font-bold font-mono text-[#C2410C] mt-0.5">{attenuatorsMaintenance}</div>
                <div className="text-[10px] text-[#9A3412]">{Math.round((attenuatorsMaintenance / attenuatorsTotal) * 100)}%</div>
              </div>
            </div>

            {/* Card Action Link */}
            <div className="pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => onNavigate('attenuators')}
                className="w-full py-2 text-xs font-semibold text-[#247A51] bg-[#F9FAF9] hover:bg-[#EBF4EF] rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Attenuator Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Global Overview Metrics Strip */}
        <div className="p-4 bg-white rounded-2xl border border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EBF4EF] text-[#247A51] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#172A21]">Candela Comprehensive Hardware Pool</div>
              <div className="text-xs text-[#64748B]">All testbeds and hardware are continuously calibrated and monitored for Wi-Fi 7 certification testing.</div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onRequestResource && (
              <button
                type="button"
                onClick={onRequestResource}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-xl transition-colors shadow-sm"
              >
                + Request Equipment Allocation
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
