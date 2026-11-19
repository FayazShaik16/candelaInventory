'use client';

import React, { useState, useMemo } from 'react';
import { MobileItem, GlobalInventoryStatus } from '@/types/inventory';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Download, 
  Plus, 
  Eye, 
  Edit3, 
  Archive, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';

interface MobileTableProps {
  data: MobileItem[];
  onView: (item: MobileItem) => void;
  onEdit: (item: MobileItem) => void;
  onArchive: (item: MobileItem) => void;
  onAddNew: () => void;
  isAdmin: boolean;
}

export function MobileTable({
  data,
  onView,
  onEdit,
  onArchive,
  onAddNew,
  isAdmin,
}: MobileTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'sNo' | 'deviceId' | 'brand' | 'status'>('sNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [columnVisibility, setColumnVisibility] = useState({
    sNo: true,
    deviceId: true,
    deviceBrand: true,
    model: true,
    project: true,
    poc: true,
    status: true,
    actions: true,
  });

  const processedData = useMemo(() => {
    let result = data.filter((item) => !item.isArchived);

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.deviceId.toLowerCase().includes(q) ||
          i.deviceBrand.toLowerCase().includes(q) ||
          i.model.toLowerCase().includes(q) ||
          i.project.toLowerCase().includes(q) ||
          (i.pocName && i.pocName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'sNo') comp = a.sNo - b.sNo;
      else if (sortField === 'deviceId') comp = a.deviceId.localeCompare(b.deviceId);
      else if (sortField === 'brand') comp = a.deviceBrand.localeCompare(b.deviceBrand);
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      return sortAsc ? comp : -comp;
    });

    return result;
  }, [data, statusFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field: 'sNo' | 'deviceId' | 'brand' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['S.No', 'Device ID', 'Device Brand', 'Model', 'Project', 'PoC', 'Status'];
    const rows = processedData.map((i) => [
      i.sNo,
      `"${i.deviceId}"`,
      `"${i.deviceBrand}"`,
      `"${i.model}"`,
      `"${i.project}"`,
      `"${i.pocName || 'Unassigned'}"`,
      `"${i.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `candela_mobiles_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== 'all';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg overflow-hidden flex flex-col text-xs shadow-none">
      {/* Toolbar */}
      <div className="p-3 border-b border-[#E5EBE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Handset ID, Model, PoC..."
              className="w-full h-8 pl-8 pr-2.5 bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-2.5 pr-7 bg-[#FFFFFF] border border-[#E5EBE6] hover:border-[#CBD5E1] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In-Use">In-Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="h-8 px-2 flex items-center gap-1 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded border border-[#FEE2E2]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-2.5 flex items-center gap-1.5 text-xs text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onAddNew}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mobile</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21]">
              {columnVisibility.sNo && (
                <th className="py-2.5 px-3 font-semibold text-center w-12">
                  <button
                    type="button"
                    onClick={() => handleSort('sNo')}
                    className="flex items-center gap-1 hover:text-[#247A51] mx-auto"
                  >
                    <span>S.No</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.deviceId && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('deviceId')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Device ID</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.deviceBrand && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('brand')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Device Brand</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.model && <th className="py-2.5 px-3 font-semibold">Model</th>}
              {columnVisibility.project && <th className="py-2.5 px-3 font-semibold">Project</th>}
              {columnVisibility.poc && <th className="py-2.5 px-3 font-semibold">PoC</th>}
              {columnVisibility.status && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.actions && (
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EBE6]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onView(item)}
                  className="hover:bg-[#F9FAF9] transition-colors cursor-pointer"
                >
                  {columnVisibility.sNo && (
                    <td className="py-2.5 px-3 text-center text-[#64748B] font-mono">{item.sNo}</td>
                  )}
                  {columnVisibility.deviceId && (
                    <td className="py-2.5 px-3 font-mono font-bold text-[#247A51]">
                      {item.deviceId}
                    </td>
                  )}
                  {columnVisibility.deviceBrand && (
                    <td className="py-2.5 px-3 font-medium text-[#172A21]">{item.deviceBrand}</td>
                  )}
                  {columnVisibility.model && (
                    <td className="py-2.5 px-3 text-[#64748B]">{item.model}</td>
                  )}
                  {columnVisibility.project && (
                    <td className="py-2.5 px-3 text-[#172A21] max-w-[200px] truncate">
                      {item.project}
                    </td>
                  )}
                  {columnVisibility.poc && (
                    <td className="py-2.5 px-3 text-[#172A21]">{item.pocName}</td>
                  )}
                  {columnVisibility.status && (
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className="p-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onArchive(item)}
                              className="p-1 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                              title="Archive"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-[#64748B]">
                  No matching Mobile units found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#E5EBE6] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
        <div>
          Showing <strong>{(currentPage - 1) * pageSize + (paginatedData.length > 0 ? 1 : 0)}</strong> to{' '}
          <strong>{Math.min(currentPage * pageSize, processedData.length)}</strong> of{' '}
          <strong>{processedData.length}</strong> Mobiles
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-[#E5EBE6] rounded hover:bg-[#F5F7F5] disabled:opacity-40"
          >
            First
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 border border-[#E5EBE6] rounded hover:bg-[#F5F7F5] disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 border border-[#E5EBE6] rounded hover:bg-[#F5F7F5] disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-[#E5EBE6] rounded hover:bg-[#F5F7F5] disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
