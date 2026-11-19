'use client';

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ActivityLog, ActivityActionType, EquipmentCategory } from '@/types/inventory';
import { 
  History, 
  ShieldCheck, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  UserCheck, 
  ArrowRightLeft, 
  RotateCcw, 
  AlertTriangle, 
  PlusCircle, 
  Radio, 
  Monitor, 
  Smartphone, 
  Box, 
  Sliders, 
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText
} from 'lucide-react';

interface ActivityViewProps {
  activities?: ActivityLog[];
  onSelectUnit?: (tag: string) => void;
}

export function ActivityView({ activities: propActivities, onSelectUnit }: ActivityViewProps) {
  const { activityLogs } = useInventory();
  const allActivities = propActivities || activityLogs;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EquipmentCategory>('all');
  const [actionFilter, setActionFilter] = useState<'all' | ActivityActionType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Processed Activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((log) => {
      if (categoryFilter !== 'all' && log.inventoryCategory !== categoryFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;

      // Date range filter
      if (startDate) {
        const itemDate = new Date(log.timestamp).getTime();
        const start = new Date(startDate).getTime();
        if (!isNaN(itemDate) && itemDate < start) return false;
      }
      if (endDate) {
        const itemDate = new Date(log.timestamp).getTime();
        const end = new Date(endDate).getTime() + 86400000;
        if (!isNaN(itemDate) && itemDate > end) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTag = (log.unitAssetTag || '').toLowerCase().includes(q);
        const matchesDesc = (log.description || '').toLowerCase().includes(q);
        const matchesUser = (log.user?.name || log.performedBy || '').toLowerCase().includes(q);
        const matchesEmp = (log.employeeName || '').toLowerCase().includes(q);
        if (!matchesTag && !matchesDesc && !matchesUser && !matchesEmp) return false;
      }

      return true;
    });
  }, [allActivities, categoryFilter, actionFilter, startDate, endDate, searchQuery]);

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Action', 'Inventory ID', 'Category', 'Employee', 'Performed By', 'Description'];
    const rows = filteredActivities.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.unitAssetTag || ''}"`,
      `"${l.inventoryCategory || ''}"`,
      `"${l.employeeName || ''}"`,
      `"${l.performedBy || l.user?.name || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candela_audit_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF4EF] text-[#16A34A] border border-[#D5E9DE]">
            <UserCheck className="w-3 h-3 text-[#16A34A]" />
            <span>Assigned</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            <RotateCcw className="w-3 h-3 text-[#64748B]" />
            <span>Returned</span>
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]">
            <ArrowRightLeft className="w-3 h-3 text-[#3B82F6]" />
            <span>Transferred</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
            <span>Diagnostic</span>
          </span>
        );
      case 'status_change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F7F5] text-[#247A51] border border-[#E5EBE6]">
            <Sliders className="w-3 h-3 text-[#247A51]" />
            <span>Status Shift</span>
          </span>
        );
      case 'created':
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
            <PlusCircle className="w-3 h-3 text-[#16A34A]" />
            <span>Created</span>
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
            <Archive className="w-3 h-3 text-[#DC2626]" />
            <span>Archived</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F7F5] text-[#64748B] border border-[#E5EBE6]">
            <Clock className="w-3 h-3 text-[#94A3B8]" />
            <span>Operation</span>
          </span>
        );
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'lanforge':
        return <Radio className="w-3.5 h-3.5 text-[#247A51]" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-[#8B5CF6]" />;
      case 'chamber':
        return <Box className="w-3.5 h-3.5 text-[#D97706]" />;
      default:
        return <History className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5EBE6]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
            Central Activity & Audit History
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable, append-only operational audit log tracking allocations, transfers, and state transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#EBF4EF] border border-[#D5E9DE] text-xs text-[#247A51] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Append-Only Trail</span>
          </div>

          <button
            type="button"
            onClick={exportAuditCSV}
            className="p-1.5 text-xs text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] p-3 rounded border border-[#E5EBE6] space-y-3 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by asset tag, employee, user, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[#F5F7F5] border border-[#E5EBE6] text-[#172A21] placeholder-[#94A3B8] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F5F7F5] p-0.5 rounded border border-[#E5EBE6] overflow-x-auto">
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
                {cat === 'all' ? 'All Fleet' : cat === 'lanforge' ? 'LANforges' : `${cat.charAt(0).toUpperCase() + cat.slice(1)}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5EBE6]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] font-medium">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded bg-[#FFFFFF] border border-[#E5EBE6] text-[#172A21] focus:outline-none focus:border-[#247A51]"
            >
              <option value="all">All Operations</option>
              <option value="assigned">Assigned</option>
              <option value="returned">Returned</option>
              <option value="transferred">Transferred</option>
              <option value="maintenance">Diagnostic</option>
              <option value="status_change">Status Shift</option>
              <option value="created">Created</option>
              <option value="archived">Archived</option>
            </select>
          </div>

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

          {(searchQuery || categoryFilter !== 'all' || actionFilter !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setActionFilter('all');
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

      {/* TABLE */}
      <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAF9] border-b border-[#E5EBE6] text-[#64748B] font-semibold select-none">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Inventory ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6] text-[#172A21]">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748B]">
                    <History className="w-8 h-8 text-[#94A3B8] mx-auto mb-1.5" />
                    <p className="font-semibold text-xs text-[#172A21]">No audit log entries found</p>
                    <p className="text-[11px] text-[#94A3B8]">Adjust search criteria or date filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((log) => (
                  <tr 
                    key={log.id}
                    className="hover:bg-[#F9FAF9] transition-colors cursor-pointer"
                    onClick={() => setSelectedActivity(log)}
                  >
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                      {log.timestamp.includes('T') ? new Date(log.timestamp).toLocaleString() : log.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#172A21]">
                      {log.unitAssetTag || 'System'}
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(log.inventoryCategory)}
                        <span>{log.inventoryCategory || 'Asset'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#172A21]">
                      {log.employeeName || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B]">
                      {log.performedBy || log.user?.name || 'Admin'}
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(log);
                        }}
                        className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-[#E5EBE6] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#64748B]">
          <div>
            Showing <span className="font-semibold text-[#172A21]">{filteredActivities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#172A21]">
              {Math.min(currentPage * pageSize, filteredActivities.length)}
            </span>{' '}
            of <span className="font-semibold text-[#172A21]">{filteredActivities.length}</span> audit logs
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#FFFFFF] rounded border border-[#E5EBE6] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EBE6]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#EBF4EF] rounded text-[#247A51]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172A21]">
                    Audit Record: {selectedActivity.id}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Cryptographically logged system operation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                    Operation Action
                  </span>
                  <div>{getActionBadge(selectedActivity.action)}</div>
                </div>

                <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                    Inventory Asset
                  </span>
                  <div className="font-mono font-bold text-[#172A21]">{selectedActivity.unitAssetTag}</div>
                </div>

                <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                    Associated Employee
                  </span>
                  <div className="font-semibold text-[#172A21]">{selectedActivity.employeeName || '—'}</div>
                </div>

                <div className="p-2.5 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-0.5">
                    Performed By
                  </span>
                  <div className="font-semibold text-[#172A21]">{selectedActivity.performedBy || selectedActivity.user?.name || 'Admin'}</div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">
                  Full Operation Description
                </span>
                <p className="text-[#172A21] leading-relaxed">{selectedActivity.description}</p>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#E5EBE6] text-[11px] text-[#64748B] flex items-center justify-between">
                <span>Timestamp:</span>
                <span className="font-mono text-[#172A21]">{selectedActivity.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#E5EBE6]">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-3 py-1.5 text-xs text-[#172A21] bg-[#F5F7F5] hover:bg-[#EBF4EF] rounded border border-[#E5EBE6]"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
