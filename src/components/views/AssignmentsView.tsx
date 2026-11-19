'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { EquipmentAssignment, EquipmentCategory, AssignmentStatus } from '@/types/inventory';
import { 
  UserCheck, 
  MapPin, 
  Radio, 
  Calendar, 
  Search, 
  Filter, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  RotateCcw, 
  Clock, 
  Plus, 
  Monitor, 
  Smartphone, 
  Box, 
  X,
  AlertCircle,
  FileText,
  ArrowRightLeft,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface AssignmentsViewProps {
  onViewUnit?: (category: EquipmentCategory, id: string) => void;
}

export function AssignmentsView({ onViewUnit }: AssignmentsViewProps) {
  const { 
    assignments, 
    returnEquipment, 
    transferEquipment, 
    assignEquipment, 
    lanforges, 
    desktops, 
    mobiles, 
    chambers,
    metrics 
  } = useInventory();
  const { role, usersList } = useAuth();
  const isAdmin = role === 'admin';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EquipmentCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Table Sort & Pagination
  const [sortField, setSortField] = useState<'assignedDate' | 'equipmentTag' | 'employeeName' | 'status'>('assignedDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals State
  const [detailAssignment, setDetailAssignment] = useState<EquipmentAssignment | null>(null);

  // Return Modal State
  const [returningAssignment, setReturningAssignment] = useState<EquipmentAssignment | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [markUnderMaintenance, setMarkUnderMaintenance] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Transfer Modal State
  const [transferringAssignment, setTransferringAssignment] = useState<EquipmentAssignment | null>(null);
  const [transferToEmployeeId, setTransferToEmployeeId] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferNotes, setTransferNotes] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferError, setTransferError] = useState('');

  // New Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newAssignCategory, setNewAssignCategory] = useState<EquipmentCategory>('lanforge');
  const [newAssignEquipmentId, setNewAssignEquipmentId] = useState('');
  const [newAssignEmployeeId, setNewAssignEmployeeId] = useState('');
  const [newAssignDate, setNewAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssignNotes, setNewAssignNotes] = useState('');
  const [assignError, setAssignError] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Distinct projects list for filter dropdown
  const distinctProjects = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach((a) => {
      if (a.project) set.add(a.project);
    });
    return Array.from(set);
  }, [assignments]);

  // Available equipment options for category
  const availableUnitsForCategory = useMemo(() => {
    switch (newAssignCategory) {
      case 'lanforge':
        return lanforges
          .filter((l) => l.status === 'Available' && !l.isArchived)
          .map((l) => ({ id: l.id, label: `${l.lanforgeId} — ${l.lanforgeModel} (${l.location})` }));
      case 'desktop':
        return desktops
          .filter((d) => d.status === 'Available' && !d.isArchived)
          .map((d) => ({ id: d.id, label: `${d.deviceId} — ${d.deviceBrand} ${d.model}` }));
      case 'mobile':
        return mobiles
          .filter((m) => m.status === 'Available' && !m.isArchived)
          .map((m) => ({ id: m.id, label: `${m.deviceId} — ${m.deviceBrand} ${m.model}` }));
      case 'chamber':
        return chambers
          .filter((c) => c.status === 'Available' && !c.isArchived)
          .map((c) => ({ id: c.id, label: `${c.chamberId} — ${c.chamberType}` }));
      default:
        return [];
    }
  }, [newAssignCategory, lanforges, desktops, mobiles, chambers]);

  // Filtered & Sorted Assignments
  const processedAssignments = useMemo(() => {
    let result = assignments.filter((asgn) => {
      if (categoryFilter !== 'all' && asgn.equipmentCategory !== categoryFilter) return false;
      if (statusFilter !== 'all' && asgn.status !== statusFilter) return false;
      if (projectFilter !== 'all' && asgn.project !== projectFilter) return false;

      // Date Range filter
      if (startDate) {
        const itemDate = new Date(asgn.assignedDate).getTime();
        const start = new Date(startDate).getTime();
        if (itemDate < start) return false;
      }
      if (endDate) {
        const itemDate = new Date(asgn.assignedDate).getTime();
        const end = new Date(endDate).getTime() + 86400000;
        if (itemDate > end) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTag = asgn.equipmentTag.toLowerCase().includes(q);
        const matchesEmployee = asgn.employeeName.toLowerCase().includes(q);
        const matchesEmail = asgn.employeeEmail.toLowerCase().includes(q);
        const matchesProject = (asgn.project || '').toLowerCase().includes(q);
        const matchesNotes = asgn.notes.toLowerCase().includes(q);
        if (!matchesTag && !matchesEmployee && !matchesEmail && !matchesProject && !matchesNotes) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';

      if (sortField === 'assignedDate') {
        valA = new Date(a.assignedDate).getTime();
        valB = new Date(b.assignedDate).getTime();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [assignments, categoryFilter, statusFilter, projectFilter, startDate, endDate, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(processedAssignments.length / pageSize) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedAssignments.slice(start, start + pageSize);
  }, [processedAssignments, currentPage, pageSize]);

  // Handlers
  const handleSort = (field: 'assignedDate' | 'equipmentTag' | 'employeeName' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignEquipmentId) {
      setAssignError('Please select a piece of equipment to assign.');
      return;
    }
    if (!newAssignEmployeeId) {
      setAssignError('Please select an active employee.');
      return;
    }

    setIsSubmittingAssign(true);
    setAssignError('');
    const res = await assignEquipment(
      newAssignCategory,
      newAssignEquipmentId,
      newAssignEmployeeId,
      newAssignNotes,
      newAssignDate
    );

    if (res.success) {
      setIsAssignModalOpen(false);
      setNewAssignEquipmentId('');
      setNewAssignEmployeeId('');
      setNewAssignNotes('');
    } else {
      setAssignError(res.error || 'Failed to complete assignment.');
    }
    setIsSubmittingAssign(false);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningAssignment) return;
    setIsSubmittingReturn(true);
    setReturnError('');

    const res = await returnEquipment(
      returningAssignment.equipmentCategory,
      returningAssignment.equipmentId,
      returnNotes,
      returnDate,
      markUnderMaintenance
    );

    if (res.success) {
      setReturningAssignment(null);
      setReturnNotes('');
      setMarkUnderMaintenance(false);
    } else {
      setReturnError(res.error || 'Failed to process return.');
    }
    setIsSubmittingReturn(false);
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringAssignment) return;
    if (!transferToEmployeeId) {
      setTransferError('Please select a target employee to transfer to.');
      return;
    }

    setIsSubmittingTransfer(true);
    setTransferError('');

    const res = await transferEquipment(
      transferringAssignment.equipmentCategory,
      transferringAssignment.equipmentId,
      transferToEmployeeId,
      transferNotes,
      transferDate
    );

    if (res.success) {
      setTransferringAssignment(null);
      setTransferToEmployeeId('');
      setTransferNotes('');
    } else {
      setTransferError(res.error || 'Failed to process transfer.');
    }
    setIsSubmittingTransfer(false);
  };

  const exportCSV = () => {
    const headers = ['S.No', 'Equipment Tag', 'Category', 'Employee Name', 'Employee Email', 'Project', 'Assigned Date', 'Return Date', 'Status', 'Assigned By', 'Returned By', 'Notes'];
    const rows = processedAssignments.map((a, i) => [
      i + 1,
      `"${a.equipmentTag}"`,
      `"${a.equipmentCategory}"`,
      `"${a.employeeName}"`,
      `"${a.employeeEmail}"`,
      `"${a.project || ''}"`,
      `"${a.assignedDate}"`,
      `"${a.returnDate || ''}"`,
      `"${a.status}"`,
      `"${a.assignedBy}"`,
      `"${a.returnedBy || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candela_equipment_assignments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: EquipmentCategory) => {
    switch (category) {
      case 'lanforge':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#EBF4EF] text-[#247A51] border border-[#D5E9DE]">
            <Radio className="w-3 h-3 text-[#247A51]" />
            <span>LANforge</span>
          </span>
        );
      case 'desktop':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]">
            <Monitor className="w-3 h-3 text-[#0284C7]" />
            <span>Desktop</span>
          </span>
        );
      case 'mobile':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F3FF] text-[#8B5CF6] border border-[#EDE9FE]">
            <Smartphone className="w-3 h-3 text-[#8B5CF6]" />
            <span>Mobile</span>
          </span>
        );
      case 'chamber':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
            <Box className="w-3 h-3 text-[#D97706]" />
            <span>Chamber</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span>Active Custody</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            <span>Returned</span>
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]">
            <ArrowRightLeft className="w-2.5 h-2.5 text-[#3B82F6]" />
            <span>Transferred</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5EBE6]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
            Equipment Assignments
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage equipment allocation, employee ownership and equipment returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Summary Stats */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] px-2.5 py-1.5 rounded border border-[#E5EBE6] text-xs">
            <span className="inline-flex items-center gap-1 text-[#247A51] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              {metrics.totalActiveAssignments} Active
            </span>
            <span className="text-[#E5EBE6]">|</span>
            <span className="inline-flex items-center gap-1 text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
              {metrics.totalReturnedAssignments} Returned
            </span>
            <span className="text-[#E5EBE6]">|</span>
            <span className="inline-flex items-center gap-1 text-[#3B82F6]">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              {metrics.totalTransferredAssignments} Transferred
            </span>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="p-1.5 text-xs text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded transition-colors flex items-center gap-1"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-[#FFFFFF] p-3 rounded border border-[#E5EBE6] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by equipment ID, employee name, project, or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[#F5F7F5] border border-[#E5EBE6] text-[#172A21] placeholder-[#94A3B8] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#F5F7F5] p-0.5 rounded border border-[#E5EBE6] text-xs overflow-x-auto">
            {(['all', 'lanforge', 'desktop', 'mobile', 'chamber'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[#FFFFFF] text-[#247A51] font-bold shadow-none'
                    : 'text-[#64748B] hover:text-[#172A21]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat === 'lanforge' ? 'LANforges' : `${cat.charAt(0).toUpperCase() + cat.slice(1)}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5EBE6] text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Custody</option>
              <option value="returned">Returned</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51] max-w-[200px]"
            >
              <option value="all">All Projects</option>
              {distinctProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || projectFilter !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setProjectFilter('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-[11px] text-[#DC2626] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ASSIGNMENTS TABLE */}
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAF9] border-b border-[#E5EBE6] text-[#64748B] font-semibold select-none">
                <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:text-[#172A21]"
                  onClick={() => handleSort('equipmentTag')}
                >
                  <div className="flex items-center gap-1">
                    <span>Equipment ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Category</th>
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:text-[#172A21]"
                  onClick={() => handleSort('employeeName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Employee Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Project</th>
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:text-[#172A21]"
                  onClick={() => handleSort('assignedDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Assignment Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:text-[#172A21]"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Assignment Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6] text-[#172A21]">
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748B]">
                    <UserCheck className="w-8 h-8 text-[#94A3B8] mx-auto mb-1.5" />
                    <p className="font-semibold text-xs text-[#172A21]">No assignment records found</p>
                    <p className="text-[11px] text-[#94A3B8]">Adjust search criteria or create a new assignment.</p>
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((asgn, index) => {
                  const sNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr 
                      key={asgn.id}
                      className="hover:bg-[#F9FAF9] transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-[#64748B] font-mono">
                        {sNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#172A21]">
                        {asgn.equipmentTag}
                      </td>
                      <td className="py-2.5 px-3">
                        {getCategoryBadge(asgn.equipmentCategory)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#172A21]">{asgn.employeeName}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">{asgn.employeeEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-[180px] truncate text-[#64748B]">
                        {asgn.project || 'Standard Operations'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#64748B]">
                        {new Date(asgn.assignedDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        {getStatusBadge(asgn.status)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailAssignment(asgn)}
                            className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded transition-colors"
                            title="View Assignment Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && asgn.status === 'active' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setTransferringAssignment(asgn);
                                  setTransferToEmployeeId('');
                                  setTransferNotes('');
                                  setTransferError('');
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-[#0284C7] bg-[#F0F9FF] border border-[#E0F2FE] hover:bg-[#E0F2FE] rounded transition-colors flex items-center gap-1"
                                title="Transfer equipment to another employee"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Transfer</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReturningAssignment(asgn);
                                  setReturnNotes('');
                                  setMarkUnderMaintenance(false);
                                  setReturnError('');
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] hover:bg-[#D5E9DE] rounded transition-colors flex items-center gap-1"
                                title="Return equipment to stock"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Return</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-2.5 border-t border-[#E5EBE6] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing <span className="font-semibold text-[#172A21]">{processedAssignments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#172A21]">
              {Math.min(currentPage * pageSize, processedAssignments.length)}
            </span>{' '}
            of <span className="font-semibold text-[#172A21]">{processedAssignments.length}</span> assignments
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 text-[#64748B] hover:text-[#172A21] disabled:opacity-40 disabled:hover:text-[#64748B] rounded border border-[#E5EBE6]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs">
              Page <strong className="text-[#172A21]">{currentPage}</strong> of{' '}
              <strong className="text-[#172A21]">{totalPages}</strong>
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 text-[#64748B] hover:text-[#172A21] disabled:opacity-40 disabled:hover:text-[#64748B] rounded border border-[#E5EBE6]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: VIEW ASSIGNMENT DETAILS --- */}
      {detailAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172A21]">
                    Assignment Record: {detailAssignment.equipmentTag}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Full custody history and tracking record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailAssignment(null)}
                className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Equipment Category
                </span>
                <div className="font-semibold text-[#172A21] capitalize">
                  {detailAssignment.equipmentCategory}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Custody Status
                </span>
                <div>{getStatusBadge(detailAssignment.status)}</div>
              </div>

              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Current / Recorded Custodian
                </span>
                <div className="font-semibold text-[#172A21]">{detailAssignment.employeeName}</div>
                <div className="text-[10px] text-[#64748B] font-mono">{detailAssignment.employeeEmail}</div>
              </div>

              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Allocated Project
                </span>
                <div className="font-semibold text-[#172A21]">{detailAssignment.project || 'General Lab'}</div>
              </div>

              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Assignment Date
                </span>
                <div className="font-mono text-[#172A21]">
                  {new Date(detailAssignment.assignedDate).toLocaleString()}
                </div>
                <div className="text-[10px] text-[#64748B]">Assigned by: {detailAssignment.assignedBy}</div>
              </div>

              <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                  Return / Transfer Date
                </span>
                <div className="font-mono text-[#172A21]">
                  {detailAssignment.returnDate ? new Date(detailAssignment.returnDate).toLocaleString() : 'Currently Active'}
                </div>
                {detailAssignment.returnedBy && (
                  <div className="text-[10px] text-[#64748B]">Logged by: {detailAssignment.returnedBy}</div>
                )}
              </div>
            </div>

            {detailAssignment.notes && (
              <div className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] text-xs">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">
                  Assignment Notes & Logs
                </span>
                <p className="text-[#172A21] leading-relaxed">{detailAssignment.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setDetailAssignment(null)}
                className="px-3 py-1.5 text-xs text-[#172A21] bg-[#F5F7F5] hover:bg-[#EBF4EF] rounded border border-[#E5EBE6]"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RETURN EQUIPMENT --- */}
      {returningAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
          <form
            onSubmit={handleConfirmReturn}
            className="w-full max-w-md bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
              <div>
                <h3 className="text-sm font-bold text-[#172A21]">
                  Return Equipment to Inventory
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Check in hardware from current custodian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReturningAssignment(null)}
                className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {returnError && (
              <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{returnError}</span>
              </div>
            )}

            <div className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Equipment:</span>
                <span className="font-mono font-bold text-[#172A21]">{returningAssignment.equipmentTag}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Current Custodian:</span>
                <span className="font-semibold text-[#172A21]">{returningAssignment.employeeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Category:</span>
                <span className="capitalize text-[#247A51] font-medium">{returningAssignment.equipmentCategory}</span>
              </div>
            </div>

            {/* Return Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Return Date
              </label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            {/* Return Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Return Inspection & Verification Notes
              </label>
              <textarea
                rows={2}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Hardware condition verified, radios intact, etc."
                className="w-full p-2 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            {/* Under Maintenance Checkbox */}
            <div className="p-2.5 rounded bg-[#FFFBEB] border border-[#FEF3C7] flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                id="underMaintenanceCheck"
                checked={markUnderMaintenance}
                onChange={(e) => setMarkUnderMaintenance(e.target.checked)}
                className="mt-0.5 rounded text-[#D97706] focus:ring-0"
              />
              <label htmlFor="underMaintenanceCheck" className="cursor-pointer text-[#92400E]">
                <strong className="block font-semibold">Mark as Under Maintenance</strong>
                Check this if the equipment requires diagnostic calibration or repair before re-allocation.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setReturningAssignment(null)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] bg-[#F5F7F5] rounded border border-[#E5EBE6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReturn}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded disabled:opacity-50"
              >
                {isSubmittingReturn ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: ATOMIC TRANSFER EQUIPMENT --- */}
      {transferringAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
          <form
            onSubmit={handleConfirmTransfer}
            className="w-full max-w-md bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
              <div>
                <h3 className="text-sm font-bold text-[#172A21]">
                  Transfer Equipment Custody
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Direct atomic reassignment from one employee to another.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTransferringAssignment(null)}
                className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Equipment:</span>
                <span className="font-mono font-bold text-[#172A21]">{transferringAssignment.equipmentTag}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Current Custodian:</span>
                <span className="font-semibold text-[#172A21]">{transferringAssignment.employeeName}</span>
              </div>
            </div>

            {/* Target Employee Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Transfer To Engineer / New Custodian
              </label>
              <select
                value={transferToEmployeeId}
                onChange={(e) => setTransferToEmployeeId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">-- Select Active Employee --</option>
                {usersList
                  .filter((emp) => emp.id !== transferringAssignment.employeeId && emp.account_status === 'active')
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.email}) - {emp.role.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            {/* Transfer Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Transfer Date
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            {/* Transfer Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Transfer Reason / Project Shift Notes
              </label>
              <textarea
                rows={2}
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Reason for reassignment, target bay, project priority, etc."
                className="w-full p-2 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setTransferringAssignment(null)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] bg-[#F5F7F5] rounded border border-[#E5EBE6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingTransfer}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#0284C7] hover:bg-[#0369A1] rounded disabled:opacity-50 flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isSubmittingTransfer ? 'Transferring...' : 'Execute Transfer'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 4: NEW ASSIGNMENT MODAL --- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateAssignment}
            className="w-full max-w-lg bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
              <div>
                <h3 className="text-sm font-bold text-[#172A21]">
                  Assign Equipment Custody
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Allocate hardware to an authorized Candela team member.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignError && (
              <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Equipment Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['lanforge', 'desktop', 'mobile', 'chamber'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setNewAssignCategory(cat);
                      setNewAssignEquipmentId('');
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded border capitalize transition-colors text-center ${
                      newAssignCategory === cat
                        ? 'bg-[#EBF4EF] border-[#247A51] text-[#247A51] font-bold'
                        : 'bg-[#F5F7F5] border-[#E5EBE6] text-[#64748B] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Available Unit ({availableUnitsForCategory.length} in stock)
              </label>
              <select
                value={newAssignEquipmentId}
                onChange={(e) => setNewAssignEquipmentId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">-- Select Available Unit --</option>
                {availableUnitsForCategory.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Assign to Engineer / Custodian
              </label>
              <select
                value={newAssignEmployeeId}
                onChange={(e) => setNewAssignEmployeeId(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">-- Select Active Employee --</option>
                {usersList
                  .filter((emp) => emp.account_status === 'active')
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.email}) - {emp.role.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            {/* Assignment Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Assignment Date
              </label>
              <input
                type="date"
                required
                value={newAssignDate}
                onChange={(e) => setNewAssignDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172A21]">
                Deployment Notes / Purpose
              </label>
              <textarea
                rows={2}
                value={newAssignNotes}
                onChange={(e) => setNewAssignNotes(e.target.value)}
                placeholder="E.g., Allocated for Wi-Fi 7 throughput benchmark suite"
                className="w-full p-2 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] bg-[#F5F7F5] rounded border border-[#E5EBE6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingAssign}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded disabled:opacity-50"
              >
                {isSubmittingAssign ? 'Assigning...' : 'Complete Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
