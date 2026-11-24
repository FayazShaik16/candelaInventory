'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { EquipmentCategory } from '@/types/inventory';
import { RequestResourceModal } from '../requests/RequestResourceModal';
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
  Cable
} from 'lucide-react';

interface EmployeeDashboardViewProps {
  onViewUnit: (category: EquipmentCategory, id: string) => void;
  onNavigateToRequests: () => void;
}

export function EmployeeDashboardView({ onViewUnit, onNavigateToRequests }: EmployeeDashboardViewProps) {
  const { user } = useAuth();
  const { lanforges, desktops, mobiles, chambers, requests } = useInventory();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | EquipmentCategory>('all');

  // Filter hardware currently assigned to this user
  const myLanforges = useMemo(() => {
    return lanforges.filter((l) => l.pocId === user?.id && !l.isArchived);
  }, [lanforges, user?.id]);

  const myDesktops = useMemo(() => {
    return desktops.filter((d) => d.pocId === user?.id && !d.isArchived);
  }, [desktops, user?.id]);

  const myMobiles = useMemo(() => {
    return mobiles.filter((m) => m.pocId === user?.id && !m.isArchived);
  }, [mobiles, user?.id]);

  const myChambers = useMemo(() => {
    return chambers.filter((c) => c.usedById === user?.id && !c.isArchived);
  }, [chambers, user?.id]);

  // Combined equipment list
  const allMyEquipment = useMemo(() => {
    const list: Array<{
      id: string;
      category: EquipmentCategory;
      tag: string;
      model: string;
      project: string;
      status: string;
    }> = [];

    myLanforges.forEach((l) => {
      list.push({
        id: l.id,
        category: 'lanforge',
        tag: l.lanforgeId,
        model: l.lanforgeModel,
        project: l.project,
        status: l.status,
      });
    });

    myDesktops.forEach((d) => {
      list.push({
        id: d.id,
        category: 'desktop',
        tag: d.deviceId,
        model: `${d.deviceBrand} ${d.model}`,
        project: d.project,
        status: d.status,
      });
    });

    myMobiles.forEach((m) => {
      list.push({
        id: m.id,
        category: 'mobile',
        tag: m.deviceId,
        model: `${m.deviceBrand} ${m.model}`,
        project: m.project,
        status: m.status,
      });
    });

    myChambers.forEach((c) => {
      list.push({
        id: c.id,
        category: 'chamber',
        tag: c.chamberId,
        model: c.chamberType,
        project: c.project,
        status: c.status,
      });
    });

    return list;
  }, [myLanforges, myDesktops, myMobiles, myChambers]);

  // Filtered equipment based on active subcategory tab
  const filteredEquipment = useMemo(() => {
    if (equipmentFilter === 'all') return allMyEquipment;
    return allMyEquipment.filter((item) => item.category === equipmentFilter);
  }, [allMyEquipment, equipmentFilter]);

  // Filter requests submitted by this user
  const myRequests = useMemo(() => {
    return (requests || []).filter((r) => r.employeeId === user?.id);
  }, [requests, user?.id]);

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');

  // Distinct projects
  const myProjects = useMemo(() => {
    const set = new Set(allMyEquipment.map((e) => e.project).filter(Boolean));
    return Array.from(set);
  }, [allMyEquipment]);

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'lanforge':
        return <Radio className="w-3.5 h-3.5 text-[#247A51]" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />;
      case 'chamber':
        return <Box className="w-3.5 h-3.5 text-[#D97706]" />;
    }
  };

  const getCategoryLabel = (category: EquipmentCategory) => {
    switch (category) {
      case 'lanforge':
        return 'LANforge';
      case 'desktop':
        return 'Desktop';
      case 'mobile':
        return 'Mobile Client';
      case 'chamber':
        return 'RF Chamber';
    }
  };

  return (
    <div className="space-y-6 text-[#172A21]">
      {/* 1. Executive Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E5EBE6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
              Welcome back, {user?.full_name || 'Candela Engineer'} 👋
            </h1>
            <span className="text-[10px] font-semibold bg-[#EBF4EF] text-[#247A51] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
              Employee Portal
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monitor your hardware custody, track active testbeds, and request lab resources for your campaigns.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Resource</span>
          </button>
        </div>
      </div>

      {/* 2. Personalized Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Active Custody */}
        <div className="bg-white p-4 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Active Custody</span>
            <span className="text-2xl font-bold text-[#172A21] font-mono mt-0.5 block">
              {allMyEquipment.length}
            </span>
            <span className="text-[10px] text-[#247A51] mt-0.5 block">
              Units currently in your custody
            </span>
          </div>
          <div className="p-2.5 bg-[#EBF4EF] text-[#247A51] rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-4 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#D97706] block">Pending Requests</span>
            <span className="text-2xl font-bold text-[#D97706] font-mono mt-0.5 block">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 block">
              Awaiting admin review
            </span>
          </div>
          <div className="p-2.5 bg-[#FEF3C7] text-[#D97706] rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Approved Requests */}
        <div className="bg-white p-4 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#247A51] block">Approved Allocations</span>
            <span className="text-2xl font-bold text-[#247A51] font-mono mt-0.5 block">
              {approvedRequests.length}
            </span>
            <span className="text-[10px] text-[#247A51] mt-0.5 block">
              Fulfilled hardware requests
            </span>
          </div>
          <div className="p-2.5 bg-[#EBF4EF] text-[#247A51] rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-4 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Active Campaigns</span>
            <span className="text-2xl font-bold text-[#172A21] font-mono mt-0.5 block">
              {myProjects.length || 1}
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 block truncate max-w-[140px]">
              {myProjects.join(', ') || 'Internal QA'}
            </span>
          </div>
          <div className="p-2.5 bg-[#F5F7F5] text-[#172A21] rounded-lg">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Section: Hardware In Your Custody */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl shadow-none overflow-hidden">
        <div className="p-4 border-b border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F9FAF9]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#247A51]" />
              <span>Hardware Currently In Your Custody ({allMyEquipment.length})</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Active testbeds, devices, workstations, and chambers currently allocated to you.
            </p>
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-1 bg-[#E5EBE6] p-0.5 rounded-lg text-xs self-start sm:self-auto">
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
                equipmentFilter === 'lanforge' ? 'bg-white text-[#247A51] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              LANforges ({myLanforges.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('mobile')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'mobile' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Mobiles ({myMobiles.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('desktop')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'desktop' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Desktops ({myDesktops.length})
            </button>
            <button
              type="button"
              onClick={() => setEquipmentFilter('chamber')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                equipmentFilter === 'chamber' ? 'bg-white text-[#D97706] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Chambers ({myChambers.length})
            </button>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21] font-semibold">
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3">Asset Tag / ID</th>
                <th className="py-2.5 px-3">Hardware Model</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onViewUnit(item.category, item.id)}
                    className="hover:bg-[#F9FAF9] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 text-center text-[#64748B] font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#247A51]">
                      {item.tag}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#172A21]">
                      {item.model}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-[#172A21]">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{getCategoryLabel(item.category)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block bg-[#EBF4EF] text-[#247A51] px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase">
                        {item.project || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>In-Use</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewUnit(item.category, item.id);
                        }}
                        className="px-2 py-1 text-xs text-[#247A51] hover:bg-[#EBF4EF] rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="w-10 h-10 rounded-full bg-[#EBF4EF] text-[#247A51] flex items-center justify-center mx-auto mb-2">
                      <Layers className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-xs text-[#172A21]">No hardware currently in your custody</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Need a LANforge testbed, mobile device, attenuator, or chamber for your project?
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors"
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

      {/* 4. Section: My Resource Requests */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl shadow-none overflow-hidden">
        <div className="p-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div>
            <h2 className="text-sm font-bold text-[#172A21] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" />
              <span>Your Resource Requests ({myRequests.length})</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Status of your requests submitted to the lab operations team.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToRequests}
            className="text-xs font-semibold text-[#247A51] hover:underline flex items-center gap-1"
          >
            <span>View Full Requests History</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
              {myRequests.slice(0, 5).map((req) => (
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
                    No requests submitted yet. Click <strong>Request Resource</strong> above to request hardware.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Request Modal */}
      <RequestResourceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
