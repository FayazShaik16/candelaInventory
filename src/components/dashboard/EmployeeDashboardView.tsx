'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { EquipmentCategory, ResourceCategory } from '@/types/inventory';
import { RequestResourceModal } from '../requests/RequestResourceModal';
import { INITIAL_ATTENUATORS } from '../views/AttenuatorsView';
import { 
  Radio, 
  Smartphone, 
  Monitor, 
  Box, 
  Calendar, 
  Send, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  FolderKanban, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Eye,
  Sliders,
  Cable,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';

interface CustodyItem {
  id: string;
  category: 'lanforge' | 'attenuator' | 'mobile' | 'chamber' | 'desktop';
  tag: string;
  model: string;
  project: string;
  location: string;
  status: string;
  details?: string;
}

interface EmployeeDashboardViewProps {
  onViewUnit?: (category: EquipmentCategory, id: string) => void;
}

export function EmployeeDashboardView({ onViewUnit }: EmployeeDashboardViewProps) {
  const { user } = useAuth();
  const { lanforges, desktops, mobiles, chambers, requests, assignments } = useInventory();

  // Resource Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRequestCategory, setSelectedRequestCategory] = useState<ResourceCategory>('lanforge');

  // Custody Filter Tab State
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'lanforge' | 'attenuator' | 'mobile' | 'chamber' | 'desktop'>('all');

  const handleOpenRequestModal = (category: ResourceCategory = 'lanforge') => {
    setSelectedRequestCategory(category);
    setIsRequestModalOpen(true);
  };

  // Helper function to check if item is assigned to current user
  const isAssignedToUser = (pocId?: string | null, textToCheck?: (string | undefined | null)[]) => {
    if (!user) return false;
    if (pocId && pocId === user.id) return true;
    
    // Check user full name or email in text fields
    const userName = user.full_name?.toLowerCase();
    const userEmailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : '';
    
    return (textToCheck || []).some((txt) => {
      if (!txt) return false;
      const lower = txt.toLowerCase();
      if (userName && (lower.includes(userName) || userName.includes(lower))) return true;
      if (userEmailPrefix && lower.includes(userEmailPrefix)) return true;
      return false;
    });
  };

  // 1. LANforges in custody
  const myLanforges = useMemo(() => {
    return lanforges.filter((l) => 
      !l.isArchived && 
      (isAssignedToUser(l.pocId, [l.comments, l.project, l.pocName]) ||
       assignments.some((a) => a.equipmentId === l.id && a.status === 'active' && 
         (a.employeeId === user?.id || (user?.email && a.employeeEmail === user.email) || (user?.full_name && a.employeeName.toLowerCase().includes(user.full_name.toLowerCase())))))
    );
  }, [lanforges, assignments, user]);

  // 2. Attenuators in custody (Matched from INITIAL_ATTENUATORS)
  const myAttenuators = useMemo(() => {
    return INITIAL_ATTENUATORS.filter((a) => 
      a.status === 'In-Use' && 
      isAssignedToUser(null, [a.custodian, a.project])
    );
  }, [user]);

  // 3. Real Devices (Mobiles) in custody
  const myMobiles = useMemo(() => {
    return mobiles.filter((m) => 
      !m.isArchived && 
      (isAssignedToUser(m.pocId, [m.project, m.pocName]) ||
       assignments.some((a) => a.equipmentId === m.id && a.status === 'active' && 
         (a.employeeId === user?.id || (user?.email && a.employeeEmail === user.email))))
    );
  }, [mobiles, assignments, user]);

  // 4. Chambers in custody
  const myChambers = useMemo(() => {
    return chambers.filter((c) => 
      !c.isArchived && 
      (isAssignedToUser(c.usedById, [c.project, c.usedByName]) ||
       assignments.some((a) => a.equipmentId === c.id && a.status === 'active' && 
         (a.employeeId === user?.id || (user?.email && a.employeeEmail === user.email))))
    );
  }, [chambers, assignments, user]);

  // 5. Desktops in custody (optional secondary)
  const myDesktops = useMemo(() => {
    return desktops.filter((d) => 
      !d.isArchived && 
      (isAssignedToUser(d.pocId, [d.project, d.pocName]) ||
       assignments.some((a) => a.equipmentId === d.id && a.status === 'active' && 
         (a.employeeId === user?.id || (user?.email && a.employeeEmail === user.email))))
    );
  }, [desktops, assignments, user]);

  // Combined equipment list in custody
  const allMyEquipment = useMemo(() => {
    const list: CustodyItem[] = [];

    myLanforges.forEach((l) => {
      list.push({
        id: l.id,
        category: 'lanforge',
        tag: l.lanforgeId,
        model: l.lanforgeModel,
        project: l.project || 'Testing Campaign',
        location: l.location || 'Lab Rack',
        status: l.status || 'In-Use',
        details: `${l.radios?.length || 0} Radios Configured`,
      });
    });

    myAttenuators.forEach((a) => {
      list.push({
        id: a.id,
        category: 'attenuator',
        tag: a.tag,
        model: a.model,
        project: a.project || 'RF Pathloss',
        location: a.location || 'Benchtop Stand',
        status: a.status || 'In-Use',
        details: `${a.channels} • ${a.attenuationRange}`,
      });
    });

    myMobiles.forEach((m) => {
      list.push({
        id: m.id,
        category: 'mobile',
        tag: m.deviceId,
        model: `${m.deviceBrand} ${m.model}`,
        project: m.project || 'Client QA',
        location: 'Device Test Bay',
        status: m.status || 'In-Use',
        details: `${m.deviceBrand} Station Client`,
      });
    });

    myChambers.forEach((c) => {
      list.push({
        id: c.id,
        category: 'chamber',
        tag: c.chamberId,
        model: c.chamberType,
        project: c.project || 'RF Isolation',
        location: c.chamberType.includes('VINSR') ? 'VINSR Chamber Bay' : 'OPEL Lab Chamber Room',
        status: c.status || 'In-Use',
        details: c.chamberType,
      });
    });

    myDesktops.forEach((d) => {
      list.push({
        id: d.id,
        category: 'mobile',
        tag: d.deviceId,
        model: `${d.deviceBrand} ${d.model}`,
        project: d.project || 'Bench Controller',
        location: 'Engineering Bench',
        status: d.status || 'In-Use',
        details: `${d.deviceBrand} Test Desktop`,
      });
    });

    return list;
  }, [myLanforges, myAttenuators, myMobiles, myChambers, myDesktops]);

  // Filtered equipment based on tab
  const filteredEquipment = useMemo(() => {
    if (equipmentFilter === 'all') return allMyEquipment;
    return allMyEquipment.filter((item) => item.category === equipmentFilter);
  }, [allMyEquipment, equipmentFilter]);

  // Filter requests submitted by this user
  const myRequests = useMemo(() => {
    return (requests || []).filter((r) => 
      r.employeeId === user?.id || 
      (user?.email && r.employeeEmail?.toLowerCase() === user.email.toLowerCase())
    );
  }, [requests, user]);

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');

  // Category Icon & Color Mapping
  const getCategoryMeta = (cat: 'lanforge' | 'attenuator' | 'mobile' | 'chamber' | 'desktop') => {
    switch (cat) {
      case 'lanforge':
        return {
          label: 'LANforge',
          icon: Radio,
          badgeColor: 'bg-[#EBF4EF] text-[#247A51] border-[#D5E9DE]',
          iconColor: 'text-[#247A51]',
        };
      case 'attenuator':
        return {
          label: 'Attenuator',
          icon: Sliders,
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          iconColor: 'text-[#0369A1]',
        };
      case 'mobile':
        return {
          label: 'Real Device',
          icon: Smartphone,
          badgeColor: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
          iconColor: 'text-[#7C3AED]',
        };
      case 'chamber':
        return {
          label: 'Chamber',
          icon: Box,
          badgeColor: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
          iconColor: 'text-[#D97706]',
        };
      case 'desktop':
        return {
          label: 'Desktop PC',
          icon: Monitor,
          badgeColor: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
          iconColor: 'text-[#475569]',
        };
    }
  };

  return (
    <div className="space-y-6 text-[#172A21] pb-12">
      {/* 1. Header & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5EBE6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
              Welcome back, {user?.full_name || 'Candela Engineer'} 👋
            </h1>
            <span className="text-[10px] font-semibold bg-[#EBF4EF] text-[#247A51] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
              Employee Custody Portal
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor all laboratory hardware currently in your custody and request test resources for your active campaigns.
          </p>
        </div>

        {/* Global Request Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenRequestModal('lanforge')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Resource</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Resource Request Action Cards Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#247A51]" />
            <h2 className="text-sm font-bold text-[#172A21]">Request Lab Resources</h2>
          </div>
          <span className="text-[11px] text-[#64748B]">Click any category below to request equipment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: LANforges */}
          <div 
            onClick={() => handleOpenRequestModal('lanforge')}
            className="group bg-white border border-[#E5EBE6] hover:border-[#247A51] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-none hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#EBF4EF] group-hover:bg-[#247A51] group-hover:text-white text-[#247A51] flex items-center justify-center transition-colors">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F7F5] text-[#64748B] group-hover:bg-[#EBF4EF] group-hover:text-[#247A51]">
                  Testbed
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#172A21] group-hover:text-[#247A51] transition-colors">
                LANforges
              </h3>
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                Wi-Fi 6E/7 multi-station traffic generators and test chassis.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F0F4F1] flex items-center justify-between text-xs font-semibold text-[#247A51]">
              <span>Request LANforge</span>
              <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Attenuators */}
          <div 
            onClick={() => handleOpenRequestModal('attenuator')}
            className="group bg-white border border-[#E5EBE6] hover:border-[#0369A1] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-none hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#E0F2FE] group-hover:bg-[#0369A1] group-hover:text-white text-[#0369A1] flex items-center justify-center transition-colors">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F7F5] text-[#64748B] group-hover:bg-[#E0F2FE] group-hover:text-[#0369A1]">
                  RF Matrix
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#172A21] group-hover:text-[#0369A1] transition-colors">
                Attenuators
              </h3>
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                CAN-ATT 8x8 & 4x4 programmable step attenuator banks.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F0F4F1] flex items-center justify-between text-xs font-semibold text-[#0369A1]">
              <span>Request Attenuator</span>
              <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Chambers */}
          <div 
            onClick={() => handleOpenRequestModal('chamber')}
            className="group bg-white border border-[#E5EBE6] hover:border-[#D97706] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-none hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] group-hover:bg-[#D97706] group-hover:text-white text-[#D97706] flex items-center justify-center transition-colors">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F7F5] text-[#64748B] group-hover:bg-[#FEF3C7] group-hover:text-[#D97706]">
                  RF Isolation
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#172A21] group-hover:text-[#D97706] transition-colors">
                Chambers
              </h3>
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                RF shielded enclosures and OTA anechoic test chambers.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F0F4F1] flex items-center justify-between text-xs font-semibold text-[#D97706]">
              <span>Request Chamber</span>
              <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Real Devices */}
          <div 
            onClick={() => handleOpenRequestModal('mobile')}
            className="group bg-white border border-[#E5EBE6] hover:border-[#7C3AED] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-none hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] group-hover:bg-[#7C3AED] group-hover:text-white text-[#7C3AED] flex items-center justify-center transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F7F5] text-[#64748B] group-hover:bg-[#F5F3FF] group-hover:text-[#7C3AED]">
                  Station Client
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#172A21] group-hover:text-[#7C3AED] transition-colors">
                Real Devices
              </h3>
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                Android & iOS mobile client smartphones for interop testing.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F0F4F1] flex items-center justify-between text-xs font-semibold text-[#7C3AED]">
              <span>Request Real Device</span>
              <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Custody Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">LANforges In Custody</span>
            <span className="text-xl font-bold text-[#172A21] font-mono mt-0.5 block">{myLanforges.length}</span>
          </div>
          <div className="p-2 bg-[#EBF4EF] text-[#247A51] rounded-lg">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Attenuators In Custody</span>
            <span className="text-xl font-bold text-[#172A21] font-mono mt-0.5 block">{myAttenuators.length}</span>
          </div>
          <div className="p-2 bg-[#E0F2FE] text-[#0369A1] rounded-lg">
            <Sliders className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Chambers Allocated</span>
            <span className="text-xl font-bold text-[#172A21] font-mono mt-0.5 block">{myChambers.length}</span>
          </div>
          <div className="p-2 bg-[#FEF3C7] text-[#D97706] rounded-lg">
            <Box className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Real Devices In Custody</span>
            <span className="text-xl font-bold text-[#172A21] font-mono mt-0.5 block">{myMobiles.length + myDesktops.length}</span>
          </div>
          <div className="p-2 bg-[#F5F3FF] text-[#7C3AED] rounded-lg">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. Main Section: All Units Currently In Your Custody */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl shadow-none overflow-hidden">
        {/* Table Toolbar & Category Filter Tabs */}
        <div className="p-4 border-b border-[#E5EBE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F9FAF9]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#247A51]" />
              <span>All Hardware In Your Custody ({allMyEquipment.length})</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Complete inventory of LANforges, Attenuators, Chambers, and Real Devices checked out to you.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#E5EBE6] p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setEquipmentFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'all' ? 'bg-white text-[#172A21] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              All ({allMyEquipment.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('lanforge')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'lanforge' ? 'bg-white text-[#247A51] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              LANforges ({myLanforges.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('attenuator')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'attenuator' ? 'bg-white text-[#0369A1] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Attenuators ({myAttenuators.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('chamber')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'chamber' ? 'bg-white text-[#D97706] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Chambers ({myChambers.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('mobile')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'mobile' ? 'bg-white text-[#7C3AED] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Real Devices ({myMobiles.length + myDesktops.length})
            </button>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21] font-semibold">
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3">Asset Tag / ID</th>
                <th className="py-2.5 px-3">Hardware Model & Specs</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Project / Campaign</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item, idx) => {
                  const meta = getCategoryMeta(item.category);
                  const Icon = meta.icon;
                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-[#F9FAF9] transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-[#64748B] font-mono">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#247A51]">
                          {item.tag}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#172A21]">{item.model}</div>
                        {item.details && (
                          <div className="text-[11px] text-[#64748B] mt-0.5">{item.details}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block bg-[#EBF4EF] text-[#247A51] px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase">
                          {item.project}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          <span>{item.location}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>In Custody</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.category !== 'attenuator' && onViewUnit ? (
                          <button
                            type="button"
                            onClick={() => onViewUnit(item.category as EquipmentCategory, item.id)}
                            className="px-2.5 py-1 text-xs text-[#247A51] hover:bg-[#EBF4EF] rounded transition-colors inline-flex items-center gap-1 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] font-mono">Assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    <div className="w-10 h-10 rounded-full bg-[#EBF4EF] text-[#247A51] flex items-center justify-center mx-auto mb-2">
                      <Layers className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-xs text-[#172A21]">
                      No {equipmentFilter === 'all' ? 'hardware units' : equipmentFilter} currently in your custody
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Need a LANforge testbed, attenuator, RF chamber, or real device for your testing project?
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(equipmentFilter === 'all' ? 'lanforge' : equipmentFilter === 'desktop' ? 'desktop' : equipmentFilter as ResourceCategory)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Equipment Now</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Resource Request Activity Tracker */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl shadow-none overflow-hidden">
        <div className="p-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" />
              <span>Your Resource Requests ({myRequests.length})</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Live status tracker for equipment requests submitted to lab administration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenRequestModal('lanforge')}
            className="text-xs font-semibold text-[#247A51] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21] font-semibold">
                <th className="py-2.5 px-3 text-center w-24">Req ID</th>
                <th className="py-2.5 px-3">Resource Type</th>
                <th className="py-2.5 px-3">Target Specs</th>
                <th className="py-2.5 px-3">Project & Purpose</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Assigned Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {myRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F9FAF9] transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-semibold text-[#64748B]">
                    {req.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#172A21]">
                    {req.resourceLabel}
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">
                    {req.targetSpecs || 'Standard configuration'}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <span className="font-semibold text-[#247A51] font-mono text-[10px]">
                      {req.project}
                    </span>
                    <p className="text-[#172A21] text-[11px] truncate mt-0.5">{req.purpose}</p>
                  </td>
                  <td className="py-3 px-3 text-[#64748B]">
                    {req.duration}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Pending Review</span>
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Approved</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-2 py-0.5 rounded-full">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>Declined</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#247A51]">
                    {req.assignedAssetTag ? (
                      <span className="bg-[#EBF4EF] px-2 py-0.5 rounded border border-[#D5E9DE]">
                        {req.assignedAssetTag}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8] font-sans font-normal text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {myRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B] text-xs">
                    No requests submitted yet. Use the quick request cards above to request lab equipment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Resource Request Modal */}
      <RequestResourceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultCategory={selectedRequestCategory}
      />
    </div>
  );
}
