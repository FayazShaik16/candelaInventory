'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { EquipmentRequest, EquipmentCategory, RequestStatus } from '@/types/inventory';
import { RequestResourceModal } from '../requests/RequestResourceModal';
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Radio, 
  Monitor, 
  Smartphone, 
  Box, 
  Sliders, 
  Cable, 
  User, 
  AlertCircle, 
  ArrowRightLeft, 
  Check, 
  X, 
  Loader2, 
  Plus,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export function RequestsView() {
  const { user, role, usersList } = useAuth();
  const isAdmin = role === 'admin';
  const { 
    requests, 
    lanforges, 
    desktops, 
    mobiles, 
    chambers, 
    approveAndAssignRequest, 
    transferRequest, 
    rejectRequest 
  } = useInventory();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Modals for Admin Actions
  const [assigningRequest, setAssigningRequest] = useState<EquipmentRequest | null>(null);
  const [transferringRequest, setTransferringRequest] = useState<EquipmentRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<EquipmentRequest | null>(null);

  // Form states for Assignment
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('lanforge');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Form states for Transfer
  const [transferUnitCategory, setTransferUnitCategory] = useState<EquipmentCategory>('lanforge');
  const [transferUnitId, setTransferUnitId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Form state for Reject
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter requests based on user role
  const baseRequests = useMemo(() => {
    if (isAdmin) return requests;
    return requests.filter((r) => r.employeeId === user?.id);
  }, [requests, isAdmin, user?.id]);

  const filteredRequests = useMemo(() => {
    return baseRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && r.resourceCategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRequester = r.employeeName.toLowerCase().includes(q) || r.employeeEmail.toLowerCase().includes(q);
        const matchProject = r.project.toLowerCase().includes(q);
        const matchLabel = r.resourceLabel.toLowerCase().includes(q) || (r.targetSpecs && r.targetSpecs.toLowerCase().includes(q));
        const matchId = r.id.toLowerCase().includes(q);
        const matchAssigned = r.assignedAssetTag && r.assignedAssetTag.toLowerCase().includes(q);
        return matchRequester || matchProject || matchLabel || matchId || matchAssigned;
      }
      return true;
    });
  }, [baseRequests, statusFilter, categoryFilter, searchQuery]);

  // Metrics
  const totalCount = baseRequests.length;
  const pendingCount = baseRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = baseRequests.filter((r) => r.status === 'approved').length;
  const rejectedCount = baseRequests.filter((r) => r.status === 'rejected').length;

  // Available units for quick assignment
  const getAvailableUnitsForCategory = (cat: EquipmentCategory) => {
    switch (cat) {
      case 'lanforge':
        return lanforges.filter((i) => i.status === 'Available' && !i.isArchived);
      case 'desktop':
        return desktops.filter((i) => i.status === 'Available' && !i.isArchived);
      case 'mobile':
        return mobiles.filter((i) => i.status === 'Available' && !i.isArchived);
      case 'chamber':
        return chambers.filter((i) => i.status === 'Available' && !i.isArchived);
      default:
        return [];
    }
  };

  // In-use units for transfer
  const getInUseUnitsForCategory = (cat: EquipmentCategory) => {
    switch (cat) {
      case 'lanforge':
        return lanforges.filter((i) => i.status === 'In-Use' && !i.isArchived);
      case 'desktop':
        return desktops.filter((i) => i.status === 'In-Use' && !i.isArchived);
      case 'mobile':
        return mobiles.filter((i) => i.status === 'In-Use' && !i.isArchived);
      case 'chamber':
        return chambers.filter((i) => i.status === 'In-Use' && !i.isArchived);
      default:
        return [];
    }
  };

  const openApproveModal = (req: EquipmentRequest) => {
    setAssigningRequest(req);
    setActionError('');
    const cat = (req.resourceCategory === 'attenuator' || req.resourceCategory === 'accessory') ? 'lanforge' : req.resourceCategory as EquipmentCategory;
    setSelectedCategory(cat);

    // Auto-select matching unit if available
    const available = getAvailableUnitsForCategory(cat);
    if (req.preferredAssetId && available.some((a) => a.id === req.preferredAssetId)) {
      setSelectedEquipmentId(req.preferredAssetId);
    } else if (available.length > 0) {
      setSelectedEquipmentId(available[0].id);
    } else {
      setSelectedEquipmentId('');
    }
    setAssignNotes(`Approved for ${req.project}: ${req.purpose}`);
  };

  const openTransferModal = (req: EquipmentRequest) => {
    setTransferringRequest(req);
    setActionError('');
    const cat = (req.resourceCategory === 'attenuator' || req.resourceCategory === 'accessory') ? 'lanforge' : req.resourceCategory as EquipmentCategory;
    setTransferUnitCategory(cat);

    const inUse = getInUseUnitsForCategory(cat);
    if (inUse.length > 0) {
      setTransferUnitId(inUse[0].id);
    } else {
      setTransferUnitId('');
    }
    setTransferNotes(`Transferred to ${req.employeeName} for ${req.project}`);
  };

  const openRejectModal = (req: EquipmentRequest) => {
    setRejectingRequest(req);
    setRejectionReason('Hardware currently fully allocated to critical lab campaigns.');
  };

  // Confirm Approve & Assign
  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRequest || !selectedEquipmentId) {
      setActionError('Please select a unit to allocate.');
      return;
    }

    setIsSubmittingAction(true);
    setActionError('');

    const res = await approveAndAssignRequest(
      assigningRequest.id,
      selectedCategory,
      selectedEquipmentId,
      assignNotes
    );

    setIsSubmittingAction(false);

    if (res.success) {
      setAssigningRequest(null);
    } else {
      setActionError(res.error || 'Failed to complete assignment.');
    }
  };

  // Confirm Transfer
  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringRequest || !transferUnitId) {
      setActionError('Please select a unit to transfer.');
      return;
    }

    setIsSubmittingAction(true);
    setActionError('');

    const res = await transferRequest(
      transferringRequest.id,
      transferUnitCategory,
      transferUnitId,
      transferNotes
    );

    setIsSubmittingAction(false);

    if (res.success) {
      setTransferringRequest(null);
    } else {
      setActionError(res.error || 'Failed to complete transfer.');
    }
  };

  // Confirm Reject
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    setIsSubmittingAction(true);
    await rejectRequest(rejectingRequest.id, rejectionReason);
    setIsSubmittingAction(false);
    setRejectingRequest(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lanforge':
        return <Radio className="w-3.5 h-3.5 text-[#247A51]" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-[#7C3AED]" />;
      case 'chamber':
        return <Box className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'attenuator':
        return <Sliders className="w-3.5 h-3.5 text-[#EA580C]" />;
      default:
        return <Cable className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <div className="space-y-5 text-[#172A21]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E5EBE6]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172A21] flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#247A51]" />
            <span>{isAdmin ? 'Resource Requests Management' : 'My Resource Requests'}</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            {isAdmin 
              ? 'Review hardware requests, approve allocations, transfer testbeds, and fulfill engineer testing requirements.' 
              : 'Submit and monitor equipment requests for your projects and active test campaigns.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Resource</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Total Requests</span>
            <span className="text-lg font-bold text-[#172A21] font-mono">{totalCount}</span>
          </div>
          <div className="p-2 bg-[#F5F7F5] text-[#172A21] rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#D97706] block">Pending Review</span>
            <span className="text-lg font-bold text-[#D97706] font-mono">{pendingCount}</span>
          </div>
          <div className="p-2 bg-[#FEF3C7] text-[#D97706] rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#247A51] block">Approved / Assigned</span>
            <span className="text-lg font-bold text-[#247A51] font-mono">{approvedCount}</span>
          </div>
          <div className="p-2 bg-[#EBF4EF] text-[#247A51] rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E5EBE6] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#64748B] block">Rejected / Closed</span>
            <span className="text-lg font-bold text-[#64748B] font-mono">{rejectedCount}</span>
          </div>
          <div className="p-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#E5EBE6] rounded-xl shadow-none overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-3 border-b border-[#E5EBE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F9FAF9]">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={isAdmin ? "Search by requester, project, asset tag..." : "Search your requests..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 bg-white border border-[#E5EBE6] rounded-md text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            >
              <option value="all">All Categories</option>
              <option value="lanforge">LANforges</option>
              <option value="mobile">Mobiles</option>
              <option value="desktop">Desktops</option>
              <option value="chamber">Chambers</option>
              <option value="attenuator">Attenuators</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#E5EBE6] p-0.5 rounded-lg text-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-[#172A21] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              All ({baseRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'pending' ? 'bg-white text-[#D97706] shadow-xs font-semibold' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'approved' ? 'bg-white text-[#247A51] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'rejected' ? 'bg-white text-[#DC2626] shadow-xs' : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              Closed ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21] font-semibold">
                <th className="py-2.5 px-3 font-semibold text-center w-24">Req ID</th>
                {isAdmin && <th className="py-2.5 px-3 font-semibold">Requester</th>}
                <th className="py-2.5 px-3 font-semibold">Requested Resource</th>
                <th className="py-2.5 px-3 font-semibold">Project & Purpose</th>
                <th className="py-2.5 px-3 font-semibold">Duration & Priority</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';
                  const isRejected = req.status === 'rejected';

                  return (
                    <tr key={req.id} className="hover:bg-[#F9FAF9] transition-colors">
                      {/* Req ID */}
                      <td className="py-3 px-3 text-center font-mono font-semibold text-[#64748B]">
                        {req.id}
                        <div className="text-[10px] text-[#94A3B8] font-sans mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Requester (Admin only) */}
                      {isAdmin && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#EBF4EF] text-[#247A51] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {req.employeeName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#172A21] block truncate">{req.employeeName}</span>
                              <span className="text-[10px] text-[#64748B] block truncate">{req.employeeEmail}</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Requested Resource */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-[#172A21]">
                          {getCategoryIcon(req.resourceCategory)}
                          <span>{req.resourceLabel}</span>
                        </div>
                        {req.targetSpecs && (
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{req.targetSpecs}</p>
                        )}
                        {req.preferredAssetTag && (
                          <span className="inline-block mt-0.5 text-[10px] bg-[#F5F7F5] border border-[#E5EBE6] text-[#64748B] font-mono px-1 rounded">
                            Pref: {req.preferredAssetTag}
                          </span>
                        )}
                      </td>

                      {/* Project & Purpose */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="font-semibold text-[#247A51] bg-[#EBF4EF] px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wide">
                          {req.project}
                        </span>
                        <p className="text-xs text-[#172A21] mt-1 line-clamp-2">{req.purpose}</p>
                      </td>

                      {/* Duration & Priority */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-[#172A21]">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          <span>{req.duration}</span>
                        </div>
                        <div className="mt-1">
                          {req.priority === 'Urgent' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-1.5 py-0.5 rounded">
                              ● Urgent
                            </span>
                          ) : req.priority === 'High Priority' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-1.5 py-0.5 rounded">
                              ● High
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#64748B]">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-2 py-0.5 rounded-full">
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Declined</span>
                          </span>
                        )}
                        {req.assignedAssetTag && (
                          <div className="text-[10px] text-[#247A51] font-mono mt-1 font-semibold">
                            Unit: {req.assignedAssetTag}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openApproveModal(req)}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors shadow-xs"
                                  title="Approve and assign available equipment"
                                >
                                  Approve & Assign
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openTransferModal(req)}
                                  className="px-2 py-1 text-xs font-medium text-[#172A21] hover:text-[#247A51] bg-white hover:bg-[#F5F7F5] border border-[#E5EBE6] rounded transition-colors"
                                  title="Transfer active unit from another engineer"
                                >
                                  Transfer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(req)}
                                  className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                                  title="Decline request"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-[#64748B]">
                                {isApproved ? 'Fulfilled' : 'Closed'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#64748B]">
                            {isPending ? 'Under Review' : isApproved ? `Allocated: ${req.assignedAssetTag || 'Ready'}` : 'Closed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-[#64748B]">
                    <Inbox className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-[#172A21] text-xs">No equipment requests found</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {isAdmin 
                        ? 'Requests submitted by engineers will appear here for allocation.' 
                        : 'You haven\'t submitted any resource requests yet.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Request</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADMIN APPROVE & ASSIGN EQUIPMENT                  */}
      {/* ========================================================= */}
      {assigningRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E5EBE6] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#247A51] text-white flex items-center justify-center font-bold text-xs">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#172A21]">Approve & Assign Equipment</h3>
                  <p className="text-[10px] text-[#64748B]">Fulfill request {assigningRequest.id} for {assigningRequest.employeeName}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAssigningRequest(null)} 
                className="text-[#64748B] hover:text-[#172A21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-5 space-y-3.5 text-xs">
              {actionError && (
                <div className="p-2 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Requester Info Card */}
              <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Requester:</span>
                  <span className="font-semibold text-[#172A21]">{assigningRequest.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Project / Sprint:</span>
                  <span className="font-semibold text-[#247A51]">{assigningRequest.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Target Specs:</span>
                  <span className="text-[#172A21] truncate max-w-[200px]">{assigningRequest.targetSpecs || assigningRequest.resourceLabel}</span>
                </div>
              </div>

              {/* Step 1: Confirm Category */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Equipment Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value as EquipmentCategory;
                    setSelectedCategory(cat);
                    const av = getAvailableUnitsForCategory(cat);
                    setSelectedEquipmentId(av.length > 0 ? av[0].id : '');
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
                >
                  <option value="lanforge">LANforge Testbed</option>
                  <option value="mobile">Mobile Client Fleet</option>
                  <option value="desktop">Engineering Desktop</option>
                  <option value="chamber">RF Chamber</option>
                </select>
              </div>

              {/* Step 2: Pick Available Unit */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Select Available Unit to Allocate *</label>
                {getAvailableUnitsForCategory(selectedCategory).length > 0 ? (
                  <select
                    required
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
                  >
                    {getAvailableUnitsForCategory(selectedCategory).map((unit: any) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.lanforgeId || unit.deviceId || unit.chamberId} — {unit.lanforgeModel || unit.model || unit.chamberType}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] rounded-md text-[11px]">
                    No available units in this category. You can use <strong>Transfer</strong> instead to reallocate an active unit.
                  </div>
                )}
              </div>

              {/* Step 3: Assignment Notes */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Allocation / Lab Notes</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningRequest(null)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded-md bg-white hover:bg-[#F5F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || !selectedEquipmentId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Assign Unit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADMIN TRANSFER EQUIPMENT                           */}
      {/* ========================================================= */}
      {transferringRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E5EBE6] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#172A21]">Transfer Unit to {transferringRequest.employeeName}</h3>
                  <p className="text-[10px] text-[#64748B]">Reallocate active equipment from another engineer</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setTransferringRequest(null)} 
                className="text-[#64748B] hover:text-[#172A21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="p-5 space-y-3.5 text-xs">
              {actionError && (
                <div className="p-2 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Target Requester */}
              <div className="p-3 bg-[#EBF4EF] border border-[#D5E9DE] rounded-lg text-xs">
                <span className="text-[#247A51] font-semibold block">Transferring To Custodian:</span>
                <p className="font-bold text-[#172A21] mt-0.5">{transferringRequest.employeeName} ({transferringRequest.employeeEmail})</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Project: {transferringRequest.project}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Category *</label>
                <select
                  value={transferUnitCategory}
                  onChange={(e) => {
                    const cat = e.target.value as EquipmentCategory;
                    setTransferUnitCategory(cat);
                    const inUse = getInUseUnitsForCategory(cat);
                    setTransferUnitId(inUse.length > 0 ? inUse[0].id : '');
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
                >
                  <option value="lanforge">LANforge Testbed</option>
                  <option value="mobile">Mobile Client Fleet</option>
                  <option value="desktop">Engineering Desktop</option>
                  <option value="chamber">RF Chamber</option>
                </select>
              </div>

              {/* Select Active Unit */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Select In-Use Unit to Transfer *</label>
                {getInUseUnitsForCategory(transferUnitCategory).length > 0 ? (
                  <select
                    required
                    value={transferUnitId}
                    onChange={(e) => setTransferUnitId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
                  >
                    {getInUseUnitsForCategory(transferUnitCategory).map((unit: any) => {
                      const tag = unit.lanforgeId || unit.deviceId || unit.chamberId;
                      const holder = unit.pocName || unit.usedByName || 'Current Holder';
                      return (
                        <option key={unit.id} value={unit.id}>
                          {tag} — currently with {holder}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-2.5 bg-[#F5F7F5] border border-[#E5EBE6] text-[#64748B] rounded-md text-[11px]">
                    No in-use units in this category.
                  </div>
                )}
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="block font-medium text-[#172A21] mb-1">Transfer Notes</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferringRequest(null)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded-md bg-white hover:bg-[#F5F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || !transferUnitId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADMIN REJECT REQUEST                               */}
      {/* ========================================================= */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-[#E5EBE6] rounded-xl shadow-xl overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#DC2626]">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-xs font-bold text-[#172A21]">Decline Equipment Request?</h3>
            </div>

            <p className="text-xs text-[#64748B]">
              Are you sure you want to decline request <strong className="font-mono text-[#172A21]">{rejectingRequest.id}</strong> submitted by <strong className="text-[#172A21]">{rejectingRequest.employeeName}</strong>?
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#172A21] mb-1">Reason for Rejection</label>
                <textarea
                  required
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded-md bg-white text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded-md bg-white hover:bg-[#F5F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-md transition-colors"
                >
                  {isSubmittingAction ? 'Declining...' : 'Decline Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Request Modal */}
      <RequestResourceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
}
