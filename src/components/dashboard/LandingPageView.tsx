'use client';

import React, { useRef, useState, useMemo } from 'react';
import { NavItemKey } from '../layout/AppSidebar';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_ATTENUATORS } from '@/components/views/AttenuatorsView';
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
  Activity,
  BarChart3,
  PieChart,
  LayoutGrid,
  Info
} from 'lucide-react';

interface LandingPageViewProps {
  onNavigate: (key: NavItemKey) => void;
  onRequestResource?: () => void;
}

type ChartViewMode = 'combined' | 'bars' | 'donuts';
type StatusFilter = 'all' | 'In-Use' | 'Available' | 'Under Maintenance';

export function LandingPageView({ onNavigate, onRequestResource }: LandingPageViewProps) {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const { lanforges, mobiles, chambers } = useInventory();
  const viewport2Ref = useRef<HTMLDivElement>(null);

  // Active chart controls
  const [chartView, setChartView] = useState<ChartViewMode>('combined');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [hoveredBar, setHoveredBar] = useState<{
    group: string;
    status: 'In-Use' | 'Available' | 'Under Maintenance';
    count: number;
    total: number;
    color: string;
  } | null>(null);

  // =========================================================================
  // HARDWARE TELEMETRY DATA (LANforges, Real Devices, Attenuators)
  // =========================================================================

  // 1. LANforges Distribution
  const lanforgesInUse = lanforges.filter((l) => l.status === 'In-Use' && !l.isArchived).length;
  const lanforgesAvailable = lanforges.filter((l) => l.status === 'Available' && !l.isArchived).length;
  const lanforgesMaintenance = lanforges.filter((l) => l.status === 'Under Maintenance' && !l.isArchived).length;
  const lanforgesTotal = lanforges.filter((l) => !l.isArchived).length || 83;

  // 2. Real Devices Distribution (Mobiles Fleet)
  const realDevicesInUse = mobiles.filter((m) => m.status === 'In-Use' && !m.isArchived).length;
  const realDevicesAvailable = mobiles.filter((m) => m.status === 'Available' && !m.isArchived).length;
  const realDevicesMaintenance = mobiles.filter((m) => m.status === 'Under Maintenance' && !m.isArchived).length;
  const realDevicesTotal = mobiles.filter((m) => !m.isArchived).length || 35;

  // 3. Attenuators Distribution (Candela Programmable RF Banks)
  const attenuatorsInUse = INITIAL_ATTENUATORS.filter((a) => a.status === 'In-Use').length;
  const attenuatorsAvailable = INITIAL_ATTENUATORS.filter((a) => a.status === 'Available').length;
  const attenuatorsMaintenance = INITIAL_ATTENUATORS.filter((a) => a.status === 'Under Maintenance').length;
  const attenuatorsTotal = INITIAL_ATTENUATORS.length;

  // Aggregate totals across the 3 requested categories
  const grandTotal = lanforgesTotal + realDevicesTotal + attenuatorsTotal;
  const grandInUse = lanforgesInUse + realDevicesInUse + attenuatorsInUse;
  const grandAvailable = lanforgesAvailable + realDevicesAvailable + attenuatorsAvailable;
  const grandMaintenance = lanforgesMaintenance + realDevicesMaintenance + attenuatorsMaintenance;
  const overallUtilizationPct = grandTotal > 0 ? Math.round((grandInUse / grandTotal) * 100) : 0;

  const scrollToViewport2 = () => {
    viewport2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Data bundle for grouped bar chart
  const fleetData = useMemo(() => [
    {
      id: 'lanforges',
      label: 'LANforges',
      subtitle: 'Traffic Generators',
      icon: Radio,
      navKey: 'lanforges' as NavItemKey,
      inUse: lanforgesInUse,
      available: lanforgesAvailable,
      maintenance: lanforgesMaintenance,
      total: lanforgesTotal,
      utilization: Math.round((lanforgesInUse / lanforgesTotal) * 100)
    },
    {
      id: 'real_devices',
      label: 'Real Devices',
      subtitle: 'Mobile Clients',
      icon: Smartphone,
      navKey: 'mobiles' as NavItemKey,
      inUse: realDevicesInUse,
      available: realDevicesAvailable,
      maintenance: realDevicesMaintenance,
      total: realDevicesTotal,
      utilization: Math.round((realDevicesInUse / realDevicesTotal) * 100)
    },
    {
      id: 'attenuators',
      label: 'Attenuators',
      subtitle: 'RF Matrix Banks',
      icon: Sliders,
      navKey: 'attenuators' as NavItemKey,
      inUse: attenuatorsInUse,
      available: attenuatorsAvailable,
      maintenance: attenuatorsMaintenance,
      total: attenuatorsTotal,
      utilization: Math.round((attenuatorsInUse / attenuatorsTotal) * 100)
    }
  ], [
    lanforgesInUse, lanforgesAvailable, lanforgesMaintenance, lanforgesTotal,
    realDevicesInUse, realDevicesAvailable, realDevicesMaintenance, realDevicesTotal,
    attenuatorsInUse, attenuatorsAvailable, attenuatorsMaintenance, attenuatorsTotal
  ]);

  // Max value calculation for Bar Chart Y-axis
  const maxBarValue = useMemo(() => {
    const highest = Math.max(lanforgesTotal, realDevicesTotal, attenuatorsTotal, 80);
    return Math.ceil(highest / 20) * 20; // Round up to nearest 20 (e.g. 100)
  }, [lanforgesTotal, realDevicesTotal, attenuatorsTotal]);

  // Status colors palette
  const statusColors = {
    'In-Use': {
      solid: '#16A34A',
      light: '#DCFCE7',
      text: '#15803D',
      gradStart: '#16A34A',
      gradEnd: '#22C55E'
    },
    'Available': {
      solid: '#0284C7',
      light: '#E0F2FE',
      text: '#0369A1',
      gradStart: '#0284C7',
      gradEnd: '#38BDF8'
    },
    'Under Maintenance': {
      solid: '#EA580C',
      light: '#FFEDD5',
      text: '#C2410C',
      gradStart: '#EA580C',
      gradEnd: '#FB923C'
    }
  };

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* =========================================================================
          VIEWPORT 1: CATEGORY LAUNCHPAD (4 CURVED RECTANGULAR BOXES)
          Aspect ratio matching natural 16:9 images, 2 rows x 2 boxes
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

            {!isAdmin && onRequestResource && (
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

        {/* 4 Rectangular Boxes with Curved Edges (2 Rows x 2 Boxes per Row, 16:9 Aspect Ratio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 my-4 flex-1 items-stretch">
          
          {/* BOX 1: LANFORGES */}
          <div
            onClick={() => onNavigate('lanforges')}
            className="group relative aspect-video w-full rounded-2xl lg:rounded-3xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-[#173D30]"
          >
            <img
              src="/Images/lanforges.webp"
              alt="Candela LANforges"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 group-hover:via-black/20 transition-colors" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-[#172A21] shadow-sm">
                <Radio className="w-3.5 h-3.5 text-[#247A51]" />
                <span>LANforges Testbeds</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#247A51] text-white shadow-md">
                {lanforgesTotal} Units
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">
                    LANforges
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                    Multi-station Wi-Fi 7 / 6E traffic generators & radio hardware testbeds
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <strong className="text-white">{lanforgesInUse}</strong> In-Use
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      <strong className="text-white">{lanforgesAvailable}</strong> Available
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
                      <strong className="text-white">{lanforgesMaintenance}</strong> Maintenance
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-[#247A51] text-[#172A21] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* BOX 2: ATTENUATORS */}
          <div
            onClick={() => onNavigate('attenuators')}
            className="group relative aspect-video w-full rounded-2xl lg:rounded-3xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-[#173D30]"
          >
            <img
              src="/Images/attenuators.webp"
              alt="Programmable RF Attenuators"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 group-hover:via-black/20 transition-colors" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-[#172A21] shadow-sm">
                <Sliders className="w-3.5 h-3.5 text-[#0369A1]" />
                <span>RF Pathloss Matrix</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#0369A1] text-white shadow-md">
                {attenuatorsTotal} Units
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">
                    Attenuators
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                    Programmable 8x8, 16x16 & 4x4 RF step attenuator banks with 0.5dB step accuracy
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <strong className="text-white">{attenuatorsInUse}</strong> In-Use
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      <strong className="text-white">{attenuatorsAvailable}</strong> Available
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
                      <strong className="text-white">{attenuatorsMaintenance}</strong> Maintenance
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-[#247A51] text-[#172A21] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* BOX 3: REAL DEVICES */}
          <div
            onClick={() => onNavigate('mobiles')}
            className="group relative aspect-video w-full rounded-2xl lg:rounded-3xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-[#173D30]"
          >
            <img
              src="/Images/real_devices.webp"
              alt="Candela Real Devices Fleet"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 group-hover:via-black/20 transition-colors" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-[#172A21] shadow-sm">
                <Smartphone className="w-3.5 h-3.5 text-[#7E22CE]" />
                <span>Client Device Fleet</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#7E22CE] text-white shadow-md">
                {realDevicesTotal} Units
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">
                    Real Devices
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                    Automated smartphones, tablets & reference clients for test campaigns
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <strong className="text-white">{realDevicesInUse}</strong> In-Use
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      <strong className="text-white">{realDevicesAvailable}</strong> Available
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
                      <strong className="text-white">{realDevicesMaintenance}</strong> Maintenance
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-[#247A51] text-[#172A21] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* BOX 4: CHAMBERS */}
          <div
            onClick={() => onNavigate('chambers')}
            className="group relative aspect-video w-full rounded-2xl lg:rounded-3xl border border-[#E5EBE6] hover:border-[#247A51] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-[#173D30]"
          >
            <img
              src="/Images/chambers.webp"
              alt="RF Isolation & Anechoic Chambers"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 group-hover:via-black/20 transition-colors" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-[#172A21] shadow-sm">
                <Box className="w-3.5 h-3.5 text-[#B45309]" />
                <span>RF Isolation Enclosures</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#B45309] text-white shadow-md">
                {chambers.length} Units
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">
                    Chambers
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 drop-shadow-sm mt-0.5 line-clamp-1">
                    RF isolation, reverberation & anechoic chambers with filtered feedthroughs
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <strong className="text-white">{chambers.filter(c => c.status === 'In-Use' && !c.isArchived).length}</strong> In-Use
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      <strong className="text-white">{chambers.filter(c => c.status === 'Available' && !c.isArchived).length}</strong> Available
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
                      <strong className="text-white">{chambers.filter(c => c.status === 'Under Maintenance' && !c.isArchived).length}</strong> Maintenance
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-[#247A51] text-[#172A21] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
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
            <span>View Charts & Capacity Telemetry</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#247A51] animate-bounce" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          VIEWPORT 2: CHARTS & GRAPHS VISUAL REPRESENTATION
          Equipment: LANforges, Real Devices, Attenuators
          Categories: In Use, Available, Under Maintenance
          All fitted within this single second viewport!
          ========================================================================= */}
      <section 
        ref={viewport2Ref} 
        className="min-h-[calc(100vh-5rem)] flex flex-col justify-between py-3 space-y-4"
      >
        {/* Viewport 2 Header with View Mode Switcher and Status Filter Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E5EBE6] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF4EF] text-[#247A51] border border-[#C2DCD0] uppercase tracking-wider">
                Telemetry Analytics
              </span>
              <span className="text-xs text-[#64748B]">Capacity & Utilization Graphs</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#172A21] mt-1">
              Hardware Fleet Operational Breakdown
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comparative visual analytics for <strong className="text-[#172A21]">LANforges</strong>, <strong className="text-[#172A21]">Real Devices</strong>, and <strong className="text-[#172A21]">Attenuators</strong> across operational statuses.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle Switcher */}
            <div className="flex items-center bg-[#F1F5F2] p-1 rounded-xl border border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setChartView('combined')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  chartView === 'combined'
                    ? 'bg-white text-[#247A51] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172A21]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Executive Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setChartView('bars')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  chartView === 'bars'
                    ? 'bg-white text-[#247A51] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172A21]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Column Graph</span>
              </button>
              <button
                type="button"
                onClick={() => setChartView('donuts')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  chartView === 'donuts'
                    ? 'bg-white text-[#247A51] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172A21]'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Donut Rings</span>
              </button>
            </div>

            {/* Interactive Status Filter Chips */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5EBE6] shadow-sm">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#172A21] text-white'
                    : 'text-[#64748B] hover:bg-[#F5F7F5]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'In-Use' ? 'all' : 'In-Use')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'In-Use'
                    ? 'bg-[#16A34A] text-white'
                    : 'text-[#15803D] hover:bg-[#DCFCE7]/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>In-Use</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'Available' ? 'all' : 'Available')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'Available'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#0369A1] hover:bg-[#E0F2FE]/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                <span>Available</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'Under Maintenance' ? 'all' : 'Under Maintenance')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === 'Under Maintenance'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-[#C2410C] hover:bg-[#FFEDD5]/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                <span>Maintenance</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            CHARTS CONTAINER (ELEGANT SVG-BASED PROFESSIONAL VISUALIZATION)
            ===================================================================== */}
        <div className="flex-1 my-1">
          {/* VIEW MODE 1: COMBINED EXECUTIVE OVERVIEW (Bar Chart + Donut Rings side by side) */}
          {chartView === 'combined' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-full">
              {/* Left Column: Grouped Column Bar Chart (7 of 12 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F2]">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#247A51]" />
                      <h3 className="text-sm font-bold text-[#172A21]">Comparative Grouped Bar Graph</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-[#16A34A]" />
                        <span>In-Use</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-[#0284C7]" />
                        <span>Available</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-[#EA580C]" />
                        <span>Maint</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Multi-Category Grouped Column Chart */}
                  <div className="relative pt-4">
                    <svg
                      viewBox="0 0 680 270"
                      className="w-full h-56 sm:h-64 overflow-visible select-none"
                    >
                      <defs>
                        {/* Gradients for bars */}
                        <linearGradient id="gradInUse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" />
                          <stop offset="100%" stopColor="#16A34A" />
                        </linearGradient>
                        <linearGradient id="gradAvailable" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0284C7" />
                        </linearGradient>
                        <linearGradient id="gradMaintenance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FB923C" />
                          <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                      </defs>

                      {/* Y-Axis Horizontal Gridlines & Tick Labels */}
                      {[0, 25, 50, 75, 100].map((val) => {
                        const y = 220 - (val / 100) * 185;
                        return (
                          <g key={val}>
                            <line
                              x1="45"
                              y1={y}
                              x2="660"
                              y2={y}
                              stroke="#EEF2F0"
                              strokeDasharray={val === 0 ? '0' : '4 4'}
                              strokeWidth="1"
                            />
                            <text
                              x="35"
                              y={y + 3}
                              textAnchor="end"
                              fontSize="11"
                              fill="#94A3B8"
                              fontFamily="var(--font-outfit), Outfit, sans-serif"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* X-Axis Baseline */}
                      <line x1="45" y1="220" x2="660" y2="220" stroke="#CBD5E1" strokeWidth="1.5" />

                      {/* 3 Equipment Clusters on X-Axis */}
                      {fleetData.map((item, idx) => {
                        const centerX = 160 + idx * 195;
                        const barWidth = 32;
                        const gap = 8;
                        const groupWidth = 3 * barWidth + 2 * gap; // 112px
                        const startX = centerX - groupWidth / 2;

                        // Bar coordinates
                        const bars = [
                          {
                            status: 'In-Use' as const,
                            count: item.inUse,
                            color: 'url(#gradInUse)',
                            solidColor: '#16A34A',
                            x: startX
                          },
                          {
                            status: 'Available' as const,
                            count: item.available,
                            color: 'url(#gradAvailable)',
                            solidColor: '#0284C7',
                            x: startX + barWidth + gap
                          },
                          {
                            status: 'Under Maintenance' as const,
                            count: item.maintenance,
                            color: 'url(#gradMaintenance)',
                            solidColor: '#EA580C',
                            x: startX + (barWidth + gap) * 2
                          }
                        ];

                        return (
                          <g key={item.id}>
                            {/* Bars */}
                            {bars.map((bar) => {
                              const barHeight = Math.max(3, (bar.count / 100) * 185);
                              const barY = 220 - barHeight;
                              const isDimmed = statusFilter !== 'all' && statusFilter !== bar.status;
                              const isHovered = hoveredBar?.group === item.label && hoveredBar?.status === bar.status;

                              return (
                                <g
                                  key={bar.status}
                                  className="cursor-pointer transition-all duration-200"
                                  onMouseEnter={() => setHoveredBar({
                                    group: item.label,
                                    status: bar.status,
                                    count: bar.count,
                                    total: item.total,
                                    color: bar.solidColor
                                  })}
                                  onMouseLeave={() => setHoveredBar(null)}
                                >
                                  {/* Bar Rect */}
                                  <rect
                                    x={bar.x}
                                    y={barY}
                                    width={barWidth}
                                    height={barHeight}
                                    rx="5"
                                    fill={bar.color}
                                    opacity={isDimmed ? 0.2 : isHovered ? 1 : 0.9}
                                    className="transition-opacity duration-150"
                                  />

                                  {/* Hover Glow Highlight */}
                                  {isHovered && (
                                    <rect
                                      x={bar.x - 2}
                                      y={barY - 2}
                                      width={barWidth + 4}
                                      height={barHeight + 4}
                                      rx="6"
                                      fill="none"
                                      stroke={bar.solidColor}
                                      strokeWidth="2"
                                    />
                                  )}

                                  {/* Value on top of bar */}
                                  <text
                                    x={bar.x + barWidth / 2}
                                    y={barY - 6}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="bold"
                                    fill={isDimmed ? '#94A3B8' : '#172A21'}
                                    fontFamily="var(--font-outfit), Outfit, sans-serif"
                                  >
                                    {bar.count}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Group X-Axis Label */}
                            <text
                              x={centerX}
                              y={242}
                              textAnchor="middle"
                              fontSize="13"
                              fontWeight="bold"
                              fill="#172A21"
                              fontFamily="var(--font-outfit), Outfit, sans-serif"
                              className="cursor-pointer hover:fill-[#247A51]"
                              onClick={() => onNavigate(item.navKey)}
                            >
                              {item.label}
                            </text>
                            <text
                              x={centerX}
                              y={258}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#64748B"
                              fontFamily="var(--font-outfit), Outfit, sans-serif"
                            >
                              {item.total} Total Units
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Interactive Floating Hover Card */}
                    {hoveredBar && (
                      <div className="absolute top-2 right-4 px-3 py-2 bg-[#172A21] text-white rounded-xl shadow-xl text-xs space-y-0.5 border border-white/10 backdrop-blur-md animate-fade-in pointer-events-none">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredBar.color }} />
                          <span>{hoveredBar.group} — {hoveredBar.status}</span>
                        </div>
                        <div className="text-white/80">
                          Count: <strong className="text-white">{hoveredBar.count}</strong> units ({Math.round((hoveredBar.count / hoveredBar.total) * 100)}% of fleet)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Navigation Links */}
                <div className="pt-3 border-t border-[#F1F5F2] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Click category name to view inventory</span>
                  <div className="flex items-center gap-2">
                    {fleetData.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onNavigate(f.navKey)}
                        className="px-2.5 py-1 rounded-md bg-[#F5F7F5] hover:bg-[#EBF4EF] text-[#247A51] font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>{f.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Radial Donut Rings (5 of 12 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F2]">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#247A51]" />
                      <h3 className="text-sm font-bold text-[#172A21]">Fleet Utilization Donut Rings</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF4EF] text-[#247A51]">
                      {overallUtilizationPct}% Fleet In-Use
                    </span>
                  </div>

                  {/* 3 Donut Gauges in a Vertical Stack */}
                  <div className="divide-y divide-[#F1F5F2] pt-1">
                    {fleetData.map((item) => {
                      const Icon = item.icon;
                      const circumference = 2 * Math.PI * 40; // radius = 40, ~251.3
                      const inUseLength = (item.inUse / item.total) * circumference;
                      const availLength = (item.available / item.total) * circumference;
                      const maintLength = (item.maintenance / item.total) * circumference;

                      const offsetInUse = 0;
                      const offsetAvail = -inUseLength;
                      const offsetMaint = -(inUseLength + availLength);

                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                          {/* Mini Circular Donut Graph */}
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none">
                              {/* Background track */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#F1F5F2"
                                strokeWidth="12"
                              />
                              {/* In-Use Arc */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#16A34A"
                                strokeWidth="12"
                                strokeDasharray={`${Math.max(0, inUseLength - 1.5)} ${circumference}`}
                                strokeDashoffset={offsetInUse}
                                opacity={statusFilter === 'all' || statusFilter === 'In-Use' ? 1 : 0.25}
                              />
                              {/* Available Arc */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#0284C7"
                                strokeWidth="12"
                                strokeDasharray={`${Math.max(0, availLength - 1.5)} ${circumference}`}
                                strokeDashoffset={offsetAvail}
                                opacity={statusFilter === 'all' || statusFilter === 'Available' ? 1 : 0.25}
                              />
                              {/* Maintenance Arc */}
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#EA580C"
                                strokeWidth="12"
                                strokeDasharray={`${Math.max(0, maintLength - 1.5)} ${circumference}`}
                                strokeDashoffset={offsetMaint}
                                opacity={statusFilter === 'all' || statusFilter === 'Under Maintenance' ? 1 : 0.25}
                              />
                            </svg>
                            {/* Donut Center Display */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-base font-bold font-mono text-[#172A21] leading-none">
                                {item.total}
                              </span>
                              <span className="text-[9px] text-[#64748B] uppercase tracking-wider mt-0.5">
                                Units
                              </span>
                            </div>
                          </div>

                          {/* Category Details & Status Breakdown */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-[#247A51]" />
                                <h4 className="text-sm font-bold text-[#172A21] truncate">{item.label}</h4>
                              </div>
                              <span className="text-xs font-bold text-[#247A51]">
                                {item.utilization}% Deployed
                              </span>
                            </div>

                            {/* 3 Metric Pills */}
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                              <div className="p-1.5 rounded-lg bg-[#DCFCE7]/60 border border-[#BBF7D0] text-center">
                                <div className="text-[10px] font-semibold text-[#15803D]">In-Use</div>
                                <div className="text-xs font-bold font-mono text-[#15803D]">{item.inUse}</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-[#E0F2FE]/60 border border-[#BAE6FD] text-center">
                                <div className="text-[10px] font-semibold text-[#0369A1]">Avail</div>
                                <div className="text-xs font-bold font-mono text-[#0369A1]">{item.available}</div>
                              </div>
                              <div className="p-1.5 rounded-lg bg-[#FFEDD5]/60 border border-[#FED7AA] text-center">
                                <div className="text-[10px] font-semibold text-[#C2410C]">Maint</div>
                                <div className="text-xs font-bold font-mono text-[#C2410C]">{item.maintenance}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Summary Footnote */}
                <div className="pt-3 border-t border-[#F1F5F2] flex items-center justify-between text-xs text-[#64748B]">
                  <span>Total Hardware Capacity: <strong className="text-[#172A21]">{grandTotal} Units</strong></span>
                  <span className="text-[#247A51] font-semibold">{grandInUse} Active in Testbeds</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: EXPANDED FULL-WIDTH GROUPED BAR GRAPH */}
          {chartView === 'bars' && (
            <div className="bg-white rounded-2xl border border-[#E5EBE6] p-6 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F2]">
                  <div>
                    <h3 className="text-base font-bold text-[#172A21]">Full Fleet Capacity & Allocation Bar Chart</h3>
                    <p className="text-xs text-[#64748B]">Comparative volume of In-Use, Available, and Under Maintenance units across equipment lines.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                      <span className="w-3 h-3 rounded bg-[#16A34A]" />
                      <span>In-Use ({grandInUse})</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#0369A1]">
                      <span className="w-3 h-3 rounded bg-[#0284C7]" />
                      <span>Available ({grandAvailable})</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#C2410C]">
                      <span className="w-3 h-3 rounded bg-[#EA580C]" />
                      <span>Under Maintenance ({grandMaintenance})</span>
                    </span>
                  </div>
                </div>

                {/* Large SVG Bar Chart */}
                <div className="relative pt-6">
                  <svg
                    viewBox="0 0 900 300"
                    className="w-full h-72 sm:h-80 overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="expInUse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                      <linearGradient id="expAvailable" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                      </linearGradient>
                      <linearGradient id="expMaintenance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FB923C" />
                        <stop offset="100%" stopColor="#EA580C" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Lines */}
                    {[0, 20, 40, 60, 80, 100].map((val) => {
                      const y = 240 - (val / 100) * 200;
                      return (
                        <g key={val}>
                          <line
                            x1="50"
                            y1={y}
                            x2="880"
                            y2={y}
                            stroke="#EEF2F0"
                            strokeDasharray={val === 0 ? '0' : '4 4'}
                            strokeWidth="1"
                          />
                          <text
                            x="40"
                            y={y + 4}
                            textAnchor="end"
                            fontSize="12"
                            fill="#94A3B8"
                            fontFamily="var(--font-outfit), Outfit, sans-serif"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    <line x1="50" y1="240" x2="880" y2="240" stroke="#CBD5E1" strokeWidth="1.5" />

                    {/* 3 Clusters */}
                    {fleetData.map((item, idx) => {
                      const centerX = 200 + idx * 260;
                      const barWidth = 44;
                      const gap = 12;
                      const groupWidth = 3 * barWidth + 2 * gap; // 156px
                      const startX = centerX - groupWidth / 2;

                      const bars = [
                        { status: 'In-Use' as const, count: item.inUse, fill: 'url(#expInUse)', solid: '#16A34A', x: startX },
                        { status: 'Available' as const, count: item.available, fill: 'url(#expAvailable)', solid: '#0284C7', x: startX + barWidth + gap },
                        { status: 'Under Maintenance' as const, count: item.maintenance, fill: 'url(#expMaintenance)', solid: '#EA580C', x: startX + (barWidth + gap) * 2 }
                      ];

                      return (
                        <g key={item.id}>
                          {bars.map((bar) => {
                            const barHeight = Math.max(4, (bar.count / 100) * 200);
                            const barY = 240 - barHeight;
                            const isDimmed = statusFilter !== 'all' && statusFilter !== bar.status;

                            return (
                              <g
                                key={bar.status}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredBar({
                                  group: item.label,
                                  status: bar.status,
                                  count: bar.count,
                                  total: item.total,
                                  color: bar.solid
                                })}
                                onMouseLeave={() => setHoveredBar(null)}
                              >
                                <rect
                                  x={bar.x}
                                  y={barY}
                                  width={barWidth}
                                  height={barHeight}
                                  rx="6"
                                  fill={bar.fill}
                                  opacity={isDimmed ? 0.2 : 0.95}
                                  className="hover:opacity-100 transition-opacity"
                                />
                                <text
                                  x={bar.x + barWidth / 2}
                                  y={barY - 8}
                                  textAnchor="middle"
                                  fontSize="12"
                                  fontWeight="bold"
                                  fill={isDimmed ? '#94A3B8' : '#172A21'}
                                  fontFamily="var(--font-outfit), Outfit, sans-serif"
                                >
                                  {bar.count}
                                </text>
                              </g>
                            );
                          })}

                          <text
                            x={centerX}
                            y={265}
                            textAnchor="middle"
                            fontSize="15"
                            fontWeight="bold"
                            fill="#172A21"
                            fontFamily="var(--font-outfit), Outfit, sans-serif"
                            className="cursor-pointer hover:fill-[#247A51]"
                            onClick={() => onNavigate(item.navKey)}
                          >
                            {item.label}
                          </text>
                          <text
                            x={centerX}
                            y={283}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#64748B"
                            fontFamily="var(--font-outfit), Outfit, sans-serif"
                          >
                            {item.total} Total Units • {item.utilization}% In-Use
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Bottom Quick Jump Cards */}
              <div className="pt-4 border-t border-[#F1F5F2] grid grid-cols-3 gap-4">
                {fleetData.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onNavigate(f.navKey)}
                    className="p-3 rounded-xl bg-[#F9FAF9] hover:bg-[#EBF4EF] border border-[#E5EBE6] hover:border-[#247A51] transition-all flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#172A21]">{f.label} Catalog</div>
                      <div className="text-[11px] text-[#64748B]">View all {f.total} hardware units</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#247A51]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: 3 PROMINENT RADIAL DONUT GAUGES */}
          {chartView === 'donuts' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
              {fleetData.map((item) => {
                const Icon = item.icon;
                const circumference = 2 * Math.PI * 52; // radius = 52, ~326.7
                const inUseLength = (item.inUse / item.total) * circumference;
                const availLength = (item.available / item.total) * circumference;
                const maintLength = (item.maintenance / item.total) * circumference;

                const offsetInUse = 0;
                const offsetAvail = -inUseLength;
                const offsetMaint = -(inUseLength + availLength);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E5EBE6] p-5 shadow-sm hover:border-[#247A51] transition-all flex flex-col justify-between"
                  >
                    {/* Donut Card Top */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F2]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#EBF4EF] text-[#247A51] flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#172A21]">{item.label}</h3>
                            <p className="text-[11px] text-[#64748B]">{item.subtitle}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#247A51] px-2 py-0.5 rounded-full bg-[#EBF4EF]">
                          {item.utilization}% Active
                        </span>
                      </div>

                      {/* Prominent Radial Ring */}
                      <div className="relative w-44 h-44 mx-auto my-3">
                        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90 select-none">
                          <circle
                            cx="65"
                            cy="65"
                            r="52"
                            fill="none"
                            stroke="#F1F5F2"
                            strokeWidth="15"
                          />
                          <circle
                            cx="65"
                            cy="65"
                            r="52"
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="15"
                            strokeDasharray={`${Math.max(0, inUseLength - 2)} ${circumference}`}
                            strokeDashoffset={offsetInUse}
                            opacity={statusFilter === 'all' || statusFilter === 'In-Use' ? 1 : 0.25}
                          />
                          <circle
                            cx="65"
                            cy="65"
                            r="52"
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="15"
                            strokeDasharray={`${Math.max(0, availLength - 2)} ${circumference}`}
                            strokeDashoffset={offsetAvail}
                            opacity={statusFilter === 'all' || statusFilter === 'Available' ? 1 : 0.25}
                          />
                          <circle
                            cx="65"
                            cy="65"
                            r="52"
                            fill="none"
                            stroke="#EA580C"
                            strokeWidth="15"
                            strokeDasharray={`${Math.max(0, maintLength - 2)} ${circumference}`}
                            strokeDashoffset={offsetMaint}
                            opacity={statusFilter === 'all' || statusFilter === 'Under Maintenance' ? 1 : 0.25}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-bold font-mono text-[#172A21]">
                            {item.total}
                          </span>
                          <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                            Total Fleet
                          </span>
                          <span className="text-xs font-semibold text-[#16A34A] mt-0.5">
                            {item.inUse} In-Use
                          </span>
                        </div>
                      </div>

                      {/* Status Breakdown Legend Tiles */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-center">
                          <div className="text-[10px] font-semibold text-[#15803D]">In-Use</div>
                          <div className="text-base font-bold font-mono text-[#15803D] mt-0.5">{item.inUse}</div>
                          <div className="text-[10px] text-[#166534]">{Math.round((item.inUse / item.total) * 100)}%</div>
                        </div>

                        <div className="p-2 rounded-xl bg-[#E0F2FE]/60 border border-[#BAE6FD] text-center">
                          <div className="text-[10px] font-semibold text-[#0369A1]">Available</div>
                          <div className="text-base font-bold font-mono text-[#0369A1] mt-0.5">{item.available}</div>
                          <div className="text-[10px] text-[#075985]">{Math.round((item.available / item.total) * 100)}%</div>
                        </div>

                        <div className="p-2 rounded-xl bg-[#FFEDD5]/60 border border-[#FED7AA] text-center">
                          <div className="text-[10px] font-semibold text-[#C2410C]">Maint</div>
                          <div className="text-base font-bold font-mono text-[#C2410C] mt-0.5">{item.maintenance}</div>
                          <div className="text-[10px] text-[#9A3412]">{Math.round((item.maintenance / item.total) * 100)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigate Button */}
                    <div className="pt-3 border-t border-[#F1F5F2] mt-3">
                      <button
                        type="button"
                        onClick={() => onNavigate(item.navKey)}
                        className="w-full py-2 text-xs font-semibold text-[#247A51] bg-[#F9FAF9] hover:bg-[#EBF4EF] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Explore {item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Executive Status Bar at Bottom of Viewport 2 */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EBF4EF] text-[#247A51] rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#172A21]">Candela Mission-Critical Telemetry Stream</div>
              <div className="text-[11px] text-[#64748B]">
                Hardware allocations across LANforges, Real Devices & Attenuators are synced live with active lab testbeds.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isAdmin && onRequestResource && (
              <button
                type="button"
                onClick={onRequestResource}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Equipment Allocation</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
