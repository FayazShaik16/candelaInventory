'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  LANforgeItem, 
  DesktopItem, 
  MobileItem, 
  ChamberItem, 
  EquipmentAssignment,
  ActivityLog,
  EquipmentCategory,
  AssignmentStatus,
  EmployeeEquipmentSummary,
  GlobalInventoryStatus,
  LANforgeLocation,
  LANforgeRadio
} from '@/types/inventory';
import { 
  INITIAL_LANFORGES, 
  INITIAL_DESKTOPS, 
  INITIAL_MOBILES, 
  INITIAL_CHAMBERS, 
  INITIAL_ASSIGNMENTS,
  INITIAL_ACTIVITY_LOGS 
} from '@/data/inventorySeed';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';

interface InventoryContextType {
  lanforges: LANforgeItem[];
  desktops: DesktopItem[];
  mobiles: MobileItem[];
  chambers: ChamberItem[];
  assignments: EquipmentAssignment[];
  activityLogs: ActivityLog[];
  isLoading: boolean;

  // Real live database metrics
  metrics: {
    totalLANforges: number;
    totalDesktops: number;
    totalMobiles: number;
    totalChambers: number;
    totalAvailable: number;
    totalInUse: number;
    totalUnderMaintenance: number;
    totalUnits: number;
    totalActiveAssignments: number;
    totalReturnedAssignments: number;
    totalTransferredAssignments: number;
    recentAssignments: EquipmentAssignment[];
    recentReturns: EquipmentAssignment[];
    recentTransfers: EquipmentAssignment[];
  };

  // CRUD LANforge
  addLANforge: (data: Omit<LANforgeItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived' | 'previouslyUsedBy'>) => Promise<{ success: boolean; error?: string }>;
  updateLANforge: (id: string, updates: Partial<LANforgeItem>, radios?: LANforgeRadio[]) => Promise<{ success: boolean; error?: string }>;
  archiveLANforge: (id: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Desktop
  addDesktop: (data: Omit<DesktopItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => Promise<{ success: boolean; error?: string }>;
  updateDesktop: (id: string, updates: Partial<DesktopItem>) => Promise<{ success: boolean; error?: string }>;
  archiveDesktop: (id: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Mobile
  addMobile: (data: Omit<MobileItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => Promise<{ success: boolean; error?: string }>;
  updateMobile: (id: string, updates: Partial<MobileItem>) => Promise<{ success: boolean; error?: string }>;
  archiveMobile: (id: string) => Promise<{ success: boolean; error?: string }>;

  // CRUD Chamber
  addChamber: (data: Omit<ChamberItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => Promise<{ success: boolean; error?: string }>;
  updateChamber: (id: string, updates: Partial<ChamberItem>) => Promise<{ success: boolean; error?: string }>;
  archiveChamber: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Phase 4 Workflows: Assignment, Return & Atomic Transfer
  assignEquipment: (
    category: EquipmentCategory, 
    equipmentId: string, 
    employeeId: string, 
    notes?: string,
    assignedDate?: string
  ) => Promise<{ success: boolean; error?: string }>;

  returnEquipment: (
    category: EquipmentCategory, 
    equipmentId: string, 
    notes?: string,
    returnDate?: string,
    markUnderMaintenance?: boolean
  ) => Promise<{ success: boolean; error?: string }>;

  transferEquipment: (
    category: EquipmentCategory,
    equipmentId: string,
    toEmployeeId: string,
    notes?: string,
    transferDate?: string
  ) => Promise<{ success: boolean; error?: string }>;

  // History & Query Helpers
  getEquipmentHistory: (category: EquipmentCategory, equipmentId: string) => {
    assignments: EquipmentAssignment[];
    activities: ActivityLog[];
  };

  getEmployeeEquipment: (employeeId: string) => EmployeeEquipmentSummary;

  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  lanforges: 'candela_db_lanforges',
  desktops: 'candela_db_desktops',
  mobiles: 'candela_db_mobiles',
  chambers: 'candela_db_chambers',
  assignments: 'candela_db_assignments',
  activityLogs: 'candela_db_activity_logs',
};

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user, usersList } = useAuth();

  const [lanforges, setLanforges] = useState<LANforgeItem[]>(INITIAL_LANFORGES);
  const [desktops, setDesktops] = useState<DesktopItem[]>(INITIAL_DESKTOPS);
  const [mobiles, setMobiles] = useState<MobileItem[]>(INITIAL_MOBILES);
  const [chambers, setChambers] = useState<ChamberItem[]>(INITIAL_CHAMBERS);
  const [assignments, setAssignments] = useState<EquipmentAssignment[]>(INITIAL_ASSIGNMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from local storage, seeds, and live database API
  useEffect(() => {
    try {
      const storedLf = localStorage.getItem(STORAGE_KEYS.lanforges);
      const storedDt = localStorage.getItem(STORAGE_KEYS.desktops);
      const storedMb = localStorage.getItem(STORAGE_KEYS.mobiles);
      const storedCh = localStorage.getItem(STORAGE_KEYS.chambers);
      const storedAsgn = localStorage.getItem(STORAGE_KEYS.assignments);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.activityLogs);

      if (storedLf) setLanforges(JSON.parse(storedLf));
      if (storedDt) setDesktops(JSON.parse(storedDt));
      if (storedMb) setMobiles(JSON.parse(storedMb));
      if (storedCh) setChambers(JSON.parse(storedCh));
      if (storedAsgn) setAssignments(JSON.parse(storedAsgn));
      if (storedLogs) setActivityLogs(JSON.parse(storedLogs));
    } catch {}

    // Fetch live inventory from database API
    let isMounted = true;
    refreshInventory().finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (!data.error) {
        if (Array.isArray(data.lanforges) && data.lanforges.length > 0) {
          setLanforges(data.lanforges);
          try { localStorage.setItem(STORAGE_KEYS.lanforges, JSON.stringify(data.lanforges)); } catch {}
        }
        if (Array.isArray(data.desktops) && data.desktops.length > 0) {
          setDesktops(data.desktops);
          try { localStorage.setItem(STORAGE_KEYS.desktops, JSON.stringify(data.desktops)); } catch {}
        }
        if (Array.isArray(data.mobiles) && data.mobiles.length > 0) {
          setMobiles(data.mobiles);
          try { localStorage.setItem(STORAGE_KEYS.mobiles, JSON.stringify(data.mobiles)); } catch {}
        }
        if (Array.isArray(data.chambers) && data.chambers.length > 0) {
          setChambers(data.chambers);
          try { localStorage.setItem(STORAGE_KEYS.chambers, JSON.stringify(data.chambers)); } catch {}
        }
        if (Array.isArray(data.assignments) && data.assignments.length > 0) {
          setAssignments(data.assignments);
          try { localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(data.assignments)); } catch {}
        }
        if (Array.isArray(data.activityLogs) && data.activityLogs.length > 0) {
          setActivityLogs(data.activityLogs);
          try { localStorage.setItem(STORAGE_KEYS.activityLogs, JSON.stringify(data.activityLogs)); } catch {}
        }
      }
    } catch (err) {
      console.warn('refreshInventory error:', err);
    }
  };

  // Sync state helpers
  const saveLanforges = (data: LANforgeItem[]) => {
    setLanforges(data);
    try { localStorage.setItem(STORAGE_KEYS.lanforges, JSON.stringify(data)); } catch {}
  };
  const saveDesktops = (data: DesktopItem[]) => {
    setDesktops(data);
    try { localStorage.setItem(STORAGE_KEYS.desktops, JSON.stringify(data)); } catch {}
  };
  const saveMobiles = (data: MobileItem[]) => {
    setMobiles(data);
    try { localStorage.setItem(STORAGE_KEYS.mobiles, JSON.stringify(data)); } catch {}
  };
  const saveChambers = (data: ChamberItem[]) => {
    setChambers(data);
    try { localStorage.setItem(STORAGE_KEYS.chambers, JSON.stringify(data)); } catch {}
  };
  const saveAssignments = (data: EquipmentAssignment[]) => {
    setAssignments(data);
    try { localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(data)); } catch {}
  };
  const saveActivityLogs = (data: ActivityLog[]) => {
    setActivityLogs(data);
    try { localStorage.setItem(STORAGE_KEYS.activityLogs, JSON.stringify(data)); } catch {}
  };

  // Append-only audit logger
  const addActivityLog = (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updated = [newLog, ...activityLogs];
    saveActivityLogs(updated);
  };

  // Helper to get employee name from ID
  const getEmployeeName = (id: string | null): string => {
    if (!id) return 'Unassigned';
    const match = usersList.find((u) => u.id === id);
    return match ? match.full_name : 'Unassigned';
  };

  // Helper to derive Previously Used By from assignment history (never manual)
  const getPreviouslyUsedBy = (equipmentId: string): string[] => {
    const historical = assignments
      .filter((a) => a.equipmentId === equipmentId && (a.status === 'returned' || a.status === 'transferred'))
      .map((a) => a.employeeName);
    return Array.from(new Set(historical));
  };

  // Synchronize dynamic references whenever usersList or assignments change
  const enrichedLANforges = useMemo(() => {
    return lanforges.map((lf) => ({
      ...lf,
      pocName: getEmployeeName(lf.pocId),
      previouslyUsedBy: getPreviouslyUsedBy(lf.id),
    }));
  }, [lanforges, usersList, assignments]);

  const enrichedDesktops = useMemo(() => {
    return desktops.map((dt) => ({
      ...dt,
      pocName: getEmployeeName(dt.pocId),
    }));
  }, [desktops, usersList]);

  const enrichedMobiles = useMemo(() => {
    return mobiles.map((mb) => ({
      ...mb,
      pocName: getEmployeeName(mb.pocId),
    }));
  }, [mobiles, usersList]);

  const enrichedChambers = useMemo(() => {
    return chambers.map((ch) => ({
      ...ch,
      usedByName: getEmployeeName(ch.usedById),
    }));
  }, [chambers, usersList]);

  // Real Database Metrics Computation
  const metrics = useMemo(() => {
    const activeLf = lanforges.filter((i) => !i.isArchived);
    const activeDt = desktops.filter((i) => !i.isArchived);
    const activeMb = mobiles.filter((i) => !i.isArchived);
    const activeCh = chambers.filter((i) => !i.isArchived);

    const allUnits = [...activeLf, ...activeDt, ...activeMb, ...activeCh];
    const totalUnits = allUnits.length;
    const totalAvailable = allUnits.filter((u) => u.status === 'Available').length;
    const totalInUse = allUnits.filter((u) => u.status === 'In-Use').length;
    const totalUnderMaintenance = allUnits.filter((u) => u.status === 'Under Maintenance').length;

    const activeAssignments = assignments.filter((a) => a.status === 'active');
    const returnedAssignments = assignments.filter((a) => a.status === 'returned');
    const transferredAssignments = assignments.filter((a) => a.status === 'transferred');

    return {
      totalLANforges: activeLf.length,
      totalDesktops: activeDt.length,
      totalMobiles: activeMb.length,
      totalChambers: activeCh.length,
      totalAvailable,
      totalInUse,
      totalUnderMaintenance,
      totalUnits,
      totalActiveAssignments: activeAssignments.length,
      totalReturnedAssignments: returnedAssignments.length,
      totalTransferredAssignments: transferredAssignments.length,
      recentAssignments: activeAssignments.slice(0, 5),
      recentReturns: returnedAssignments.slice(0, 5),
      recentTransfers: transferredAssignments.slice(0, 5),
    };
  }, [lanforges, desktops, mobiles, chambers, assignments]);

  // Helper to lookup equipment by category & ID
  const findEquipment = (category: EquipmentCategory, id: string) => {
    switch (category) {
      case 'lanforge':
        return lanforges.find((i) => i.id === id);
      case 'desktop':
        return desktops.find((i) => i.id === id);
      case 'mobile':
        return mobiles.find((i) => i.id === id);
      case 'chamber':
        return chambers.find((i) => i.id === id);
      default:
        return undefined;
    }
  };

  // Helper to extract tag from equipment
  const getEquipmentTag = (category: EquipmentCategory, item: any): string => {
    if (!item) return '';
    if (category === 'lanforge') return item.lanforgeId;
    if (category === 'chamber') return item.chamberId;
    return item.deviceId || '';
  };

  // Helper to extract model from equipment
  const getEquipmentModel = (category: EquipmentCategory, item: any): string => {
    if (!item) return '';
    if (category === 'lanforge') return item.lanforgeModel;
    if (category === 'chamber') return item.chamberType;
    return `${item.deviceBrand} ${item.model}`;
  };

  // Helper to sync mutations to backend database API
  const syncMutationToApi = (action: string, payload: any) => {
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    }).catch((err) => console.warn(`Sync error for ${action}:`, err));
  };

  // -------------------------------------------------------------
  // CRUD LANforge
  // -------------------------------------------------------------
  const addLANforge = async (
    data: Omit<LANforgeItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived' | 'previouslyUsedBy'>
  ) => {
    const newId = `lf-${Date.now()}`;
    const nextSNo = lanforges.length > 0 ? Math.max(...lanforges.map((l) => l.sNo)) + 1 : 1;
    const now = new Date().toISOString();

    const newItem: LANforgeItem = {
      ...data,
      id: newId,
      sNo: nextSNo,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      previouslyUsedBy: [],
      radios: data.radios || [],
    };

    saveLanforges([newItem, ...lanforges]);
    syncMutationToApi('addLANforge', newItem);

    addActivityLog({
      unitAssetTag: newItem.lanforgeId,
      unitModel: newItem.lanforgeModel,
      inventoryCategory: 'lanforge',
      inventoryId: newItem.id,
      action: 'created',
      title: `LANforge Registered: ${newItem.lanforgeId}`,
      description: `Registered new testbed generator in location ${newItem.location}.`,
      performedBy: user?.full_name || 'Admin',
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  const updateLANforge = async (id: string, updates: Partial<LANforgeItem>, radios?: LANforgeRadio[]) => {
    const existing = lanforges.find((l) => l.id === id);
    if (!existing) return { success: false, error: 'LANforge not found' };

    const updated = lanforges.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          ...updates,
          radios: radios !== undefined ? radios : l.radios,
          updatedAt: new Date().toISOString(),
        };
      }
      return l;
    });
    saveLanforges(updated);
    syncMutationToApi('updateLANforge', { id, updates, radios });

    if (updates.status && updates.status !== existing.status) {
      addActivityLog({
        unitAssetTag: existing.lanforgeId,
        unitModel: existing.lanforgeModel,
        inventoryCategory: 'lanforge',
        inventoryId: existing.id,
        action: 'status_change',
        title: `Status Shift: ${existing.status} → ${updates.status}`,
        description: `LANforge status updated.`,
        performedBy: user?.full_name || 'Admin',
        user: {
          name: user?.full_name || 'Admin',
          role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
        },
      });
    }

    return { success: true };
  };

  const archiveLANforge = async (id: string) => {
    const target = lanforges.find((l) => l.id === id);
    const updated = lanforges.map((l) => (l.id === id ? { ...l, isArchived: true, updatedAt: new Date().toISOString() } : l));
    saveLanforges(updated);
    syncMutationToApi('archiveLANforge', { id });

    if (target) {
      addActivityLog({
        unitAssetTag: target.lanforgeId,
        unitModel: target.lanforgeModel,
        inventoryCategory: 'lanforge',
        inventoryId: target.id,
        action: 'archived',
        title: `LANforge Unit Archived: ${target.lanforgeId}`,
        description: `Removed from active inventory fleet.`,
        performedBy: user?.full_name || 'Admin',
        user: {
          name: user?.full_name || 'Admin',
          role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
        },
      });
    }
    return { success: true };
  };

  // -------------------------------------------------------------
  // CRUD Desktop
  // -------------------------------------------------------------
  const addDesktop = async (data: Omit<DesktopItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const newId = `dt-${Date.now()}`;
    const nextSNo = desktops.length > 0 ? Math.max(...desktops.map((d) => d.sNo)) + 1 : 1;
    const now = new Date().toISOString();

    const newItem: DesktopItem = {
      ...data,
      id: newId,
      sNo: nextSNo,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    saveDesktops([newItem, ...desktops]);
    syncMutationToApi('addDesktop', newItem);

    addActivityLog({
      unitAssetTag: newItem.deviceId,
      unitModel: `${newItem.deviceBrand} ${newItem.model}`,
      inventoryCategory: 'desktop',
      inventoryId: newItem.id,
      action: 'created',
      title: `Desktop Registered: ${newItem.deviceId}`,
      description: `New workstation added for project: ${newItem.project}.`,
      performedBy: user?.full_name || 'Admin',
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  const updateDesktop = async (id: string, updates: Partial<DesktopItem>) => {
    const updated = desktops.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
    saveDesktops(updated);
    syncMutationToApi('updateDesktop', { id, updates });
    return { success: true };
  };

  const archiveDesktop = async (id: string) => {
    const target = desktops.find((d) => d.id === id);
    const updated = desktops.map((d) => (d.id === id ? { ...d, isArchived: true, updatedAt: new Date().toISOString() } : d));
    saveDesktops(updated);
    syncMutationToApi('archiveDesktop', { id });

    if (target) {
      addActivityLog({
        unitAssetTag: target.deviceId,
        unitModel: `${target.deviceBrand} ${target.model}`,
        inventoryCategory: 'desktop',
        inventoryId: target.id,
        action: 'archived',
        title: `Desktop Unit Archived: ${target.deviceId}`,
        description: `Removed from active inventory.`,
        performedBy: user?.full_name || 'Admin',
        user: {
          name: user?.full_name || 'Admin',
          role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
        },
      });
    }
    return { success: true };
  };

  // -------------------------------------------------------------
  // CRUD Mobile
  // -------------------------------------------------------------
  const addMobile = async (data: Omit<MobileItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const newId = `mb-${Date.now()}`;
    const nextSNo = mobiles.length > 0 ? Math.max(...mobiles.map((m) => m.sNo)) + 1 : 1;
    const now = new Date().toISOString();

    const newItem: MobileItem = {
      ...data,
      id: newId,
      sNo: nextSNo,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    saveMobiles([newItem, ...mobiles]);
    syncMutationToApi('addMobile', newItem);

    addActivityLog({
      unitAssetTag: newItem.deviceId,
      unitModel: `${newItem.deviceBrand} ${newItem.model}`,
      inventoryCategory: 'mobile',
      inventoryId: newItem.id,
      action: 'created',
      title: `Mobile Registered: ${newItem.deviceId}`,
      description: `Client device added to test fleet.`,
      performedBy: user?.full_name || 'Admin',
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  const updateMobile = async (id: string, updates: Partial<MobileItem>) => {
    const updated = mobiles.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
    saveMobiles(updated);
    syncMutationToApi('updateMobile', { id, updates });
    return { success: true };
  };

  const archiveMobile = async (id: string) => {
    const target = mobiles.find((m) => m.id === id);
    const updated = mobiles.map((m) => (m.id === id ? { ...m, isArchived: true, updatedAt: new Date().toISOString() } : m));
    saveMobiles(updated);
    syncMutationToApi('archiveMobile', { id });

    if (target) {
      addActivityLog({
        unitAssetTag: target.deviceId,
        unitModel: `${target.deviceBrand} ${target.model}`,
        inventoryCategory: 'mobile',
        inventoryId: target.id,
        action: 'archived',
        title: `Mobile Archived: ${target.deviceId}`,
        description: `Removed from active inventory fleet.`,
        performedBy: user?.full_name || 'Admin',
        user: {
          name: user?.full_name || 'Admin',
          role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
        },
      });
    }
    return { success: true };
  };

  // -------------------------------------------------------------
  // CRUD Chamber
  // -------------------------------------------------------------
  const addChamber = async (data: Omit<ChamberItem, 'id' | 'sNo' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const newId = `ch-${Date.now()}`;
    const nextSNo = chambers.length > 0 ? Math.max(...chambers.map((c) => c.sNo)) + 1 : 1;
    const now = new Date().toISOString();

    const newItem: ChamberItem = {
      ...data,
      id: newId,
      sNo: nextSNo,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    saveChambers([newItem, ...chambers]);
    syncMutationToApi('addChamber', newItem);

    addActivityLog({
      unitAssetTag: newItem.chamberId,
      unitModel: newItem.chamberType,
      inventoryCategory: 'chamber',
      inventoryId: newItem.id,
      action: 'created',
      title: `Chamber Registered: ${newItem.chamberId}`,
      description: `New ${newItem.chamberType} entered into facility registry.`,
      performedBy: user?.full_name || 'Admin',
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  const updateChamber = async (id: string, updates: Partial<ChamberItem>) => {
    const updated = chambers.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    saveChambers(updated);
    syncMutationToApi('updateChamber', { id, updates });
    return { success: true };
  };

  const archiveChamber = async (id: string) => {
    const target = chambers.find((c) => c.id === id);
    const updated = chambers.map((c) => (c.id === id ? { ...c, isArchived: true, updatedAt: new Date().toISOString() } : c));
    saveChambers(updated);
    syncMutationToApi('archiveChamber', { id });

    if (target) {
      addActivityLog({
        unitAssetTag: target.chamberId,
        unitModel: target.chamberType,
        inventoryCategory: 'chamber',
        inventoryId: target.id,
        action: 'archived',
        title: `Chamber Archived: ${target.chamberId}`,
        description: `Removed from chamber fleet.`,
        performedBy: user?.full_name || 'Admin',
        user: {
          name: user?.full_name || 'Admin',
          role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
        },
      });
    }
    return { success: true };
  };

  // -------------------------------------------------------------
  // PHASE 4: ASSIGNMENT WORKFLOWS
  // -------------------------------------------------------------
  const assignEquipment = async (
    category: EquipmentCategory,
    equipmentId: string,
    employeeId: string,
    notes = '',
    assignedDate?: string
  ) => {
    // 1. Validate employee exists and is active
    const emp = usersList.find((u) => u.id === employeeId);
    if (!emp) return { success: false, error: 'Selected employee does not exist.' };
    if (emp.account_status !== 'active') {
      return { success: false, error: 'Cannot assign equipment to an inactive employee account.' };
    }

    // 2. Validate equipment exists and is not under maintenance
    const equipment = findEquipment(category, equipmentId);
    if (!equipment) return { success: false, error: 'Equipment not found.' };

    if (equipment.status === 'Under Maintenance') {
      return { success: false, error: 'Cannot assign equipment currently marked Under Maintenance.' };
    }

    // 3. Prevent duplicate active assignments
    const existingActive = assignments.find(
      (a) => a.equipmentCategory === category && a.equipmentId === equipmentId && a.status === 'active'
    );
    if (existingActive) {
      return {
        success: false,
        error: `Equipment already has an active assignment under ${existingActive.employeeName}. Please transfer or return it first.`,
      };
    }

    const tag = getEquipmentTag(category, equipment);
    const model = getEquipmentModel(category, equipment);
    const project = (equipment as any).project || 'Operations';
    const assignTime = assignedDate || new Date().toISOString();

    // 4. Update equipment status and custodian
    if (category === 'lanforge') {
      await updateLANforge(equipmentId, { pocId: employeeId, status: 'In-Use' });
    } else if (category === 'desktop') {
      await updateDesktop(equipmentId, { pocId: employeeId, status: 'In-Use' });
    } else if (category === 'mobile') {
      await updateMobile(equipmentId, { pocId: employeeId, status: 'In-Use' });
    } else if (category === 'chamber') {
      await updateChamber(equipmentId, { usedById: employeeId, status: 'In-Use' });
    }

    // 5. Create new assignment record (Never overwrites historical records)
    const newAsgn: EquipmentAssignment = {
      id: `asgn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      equipmentCategory: category,
      equipmentId,
      equipmentTag: tag,
      equipmentModel: model,
      project,
      employeeId,
      employeeName: emp.full_name,
      employeeEmail: emp.email,
      assignedDate: assignTime,
      returnDate: null,
      assignedBy: user?.full_name || 'Admin',
      notes,
      status: 'active',
    };

    saveAssignments([newAsgn, ...assignments]);
    syncMutationToApi('assignEquipment', { category, equipmentId, employeeId, notes, tag });

    // 6. Record append-only activity log
    addActivityLog({
      unitAssetTag: tag,
      unitModel: model,
      inventoryCategory: category,
      inventoryId: equipmentId,
      action: 'assigned',
      title: `${category.toUpperCase()} Assigned to ${emp.full_name}`,
      description: `Hardware asset ${tag} allocated to custodian ${emp.full_name}. Notes: ${notes || 'Standard allocation'}`,
      performedBy: user?.full_name || 'Admin',
      employeeId,
      employeeName: emp.full_name,
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  // -------------------------------------------------------------
  // PHASE 4: RETURN WORKFLOW
  // -------------------------------------------------------------
  const returnEquipment = async (
    category: EquipmentCategory,
    equipmentId: string,
    notes = '',
    returnDate?: string,
    markUnderMaintenance = false
  ) => {
    const equipment = findEquipment(category, equipmentId);
    if (!equipment) return { success: false, error: 'Equipment not found.' };

    const activeAsgn = assignments.find(
      (a) => a.equipmentCategory === category && a.equipmentId === equipmentId && a.status === 'active'
    );
    if (!activeAsgn) {
      return { success: false, error: 'No active assignment found for this equipment.' };
    }

    const retTime = returnDate || new Date().toISOString();
    const tag = getEquipmentTag(category, equipment);
    const model = getEquipmentModel(category, equipment);
    const targetStatus: GlobalInventoryStatus = markUnderMaintenance ? 'Under Maintenance' : 'Available';

    // 1. Update equipment record (Clear PoC/Used By, transition status)
    if (category === 'lanforge') {
      await updateLANforge(equipmentId, { pocId: null, status: targetStatus });
    } else if (category === 'desktop') {
      await updateDesktop(equipmentId, { pocId: null, status: targetStatus });
    } else if (category === 'mobile') {
      await updateMobile(equipmentId, { pocId: null, status: targetStatus });
    } else if (category === 'chamber') {
      await updateChamber(equipmentId, { usedById: null, status: targetStatus });
    }

    // 2. Close active assignment (preserve history)
    const updated = assignments.map((a) => {
      if (a.id === activeAsgn.id) {
        return {
          ...a,
          returnDate: retTime,
          returnedBy: user?.full_name || 'Admin',
          status: 'returned' as const,
          notes: notes ? (a.notes ? `${a.notes} | Return: ${notes}` : `Return: ${notes}`) : a.notes,
        };
      }
      return a;
    });
    saveAssignments(updated);
    syncMutationToApi('returnEquipment', { category, equipmentId, returnDate: retTime, notes, markUnderMaintenance });

    // 3. Record append-only audit entry
    addActivityLog({
      unitAssetTag: tag,
      unitModel: model,
      inventoryCategory: category,
      inventoryId: equipmentId,
      action: markUnderMaintenance ? 'maintenance' : 'returned',
      title: `${category.toUpperCase()} Returned by ${activeAsgn.employeeName} (${targetStatus})`,
      description: `Unit checked in from ${activeAsgn.employeeName}. Target status: ${targetStatus}. Return Notes: ${notes || 'Verified'}`,
      performedBy: user?.full_name || 'Admin',
      employeeId: activeAsgn.employeeId,
      employeeName: activeAsgn.employeeName,
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  // -------------------------------------------------------------
  // PHASE 4: ATOMIC TRANSFER WORKFLOW
  // -------------------------------------------------------------
  const transferEquipment = async (
    category: EquipmentCategory,
    equipmentId: string,
    toEmployeeId: string,
    notes = '',
    transferDate?: string
  ) => {
    // 1. Verify target employee exists and is active
    const targetEmp = usersList.find((u) => u.id === toEmployeeId);
    if (!targetEmp) return { success: false, error: 'Target employee not found.' };
    if (targetEmp.account_status !== 'active') {
      return { success: false, error: 'Cannot transfer equipment to an inactive employee account.' };
    }

    // 2. Locate active assignment
    const activeAsgn = assignments.find(
      (a) => a.equipmentCategory === category && a.equipmentId === equipmentId && a.status === 'active'
    );
    if (!activeAsgn) {
      return { success: false, error: 'No active assignment found to transfer.' };
    }

    if (activeAsgn.employeeId === toEmployeeId) {
      return { success: false, error: 'Equipment is already assigned to this employee.' };
    }

    const equipment = findEquipment(category, equipmentId);
    if (!equipment) return { success: false, error: 'Equipment not found.' };

    const transTime = transferDate || new Date().toISOString();
    const tag = getEquipmentTag(category, equipment);
    const model = getEquipmentModel(category, equipment);
    const project = (equipment as any).project || 'Operations';
    const previousEmpName = activeAsgn.employeeName;

    // 3. Atomically close active assignment as 'transferred'
    const updatedAssignments = assignments.map((a) => {
      if (a.id === activeAsgn.id) {
        return {
          ...a,
          returnDate: transTime,
          returnedBy: user?.full_name || 'Admin',
          status: 'transferred' as const,
          transferredToEmployeeId: toEmployeeId,
          transferredToEmployeeName: targetEmp.full_name,
          notes: notes ? `${a.notes} | Transferred: ${notes}` : a.notes,
        };
      }
      return a;
    });

    // 4. Create new active assignment for target employee
    const newAsgn: EquipmentAssignment = {
      id: `asgn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      equipmentCategory: category,
      equipmentId,
      equipmentTag: tag,
      equipmentModel: model,
      project,
      employeeId: toEmployeeId,
      employeeName: targetEmp.full_name,
      employeeEmail: targetEmp.email,
      assignedDate: transTime,
      returnDate: null,
      assignedBy: user?.full_name || 'Admin',
      notes: `Transferred from ${previousEmpName}. ${notes}`,
      status: 'active',
    };

    saveAssignments([newAsgn, ...updatedAssignments]);

    // 5. Update equipment current custodian (status remains 'In-Use')
    if (category === 'lanforge') {
      await updateLANforge(equipmentId, { pocId: toEmployeeId, status: 'In-Use' });
    } else if (category === 'desktop') {
      await updateDesktop(equipmentId, { pocId: toEmployeeId, status: 'In-Use' });
    } else if (category === 'mobile') {
      await updateMobile(equipmentId, { pocId: toEmployeeId, status: 'In-Use' });
    } else if (category === 'chamber') {
      await updateChamber(equipmentId, { usedById: toEmployeeId, status: 'In-Use' });
    }

    // 6. Record transfer in activity history
    addActivityLog({
      unitAssetTag: tag,
      unitModel: model,
      inventoryCategory: category,
      inventoryId: equipmentId,
      action: 'transferred',
      title: `${category.toUpperCase()} Transferred: ${previousEmpName} → ${targetEmp.full_name}`,
      description: `Custody reassigned from ${previousEmpName} to ${targetEmp.full_name}. Notes: ${notes || 'Direct transfer'}`,
      performedBy: user?.full_name || 'Admin',
      employeeId: toEmployeeId,
      employeeName: targetEmp.full_name,
      user: {
        name: user?.full_name || 'Admin',
        role: user?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    });

    return { success: true };
  };

  // -------------------------------------------------------------
  // HISTORY & EMPLOYEE SUMMARY HELPERS
  // -------------------------------------------------------------
  const getEquipmentHistory = (category: EquipmentCategory, equipmentId: string) => {
    const itemAssignments = assignments
      .filter((a) => a.equipmentCategory === category && a.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());

    const itemActivities = activityLogs
      .filter((l) => l.inventoryId === equipmentId || (l.inventoryCategory === category && l.inventoryId === equipmentId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      assignments: itemAssignments,
      activities: itemActivities,
    };
  };

  const getEmployeeEquipment = (employeeId: string): EmployeeEquipmentSummary => {
    const emp = usersList.find((u) => u.id === employeeId);
    const activeLf = lanforges.filter((lf) => lf.pocId === employeeId && lf.status === 'In-Use' && !lf.isArchived);
    const activeDt = desktops.filter((dt) => dt.pocId === employeeId && dt.status === 'In-Use' && !dt.isArchived);
    const activeMb = mobiles.filter((mb) => mb.pocId === employeeId && mb.status === 'In-Use' && !mb.isArchived);
    const activeCh = chambers.filter((ch) => ch.usedById === employeeId && ch.status === 'In-Use' && !ch.isArchived);

    const empAssignments = assignments
      .filter((a) => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());

    return {
      employeeId,
      employeeName: emp?.full_name || 'Unknown',
      employeeEmail: emp?.email || '',
      activeLANforges: activeLf,
      activeDesktops: activeDt,
      activeMobiles: activeMb,
      activeChambers: activeCh,
      totalActiveCount: activeLf.length + activeDt.length + activeMb.length + activeCh.length,
      assignmentHistory: empAssignments,
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        lanforges: enrichedLANforges,
        desktops: enrichedDesktops,
        mobiles: enrichedMobiles,
        chambers: enrichedChambers,
        assignments,
        activityLogs,
        isLoading,
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
        assignEquipment,
        returnEquipment,
        transferEquipment,
        getEquipmentHistory,
        getEmployeeEquipment,
        addActivityLog,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
