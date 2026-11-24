'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar, NavItemKey } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MetricCard } from '../dashboard/MetricCard';
import { AIAssistantPanel } from '../assistant/AIAssistantPanel';
import { AssignmentsView } from '../views/AssignmentsView';
import { UsersView } from '../views/UsersView';
import { SettingsView } from '../views/SettingsView';
import { ProfileView } from '../views/ProfileView';
import { RequestsView } from '../views/RequestsView';
import { LogsView } from '../views/LogsView';
import { AttenuatorsView } from '../views/AttenuatorsView';
import { LandingPageView } from '../dashboard/LandingPageView';
import { EmployeeDashboardView } from '../dashboard/EmployeeDashboardView';
import { RequestResourceModal } from '../requests/RequestResourceModal';

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
  ChamberItem
} from '@/types/inventory';
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

  // Navigation State with History Stack
  const [navHistory, setNavHistory] = useState<NavItemKey[]>([]);
  const [activeNav, setActiveNavState] = useState<NavItemKey>(() => {
    if (initialNav === 'users' && role === 'employee') return 'dashboard';
    return initialNav;
  });

  const setActiveNav = (newNav: NavItemKey) => {
    if (newNav === activeNav) return;
    setNavHistory((prev) => [...prev, activeNav]);
    setActiveNavState(newNav);
  };

  const handleGoBack = () => {
    if (navHistory.length > 0) {
      const prevNav = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setActiveNavState(prevNav);
    } else if (activeNav !== 'dashboard') {
      setActiveNavState('dashboard');
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  const canGoBack = navHistory.length > 0 || activeNav !== 'dashboard';

  useEffect(() => {
    if (!isAdmin && (activeNav === 'users' || activeNav === 'settings' || activeNav === 'logs')) {
      setActiveNavState('dashboard');
    }
  }, [isAdmin, activeNav]);

  useEffect(() => {
    if (initialNav && initialNav !== activeNav) {
      if (initialNav === 'users' && role === 'employee') {
        setActiveNavState('dashboard');
      } else {
        setActiveNav(initialNav);
      }
    }
  }, [initialNav]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

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

  // Resource Request Modal State
  const [isResourceRequestOpen, setIsResourceRequestOpen] = useState(false);

  // Filter hardware for custody isolation (Employees only see hardware with them)
  const userLANforges = React.useMemo(() => {
    return isAdmin ? lanforges : lanforges.filter((l) => l.pocId === user?.id && !l.isArchived);
  }, [isAdmin, lanforges, user?.id]);

  const userDesktops = React.useMemo(() => {
    return isAdmin ? desktops : desktops.filter((d) => d.pocId === user?.id && !d.isArchived);
  }, [isAdmin, desktops, user?.id]);

  const userMobiles = React.useMemo(() => {
    return isAdmin ? mobiles : mobiles.filter((m) => m.pocId === user?.id && !m.isArchived);
  }, [isAdmin, mobiles, user?.id]);

  const userChambers = React.useMemo(() => {
    return isAdmin ? chambers : chambers.filter((c) => c.usedById === user?.id && !c.isArchived);
  }, [isAdmin, chambers, user?.id]);

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
    if (!isAdmin) {
      setIsResourceRequestOpen(true);
      return;
    }
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
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[240px]'
          }`}
      >
        {/* Top Header */}
        <AppHeader
          activeNav={activeNav}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenAddUnit={handleOpenAddCurrentCategory}
          onBack={handleGoBack}
          canGoBack={canGoBack}
          onNavigateHome={() => setActiveNav('dashboard')}
        />

        {/* Center Workspace & Right Assistant Column */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 2. CENTER WORKSPACE (FLEXIBLE WIDTH) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F7F5] space-y-6">

            {/* VIEW: DASHBOARD (Landing Page: Viewport 1 Categories + Viewport 2 Status Distribution) */}
            {activeNav === 'dashboard' && (
              <LandingPageView
                onNavigate={(nav) => setActiveNav(nav)}
                onRequestResource={() => setIsResourceRequestOpen(true)}
              />
            )}

            {/* VIEW: LANFORGES */}
            {activeNav === 'lanforges' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      {isAdmin ? 'LANforge Testbed Management' : 'My Assigned LANforges'}
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      {isAdmin
                        ? 'Manage multi-station Wi-Fi traffic generators, radio hardware configurations, and IP assignments.'
                        : 'LANforge testbeds currently assigned to your project work. Need another unit? Click Request Hardware.'}
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsAddLANforgeOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register LANforge</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request LANforge</span>
                    </button>
                  )}
                </div>

                {!isAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#EBF4EF] border border-[#C2DCD0] text-xs text-[#173D30]">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#247A51]" />
                      <span>
                        {userLANforges.length === 0
                          ? 'You currently do not have any LANforge testbeds assigned in your custody.'
                          : `Displaying ${userLANforges.length} LANforge testbed${userLANforges.length === 1 ? '' : 's'} currently in your custody.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      + Request Hardware
                    </button>
                  </div>
                )}

                <LANforgeTable
                  data={userLANforges}
                  onView={(item) => setDetailLANforge(item)}
                  onEdit={(item) => setEditLANforge(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'lanforge', id: item.id, tag: item.lanforgeId })}
                  onAddNew={() => setIsAddLANforgeOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: ATTENUATORS */}
            {activeNav === 'attenuators' && (
              <AttenuatorsView onRequestResource={() => setIsResourceRequestOpen(true)} />
            )}

            {/* VIEW: DESKTOPS */}
            {activeNav === 'desktops' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
                      {isAdmin ? 'Workstation & Desktop Registry' : 'My Assigned Workstations & PCs'}
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      {isAdmin
                        ? 'Inventory of engineering workstations, benchtop controllers, and lab PC units.'
                        : 'Workstations and controllers currently assigned to you for lab execution.'}
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsAddDesktopOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Desktop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Desktop</span>
                    </button>
                  )}
                </div>

                {!isAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#EBF4EF] border border-[#C2DCD0] text-xs text-[#173D30]">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#247A51]" />
                      <span>
                        {userDesktops.length === 0
                          ? 'You currently do not have any workstations assigned in your custody.'
                          : `Displaying ${userDesktops.length} workstation unit${userDesktops.length === 1 ? '' : 's'} assigned to your custody.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      + Request Desktop
                    </button>
                  </div>
                )}

                <DesktopTable
                  data={userDesktops}
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
                      {isAdmin ? 'Mobile Client Fleet' : 'My Assigned Mobile Clients'}
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      {isAdmin
                        ? 'Client mobile devices for automated Wi-Fi interoperability and throughput validation.'
                        : 'Real test devices and smartphones currently in your custody for test campaigns.'}
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsAddMobileOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Mobile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Mobile</span>
                    </button>
                  )}
                </div>

                {!isAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#EBF4EF] border border-[#C2DCD0] text-xs text-[#173D30]">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#247A51]" />
                      <span>
                        {userMobiles.length === 0
                          ? 'You currently do not have any mobile client devices assigned in your custody.'
                          : `Displaying ${userMobiles.length} client device${userMobiles.length === 1 ? '' : 's'} assigned to your custody.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      + Request Device
                    </button>
                  </div>
                )}

                <MobileTable
                  data={userMobiles}
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
                      {isAdmin ? 'RF & Anechoic Chamber Registry' : 'My Chamber Bookings'}
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      {isAdmin
                        ? 'Manage isolation chambers, reverberation chambers, and active RF testing enclosures.'
                        : 'RF isolation and test chambers currently allocated for your campaigns.'}
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsAddChamberOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Chamber</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Chamber</span>
                    </button>
                  )}
                </div>

                {!isAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#EBF4EF] border border-[#C2DCD0] text-xs text-[#173D30]">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-[#247A51]" />
                      <span>
                        {userChambers.length === 0
                          ? 'You currently do not have any chambers allocated in your custody.'
                          : `Displaying ${userChambers.length} RF chamber${userChambers.length === 1 ? '' : 's'} allocated to your custody.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsResourceRequestOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
                    >
                      + Request Chamber
                    </button>
                  </div>
                )}

                <ChamberTable
                  data={userChambers}
                  onView={(item) => setDetailChamber(item)}
                  onEdit={(item) => setEditChamber(item)}
                  onArchive={(item) => setArchiveTarget({ category: 'chamber', id: item.id, tag: item.chamberId })}
                  onAddNew={() => setIsAddChamberOpen(true)}
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* VIEW: REQUESTS (Admin & Employee) */}
            {activeNav === 'requests' && (
              <RequestsView />
            )}

            {/* VIEW: ASSIGNMENTS */}
            {activeNav === 'assignments' && (
              <AssignmentsView />
            )}

            {/* VIEW: LOGS (Admin only) */}
            {activeNav === 'logs' && (isAdmin ? <LogsView /> : null)}

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
      {/* Employee Global Resource Request Modal */}
      <RequestResourceModal
        isOpen={isResourceRequestOpen}
        onClose={() => setIsResourceRequestOpen(false)}
      />
    </div>
  );
}
