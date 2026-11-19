'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar, NavItemKey } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MetricCard } from '../dashboard/MetricCard';
import { ActivityList } from '../dashboard/ActivityList';
import { AIAssistantPanel } from '../assistant/AIAssistantPanel';
import { AssignmentsView } from '../views/AssignmentsView';
import { UsersView } from '../views/UsersView';
import { SettingsView } from '../views/SettingsView';
import { ProfileView } from '../views/ProfileView';

// Phase 3 Inventory Components
import { LANforgeTable } from '../inventory/lanforge/LANforgeTable';
import { LANforgeDetailPanel } from '../inventory/lanforge/LANforgeDetailPanel';
import { AddEditLANforgeModal } from '../inventory/lanforge/AddEditLANforgeModal';

import { DesktopTable } from '../inventory/desktop/DesktopTable';
import { DesktopDetailPanel } from '../inventory/desktop/DesktopDetailPanel';
import { AddEditDesktopModal } from '../inventory/desktop/AddEditDesktopModal';

import { MobileTable } from '../inventory/mobile/MobileTable';
import { MobileDetailPanel } from '../inventory/mobile/MobileDetailPanel';
import { AddEditMobileModal } from '../inventory/mobile/AddEditMobileModal';

import { ChamberTable } from '../inventory/chamber/ChamberTable';
import { ChamberDetailPanel } from '../inventory/chamber/ChamberDetailPanel';
import { AddEditChamberModal } from '../inventory/chamber/AddEditChamberModal';

import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { 
  LANforgeItem, 
  DesktopItem, 
  MobileItem, 
  ChamberItem, 
  ActivityLog 
} from '@/types/inventory';
import { INITIAL_ACTIVITY_LOGS } from '@/data/inventorySeed';
import { 
  Layers, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle, 
  Calendar,
  Plus,
  Radio,
  Monitor,
  Smartphone,
  Box,
  AlertCircle,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  initialNav?: NavItemKey;
}

export function DashboardLayout({ initialNav = 'dashboard' }: DashboardLayoutProps) {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const {
    lanforges,
    desktops,
    mobiles,
    chambers,
    metrics,
    addLANforge,
    updateLANforge,
    archiveLANforge,
    addDesktop,
    updateDesktop,
    archiveDesktop,
    addMobile,
    updateMobile,
    archiveMobile,
    addChamber,
    updateChamber,
    archiveChamber,
  } = useInventory();

  // Navigation State
  const [activeNav, setActiveNav] = useState<NavItemKey>(() => {
    if (initialNav === 'users' && role === 'employee') return 'dashboard';
    return initialNav;
  });

  useEffect(() => {
    if (!isAdmin && (activeNav === 'users' || activeNav === 'settings')) {
      setActiveNav('dashboard');
    }
  }, [isAdmin, activeNav]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Activities Log State
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Modal / Detail States - LANforge
  const [detailLANforge, setDetailLANforge] = useState<LANforgeItem | null>(null);
  const [editLANforge, setEditLANforge] = useState<LANforgeItem | null>(null);
  const [isAddLANforgeOpen, setIsAddLANforgeOpen] = useState(false);

  // Modal / Detail States - Desktop
  const [detailDesktop, setDetailDesktop] = useState<DesktopItem | null>(null);
  const [editDesktop, setEditDesktop] = useState<DesktopItem | null>(null);
  const [isAddDesktopOpen, setIsAddDesktopOpen] = useState(false);

  // Modal / Detail States - Mobile
  const [detailMobile, setDetailMobile] = useState<MobileItem | null>(null);
  const [editMobile, setEditMobile] = useState<MobileItem | null>(null);
  const [isAddMobileOpen, setIsAddMobileOpen] = useState(false);

  // Modal / Detail States - Chamber
  const [detailChamber, setDetailChamber] = useState<ChamberItem | null>(null);
  const [editChamber, setEditChamber] = useState<ChamberItem | null>(null);
  const [isAddChamberOpen, setIsAddChamberOpen] = useState(false);

  // Archive Confirm State
  const [archiveTarget, setArchiveTarget] = useState<{
    category: 'lanforge' | 'desktop' | 'mobile' | 'chamber';
    id: string;
    tag: string;
  } | null>(null);

  // Current formatted date initialized safely for SSR
  const [currentDateString, setCurrentDateString] = useState('Wednesday, November 18, 2026');

  useEffect(() => {
    try {
      const formatted = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date());
      setCurrentDateString(formatted);
    } catch {
      // Fallback
    }
  }, []);

  // Handlers for Global Archive
  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    const { category, id, tag } = archiveTarget;

    if (category === 'lanforge') await archiveLANforge(id);
    else if (category === 'desktop') await archiveDesktop(id);
    else if (category === 'mobile') await archiveMobile(id);
    else if (category === 'chamber') await archiveChamber(id);

    // Add activity record
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      unitAssetTag: tag,
      unitModel: category.toUpperCase(),
      action: 'archived',
      title: `${category.toUpperCase()} Unit Archived: ${tag}`,
      description: `Hardware asset removed from active inventory list.`,
      timestamp: 'Just now',
      user: {
        name: user?.full_name || 'Admin Supervisor',
        role: role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    };
    setActivities((prev) => [newLog, ...prev]);
    setArchiveTarget(null);
  };

  const handleViewUnit = (tagOrId: string) => {
    if (!tagOrId) return;
    const q = tagOrId.toLowerCase().trim();
    const lf = lanforges.find(l => l.lanforgeId.toLowerCase() === q || l.id === tagOrId);
    if (lf) {
      setDetailLANforge(lf);
      setActiveNav('lanforges');
      return;
    }
    const dt = desktops.find(d => d.deviceId.toLowerCase() === q || d.id === tagOrId);
    if (dt) {
      setDetailDesktop(dt);
      setActiveNav('desktops');
      return;
    }
    const mb = mobiles.find(m => m.deviceId.toLowerCase() === q || m.id === tagOrId);
    if (mb) {
      setDetailMobile(mb);
      setActiveNav('mobiles');
      return;
    }
    const ch = chambers.find(c => c.chamberId.toLowerCase() === q || c.id === tagOrId);
    if (ch) {
      setDetailChamber(ch);
      setActiveNav('chambers');
      return;
    }
  };

  // Quick Open Modal based on active navigation
  const handleOpenAddCurrentCategory = () => {
    if (activeNav === 'lanforges' || activeNav === 'dashboard') {
      setIsAddLANforgeOpen(true);
    } else if (activeNav === 'desktops') {
      setIsAddDesktopOpen(true);
    } else if (activeNav === 'mobiles') {
      setIsAddMobileOpen(true);
    } else if (activeNav === 'chambers') {
      setIsAddChamberOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7F5] select-none text-[#172A21]">
      {/* 1. LEFT SIDEBAR (220px to 250px) */}
      <AppSidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[240px]'
        }`}
      >
        {/* Top Header */}
        <AppHeader
          activeNav={activeNav}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenAddUnit={handleOpenAddCurrentCategory}
        />

        {/* Center Workspace & Right Assistant Column */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 2. CENTER WORKSPACE (FLEXIBLE WIDTH) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F7F5] space-y-6">
            
            {/* VIEW: DASHBOARD */}
            {activeNav === 'dashboard' && (
              <>
                {/* 1. Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      Operations Dashboard
                    </h1>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Monitor hardware allocations, track LANforge testbed availability, and manage Candela units.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#FFFFFF] border border-[#E5EBE6] text-xs text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5 text-[#247A51]" />
                      <span>{currentDateString}</span>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsAddLANforgeOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors shadow-none"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add LANforge</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Compact Summary Cards (No Charts, Clean Enterprise SaaS Design) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <MetricCard
                    label="Total Units"
                    value={metrics.totalUnits}
                    subValue="Centralized inventory assets"
                    icon={Layers}
                    badge={{ text: 'All Units', variant: 'neutral' }}
                  />

                  <MetricCard
                    label="Available Units"
                    value={metrics.totalAvailable}
                    subValue={`${metrics.totalUnits > 0 ? Math.round((metrics.totalAvailable / metrics.totalUnits) * 100) : 0}% unassigned in lab pools`}
                    icon={CheckCircle2}
                    badge={{ text: 'In Stock', variant: 'success' }}
                  />

                  <MetricCard
                    label="Assigned Units"
                    value={metrics.totalInUse}
                    subValue={`${metrics.totalUnits > 0 ? Math.round((metrics.totalInUse / metrics.totalUnits) * 100) : 0}% deployed in active testbeds`}
                    icon={UserCheck}
                    badge={{ text: 'Allocated', variant: 'info' }}
                  />

                  <MetricCard
                    label="Under Maintenance"
                    value={metrics.totalUnderMaintenance}
                    subValue="Calibration / diagnostics active"
                    icon={AlertTriangle}
                    badge={{ text: 'Attention', variant: 'warning' }}
                  />
                </div>

                {/* Category Navigation Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveNav('lanforges')}
                    className="p-3 bg-white rounded border border-[#E5EBE6] hover:border-[#247A51] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#247A51] bg-[#F5F7F5] px-2 py-0.5 rounded border border-[#E5EBE6]">
                        {metrics.totalLANforges}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172A21] group-hover:text-[#247A51]">
                      LANforges
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Traffic generators & multi-radio testbeds
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('desktops')}
                    className="p-3 bg-white rounded border border-[#E5EBE6] hover:border-[#247A51] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#247A51] bg-[#F5F7F5] px-2 py-0.5 rounded border border-[#E5EBE6]">
                        {metrics.totalDesktops}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172A21] group-hover:text-[#247A51]">
                      Desktops
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Engineering workstations & controllers
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('mobiles')}
                    className="p-3 bg-white rounded border border-[#E5EBE6] hover:border-[#247A51] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#247A51] bg-[#F5F7F5] px-2 py-0.5 rounded border border-[#E5EBE6]">
                        {metrics.totalMobiles}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172A21] group-hover:text-[#247A51]">
                      Mobiles
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Client device fleet & test stations
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNav('chambers')}
                    className="p-3 bg-white rounded border border-[#E5EBE6] hover:border-[#247A51] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                        <Box className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#247A51] bg-[#F5F7F5] px-2 py-0.5 rounded border border-[#E5EBE6]">
                        {metrics.totalChambers}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172A21] group-hover:text-[#247A51]">
                      Chambers
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      RF isolation, OTA & anechoic chambers
                    </div>
                  </button>
                </div>

                {/* 3. LANforge Primary Table on Dashboard */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#172A21] tracking-tight">
                        LANforge Testbed Fleet
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        Primary testbed hardware registry with real-time allocation status and radio specs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('lanforges')}
                      className="text-xs font-medium text-[#247A51] hover:underline"
                    >
                      View All LANforges →
                    </button>
                  </div>

                  <LANforgeTable
                    data={lanforges}
                    onView={(item) => setDetailLANforge(item)}
                    onEdit={(item) => setEditLANforge(item)}
                    onArchive={(item) => setArchiveTarget({ category: 'lanforge', id: item.id, tag: item.lanforgeId })}
                    onAddNew={() => setIsAddLANforgeOpen(true)}
                    isAdmin={isAdmin}
                  />
                </div>

                {/* 4. RECENT CUSTODY MOVEMENTS (Assignments, Returns & Transfers) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Recent Assignments */}
                  <div className="p-3.5 bg-white rounded border border-[#E5EBE6] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#172A21]">
                        <UserCheck className="w-4 h-4 text-[#16A34A]" />
                        <span>Recent Assignments</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#247A51] bg-[#EBF4EF] px-1.5 py-0.5 rounded">
                        {metrics.totalActiveAssignments} Active
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5EBE6] text-xs">
                      {metrics.recentAssignments.length === 0 ? (
                        <p className="text-[11px] text-[#94A3B8] italic py-2">No active assignments recorded.</p>
                      ) : (
                        metrics.recentAssignments.slice(0, 3).map((a) => (
                          <div key={a.id} className="py-2 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-[#172A21]">{a.equipmentTag}</div>
                              <div className="text-[10px] text-[#64748B]">To: {a.employeeName}</div>
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {new Date(a.assignedDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Returns */}
                  <div className="p-3.5 bg-white rounded border border-[#E5EBE6] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#172A21]">
                        <CheckCircle2 className="w-4 h-4 text-[#247A51]" />
                        <span>Recent Returns</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64748B] bg-[#F5F7F5] px-1.5 py-0.5 rounded">
                        {metrics.totalReturnedAssignments} Total
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5EBE6] text-xs">
                      {metrics.recentReturns.length === 0 ? (
                        <p className="text-[11px] text-[#94A3B8] italic py-2">No returns recorded yet.</p>
                      ) : (
                        metrics.recentReturns.slice(0, 3).map((a) => (
                          <div key={a.id} className="py-2 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-[#172A21]">{a.equipmentTag}</div>
                              <div className="text-[10px] text-[#64748B]">From: {a.employeeName}</div>
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {a.returnDate ? new Date(a.returnDate).toLocaleDateString() : 'Returned'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Transfers */}
                  <div className="p-3.5 bg-white rounded border border-[#E5EBE6] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#172A21]">
                        <Layers className="w-4 h-4 text-[#3B82F6]" />
                        <span>Recent Transfers</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#3B82F6] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                        {metrics.totalTransferredAssignments} Reassigned
                      </span>
                    </div>

                    <div className="divide-y divide-[#E5EBE6] text-xs">
                      {metrics.recentTransfers.length === 0 ? (
                        <p className="text-[11px] text-[#94A3B8] italic py-2">No custody transfers recorded.</p>
                      ) : (
                        metrics.recentTransfers.slice(0, 3).map((a) => (
                          <div key={a.id} className="py-2 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-[#172A21]">{a.equipmentTag}</div>
                              <div className="text-[10px] text-[#64748B]">
                                {a.employeeName} → {a.transferredToEmployeeName || 'New Custodian'}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {a.returnDate ? new Date(a.returnDate).toLocaleDateString() : 'Transferred'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. RECENT ACTIVITY LIST */}
                <ActivityList
                  activities={activities}
                  onSelectUnit={() => {}}
                />
              </>
            )}

            {/* VIEW: LANFORGES */}
            {activeNav === 'lanforges' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      LANforge Testbed Management
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Manage multi-station Wi-Fi traffic generators, radio hardware configurations, and IP assignments.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddLANforgeOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register LANforge</span>
                    </button>
                  )}
                </div>

                <LANforgeTable
                  data={lanforges}
                  onView={(item) => setDetailLANforge(item)}
                  onEdit={(item) => setEditLANforge(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'lanforge', id: item.id, tag: item.lanforgeId })}
                  onAddNew={() => setIsAddLANforgeOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: DESKTOPS */}
            {activeNav === 'desktops' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      Workstation & Desktop Registry
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Inventory of engineering workstations, benchtop controllers, and lab PC units.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddDesktopOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Desktop</span>
                    </button>
                  )}
                </div>

                <DesktopTable
                  data={desktops}
                  onView={(item) => setDetailDesktop(item)}
                  onEdit={(item) => setEditDesktop(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'desktop', id: item.id, tag: item.deviceId })}
                  onAddNew={() => setIsAddDesktopOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: MOBILES */}
            {activeNav === 'mobiles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      Mobile Client Fleet
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Client mobile devices for automated Wi-Fi interoperability and throughput validation.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddMobileOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Mobile</span>
                    </button>
                  )}
                </div>

                <MobileTable
                  data={mobiles}
                  onView={(item) => setDetailMobile(item)}
                  onEdit={(item) => setEditMobile(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'mobile', id: item.id, tag: item.deviceId })}
                  onAddNew={() => setIsAddMobileOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: CHAMBERS */}
            {activeNav === 'chambers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      RF & Anechoic Chamber Registry
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Manage isolation chambers, reverberation chambers, and active RF testing enclosures.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddChamberOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Chamber</span>
                    </button>
                  )}
                </div>

                <ChamberTable
                  data={chambers}
                  onView={(item) => setDetailChamber(item)}
                  onEdit={(item) => setEditChamber(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'chamber', id: item.id, tag: item.chamberId })}
                  onAddNew={() => setIsAddChamberOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: ASSIGNMENTS */}
            {activeNav === 'assignments' && (
              <AssignmentsView />
            )}

            {/* VIEW: USERS (Admin only) */}
            {activeNav === 'users' && (isAdmin ? <UsersView /> : null)}

            {/* VIEW: SETTINGS (Admin only) */}
            {activeNav === 'settings' && (isAdmin ? <SettingsView /> : null)}

            {/* VIEW: PROFILE */}
            {activeNav === 'profile' && <ProfileView />}

          </main>
        </div>
      </div>

      {/* Floating AI Assistant (Bottom-Right Support Chatbot) */}
      <AIAssistantPanel
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen(!assistantOpen)}
        lanforges={lanforges}
        onViewUnit={handleViewUnit}
      />

      {/* --- MODALS & SLIDE-OVER PANELS --- */}

      {/* LANforge Modals */}
      <LANforgeDetailPanel
        item={detailLANforge}
        isOpen={Boolean(detailLANforge)}
        onClose={() => setDetailLANforge(null)}
        onEdit={(item) => {
          setDetailLANforge(null);
          setEditLANforge(item);
        }}
        onArchive={(item) => {
          setDetailLANforge(null);
          setArchiveTarget({ category: 'lanforge', id: item.id, tag: item.lanforgeId });
        }}
        isAdmin={isAdmin}
      />

      <AddEditLANforgeModal
        isOpen={isAddLANforgeOpen || Boolean(editLANforge)}
        initialItem={editLANforge}
        onClose={() => {
          setIsAddLANforgeOpen(false);
          setEditLANforge(null);
        }}
        onSave={async (data, radios) => {
          if (editLANforge) {
            return await updateLANforge(editLANforge.id, data, radios);
          } else {
            return await addLANforge({ ...data, radios });
          }
        }}
      />

      {/* Desktop Modals */}
      <DesktopDetailPanel
        item={detailDesktop}
        isOpen={Boolean(detailDesktop)}
        onClose={() => setDetailDesktop(null)}
        onEdit={(item) => {
          setDetailDesktop(null);
          setEditDesktop(item);
        }}
        onArchive={(item) => {
          setDetailDesktop(null);
          setArchiveTarget({ category: 'desktop', id: item.id, tag: item.deviceId });
        }}
        isAdmin={isAdmin}
      />

      <AddEditDesktopModal
        isOpen={isAddDesktopOpen || Boolean(editDesktop)}
        initialItem={editDesktop}
        onClose={() => {
          setIsAddDesktopOpen(false);
          setEditDesktop(null);
        }}
        onSave={async (data) => {
          if (editDesktop) {
            return await updateDesktop(editDesktop.id, data);
          } else {
            return await addDesktop(data);
          }
        }}
      />

      {/* Mobile Modals */}
      <MobileDetailPanel
        item={detailMobile}
        isOpen={Boolean(detailMobile)}
        onClose={() => setDetailMobile(null)}
        onEdit={(item) => {
          setDetailMobile(null);
          setEditMobile(item);
        }}
        onArchive={(item) => {
          setDetailMobile(null);
          setArchiveTarget({ category: 'mobile', id: item.id, tag: item.deviceId });
        }}
        isAdmin={isAdmin}
      />

      <AddEditMobileModal
        isOpen={isAddMobileOpen || Boolean(editMobile)}
        initialItem={editMobile}
        onClose={() => {
          setIsAddMobileOpen(false);
          setEditMobile(null);
        }}
        onSave={async (data) => {
          if (editMobile) {
            return await updateMobile(editMobile.id, data);
          } else {
            return await addMobile(data);
          }
        }}
      />

      {/* Chamber Modals */}
      <ChamberDetailPanel
        item={detailChamber}
        isOpen={Boolean(detailChamber)}
        onClose={() => setDetailChamber(null)}
        onEdit={(item) => {
          setDetailChamber(null);
          setEditChamber(item);
        }}
        onArchive={(item) => {
          setDetailChamber(null);
          setArchiveTarget({ category: 'chamber', id: item.id, tag: item.chamberId });
        }}
        isAdmin={isAdmin}
      />

      <AddEditChamberModal
        isOpen={isAddChamberOpen || Boolean(editChamber)}
        initialItem={editChamber}
        onClose={() => {
          setIsAddChamberOpen(false);
          setEditChamber(null);
        }}
        onSave={async (data) => {
          if (editChamber) {
            return await updateChamber(editChamber.id, data);
          } else {
            return await addChamber(data);
          }
        }}
      />

      {/* Global Archive Confirmation Dialog */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none">
          <div className="w-full max-w-sm bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-sm font-bold text-[#172A21]">
                Archive {archiveTarget.category.toUpperCase()} Unit?
              </h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Are you sure you want to archive asset <strong className="text-[#172A21] font-mono">{archiveTarget.tag}</strong>? The unit will be removed from the active inventory registry.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setArchiveTarget(null)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] bg-[#F5F7F5] rounded border border-[#E5EBE6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded"
              >
                Archive Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
