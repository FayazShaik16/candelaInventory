'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { ActivityLog, EquipmentCategory, ActivityActionType } from '@/types/inventory';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Layers, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  X, 
  Radio, 
  Monitor, 
  Smartphone, 
  Box, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export function LogsView() {
  const { activityLogs } = useInventory();
  const { usersList } = useAuth();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EquipmentCategory | 'system'>('all');
  const [actionFilter, setActionFilter] = useState<'all' | ActivityActionType>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Compute Active Date Filter Window
  const dateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return { start, end: now.getTime() };
    }
    if (datePreset === '7days') {
      const start = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return { start, end: now.getTime() };
    }
    if (datePreset === '30days') {
      const start = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      return { start, end: now.getTime() };
    }
    if (datePreset === 'custom') {
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
      return { start, end };
    }
    return { start: 0, end: Infinity };
  }, [datePreset, startDate, endDate]);

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tag = (log.unitAssetTag || '').toLowerCase();
        const model = (log.unitModel || '').toLowerCase();
        const title = (log.title || '').toLowerCase();
        const desc = (log.description || '').toLowerCase();
        const perf = (log.performedBy || '').toLowerCase();
        const emp = (log.employeeName || '').toLowerCase();
        const usr = (log.user?.name || '').toLowerCase();
        if (
          !tag.includes(q) &&
          !model.includes(q) &&
          !title.includes(q) &&
          !desc.includes(q) &&
          !perf.includes(q) &&
          !emp.includes(q) &&
          !usr.includes(q)
        ) {
          return false;
        }
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'system') {
          if (log.inventoryCategory && log.unitAssetTag !== 'DATABASE') return false;
        } else {
          if (log.inventoryCategory !== categoryFilter) return false;
        }
      }

      // 3. Action Filter
      if (actionFilter !== 'all') {
        if (log.action !== actionFilter) return false;
      }

      // 4. User Filter
      if (userFilter !== 'all') {
        const matchesEmployee = log.employeeId === userFilter || log.employeeName === userFilter;
        const matchesActor = log.performedBy === userFilter || log.user?.name === userFilter;
        if (!matchesEmployee && !matchesActor) return false;
      }

      // 5. Date Filter
      const logTime = new Date(log.timestamp).getTime();
      if (logTime < dateRange.start || logTime > dateRange.end) {
        return false;
      }

      return true;
    });
  }, [activityLogs, searchQuery, categoryFilter, actionFilter, userFilter, dateRange]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, actionFilter, userFilter, datePreset, startDate, endDate]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = activityLogs.length;
    const custodyCount = activityLogs.filter((l) => l.action === 'assigned' || l.action === 'returned' || l.action === 'transferred').length;
    const maintenanceCount = activityLogs.filter((l) => l.action === 'maintenance' || l.action === 'config_updated' || l.action === 'status_change').length;
    const uniqueUsers = new Set(activityLogs.map((l) => l.employeeName || l.performedBy).filter(Boolean)).size;

    return { total, custodyCount, maintenanceCount, uniqueUsers };
  }, [activityLogs]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  // CSV Export Utility
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const handleExportCSV = (logsToExport: ActivityLog[], filePrefix: string) => {
    const headers = [
      'Transaction ID',
      'Timestamp (ISO)',
      'Date & Time',
      'Action Type',
      'Inventory Category',
      'Asset Tag',
      'Hardware Model',
      'Target User / Custodian',
      'Performed By',
      'Transaction Title',
      'Detailed Description'
    ];

    const rows = logsToExport.map((log) => [
      escapeCSV(log.id),
      escapeCSV(log.timestamp),
      escapeCSV(new Date(log.timestamp).toLocaleString()),
      escapeCSV(log.action),
      escapeCSV(log.inventoryCategory || 'system'),
      escapeCSV(log.unitAssetTag || 'N/A'),
      escapeCSV(log.unitModel || 'N/A'),
      escapeCSV(log.employeeName || 'N/A'),
      escapeCSV(log.performedBy || log.user?.name || 'Admin'),
      escapeCSV(log.title),
      escapeCSV(log.description)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filePrefix}_${timestampStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all' || actionFilter !== 'all' || userFilter !== 'all' || datePreset !== 'all' || startDate !== '' || endDate !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setActionFilter('all');
    setUserFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            <CheckCircle2 className="w-3 h-3" />
            Assigned
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
            <RotateCcw className="w-3 h-3" />
            Returned
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
            <ArrowRightLeft className="w-3 h-3" />
            Transferred
          </span>
        );
      case 'created':
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            <Layers className="w-3 h-3" />
            Registered
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      case 'config_updated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
            <Wrench className="w-3 h-3" />
            Config Updated
          </span>
        );
      case 'status_change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            <Clock className="w-3 h-3" />
            Status Change
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
            <AlertTriangle className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5F7F5] text-[#172A21] border border-[#E5EBE6]">
            {action}
          </span>
        );
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'lanforge':
        return <Radio className="w-3.5 h-3.5 text-[#247A51]" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-[#0369A1]" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-[#7E22CE]" />;
      case 'chamber':
        return <Box className="w-3.5 h-3.5 text-[#B45309]" />;
      default:
        return <History className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E5EBE6]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
              Activity & Transaction Logs
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Complete audit trail of equipment assignments, custody transfers, configurations, and administrative actions.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleExportCSV(filteredLogs, 'candela_filtered_logs')}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            title="Download the currently filtered transactions as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#247A51]" />
            <span>Export View ({filteredLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportCSV(activityLogs, 'candela_all_transaction_logs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-sm"
            title="Download the entire historical audit log database as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>Export All Logs ({activityLogs.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-lg border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Total Events</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F5F7F5] text-[#172A21] border border-[#E5EBE6]">
              All Records
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#172A21] mt-1">{metrics.total}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Persisted audit transactions</p>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Custody Operations</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
              Handover
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803D] mt-1">{metrics.custodyCount}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Assignments, returns & transfers</p>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Maintenance & Changes</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              Technical
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#B45309] mt-1">{metrics.maintenanceCount}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Calibrations, upgrades & config</p>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748B]">Users Involved</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
              Engineers
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#6D28D9] mt-1">{metrics.uniqueUsers}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Unique custodians & actors</p>
        </div>
      </div>

      {/* 3. Comprehensive Filter Controls Bar */}
      <div className="bg-white rounded-lg border border-[#E5EBE6] p-4 space-y-3.5 shadow-sm">
        {/* Row 1: Search & Date Presets */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset tag, model, custodian, performed by, or description..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg text-[#172A21] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#247A51] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-[#172A21]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-medium text-[#64748B] flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#247A51]" />
              Date:
            </span>
            {(
              [
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: '7days', label: 'Last 7 Days' },
                { key: '30days', label: 'Last 30 Days' },
                { key: 'custom', label: 'Custom' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setDatePreset(item.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  datePreset === item.key
                    ? 'bg-[#247A51] text-white shadow-sm'
                    : 'bg-[#F5F7F5] text-[#64748B] hover:bg-[#E5EBE6] hover:text-[#172A21]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Custom Date Range (if selected) */}
        {datePreset === 'custom' && (
          <div className="p-2.5 bg-[#F9FAF9] rounded-lg border border-[#E5EBE6] flex items-center gap-3 flex-wrap animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#64748B]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs bg-white border border-[#E5EBE6] rounded px-2.5 py-1 text-[#172A21] focus:outline-none focus:ring-1 focus:ring-[#247A51]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#64748B]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs bg-white border border-[#E5EBE6] rounded px-2.5 py-1 text-[#172A21] focus:outline-none focus:ring-1 focus:ring-[#247A51]"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-[#247A51] hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}

        {/* Row 3: Dropdowns for Category, Action Type & User */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
              Device Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full text-xs bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg px-2.5 py-1.5 text-[#172A21] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#247A51]"
            >
              <option value="all">All Device Categories</option>
              <option value="lanforge">LANforge Testbeds</option>
              <option value="desktop">Workstations & Desktops</option>
              <option value="mobile">Mobile Clients Fleet</option>
              <option value="chamber">RF & Anechoic Chambers</option>
              <option value="system">System & Database</option>
            </select>
          </div>

          {/* Action Type Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
              Transaction Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="w-full text-xs bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg px-2.5 py-1.5 text-[#172A21] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#247A51]"
            >
              <option value="all">All Action Types</option>
              <option value="assigned">Assignments</option>
              <option value="returned">Returns</option>
              <option value="transferred">Transfers</option>
              <option value="created">Registrations / Additions</option>
              <option value="maintenance">Maintenance</option>
              <option value="config_updated">Config Updates</option>
              <option value="status_change">Status Changes</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* User / Custodian Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
              User / Custodian
            </label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full text-xs bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg px-2.5 py-1.5 text-[#172A21] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#247A51]"
            >
              <option value="all">All Users & Custodians</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.full_name}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Reset Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-[#E5EBE6] text-xs">
            <span className="text-[#64748B]">
              Showing <strong className="text-[#172A21]">{filteredLogs.length}</strong> matching transaction{filteredLogs.length === 1 ? '' : 's'} (out of {activityLogs.length})
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#DC2626] hover:underline font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Transaction Logs Table */}
      <div className="bg-white rounded-lg border border-[#E5EBE6] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAF9] border-b border-[#E5EBE6] text-[#64748B] font-semibold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4 w-[160px]">Timestamp</th>
                <th className="py-3 px-3 w-[130px]">Action</th>
                <th className="py-3 px-3 w-[180px]">Asset / Hardware</th>
                <th className="py-3 px-3 w-[160px]">User / Custodian</th>
                <th className="py-3 px-3 w-[140px]">Performed By</th>
                <th className="py-3 px-4">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <History className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm text-[#172A21]">No transaction logs match your criteria</p>
                    <p className="text-xs text-[#94A3B8] mt-1">Try resetting or broadening your date and category filters</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#247A51] bg-[#EBF4EF] rounded border border-[#C2DCD0] hover:bg-[#D5EADB] transition-colors"
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-[#F9FAF9] transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#172A21] whitespace-nowrap">
                        <div className="font-semibold">{formattedDate}</div>
                        <div className="text-[#64748B] text-[10px]">{formattedTime}</div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Asset / Hardware */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(log.inventoryCategory)}
                          <span className="font-mono font-bold text-[#172A21] text-[12px]">
                            {log.unitAssetTag || 'N/A'}
                          </span>
                        </div>
                        {log.unitModel && (
                          <div className="text-[11px] text-[#64748B] truncate max-w-[170px]" title={log.unitModel}>
                            {log.unitModel}
                          </div>
                        )}
                      </td>

                      {/* User / Custodian */}
                      <td className="py-3 px-3">
                        {log.employeeName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#EBF4EF] text-[#247A51] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {log.employeeName.charAt(0)}
                            </div>
                            <span className="font-medium text-[#172A21] truncate max-w-[130px]">
                              {log.employeeName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] italic text-[11px]">Unassigned / System</span>
                        )}
                      </td>

                      {/* Performed By */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#247A51] flex-shrink-0" />
                          <span className="text-[#172A21] font-medium text-[11.5px]">
                            {log.performedBy || log.user?.name || 'Admin'}
                          </span>
                        </div>
                      </td>

                      {/* Transaction Details */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#172A21] text-[11.5px]">
                          {log.title}
                        </div>
                        <div className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                          {log.description}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="px-4 py-3 bg-[#F9FAF9] border-t border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E5EBE6] rounded px-2 py-1 text-xs text-[#172A21] focus:outline-none focus:ring-1 focus:ring-[#247A51]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredLogs.length)} to {Math.min(currentPage * rowsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
              </span>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-[#E5EBE6] bg-white text-[#172A21] hover:bg-[#F5F7F5] disabled:opacity-40 disabled:hover:bg-white"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-medium text-xs text-[#172A21]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-[#E5EBE6] bg-white text-[#172A21] hover:bg-[#F5F7F5] disabled:opacity-40 disabled:hover:bg-white"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
