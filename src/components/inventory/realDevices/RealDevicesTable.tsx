'use client';

import React, { useState, useMemo } from 'react';
import { MobileItem, DesktopItem, GlobalInventoryStatus } from '@/types/inventory';
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
  Smartphone,
  Monitor,
  Layers,
  Filter
} from 'lucide-react';

export type RealDeviceType = 'mobile' | 'desktop';

export interface UnifiedRealDevice {
  id: string;
  sNo: number;
  deviceType: RealDeviceType;
  deviceId: string;
  deviceBrand: string;
  model: string;
  project: string;
  pocId: string | null;
  pocName?: string;
  status: GlobalInventoryStatus;
  isArchived: boolean;
  rawItem: MobileItem | DesktopItem;
}

interface RealDevicesTableProps {
  mobiles: MobileItem[];
  desktops: DesktopItem[];
  onView: (item: MobileItem | DesktopItem, type: RealDeviceType) => void;
  onEdit: (item: MobileItem | DesktopItem, type: RealDeviceType) => void;
  onArchive: (id: string, tag: string, type: RealDeviceType) => void;
  onAddMobile: () => void;
  onAddDesktop: () => void;
  isAdmin: boolean;
}

export function RealDevicesTable({
  mobiles,
  desktops,
  onView,
  onEdit,
  onArchive,
  onAddMobile,
  onAddDesktop,
  isAdmin,
}: RealDevicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'sNo' | 'type' | 'deviceId' | 'brand' | 'status'>('sNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Combine into single unified dataset
  const unifiedData: UnifiedRealDevice[] = useMemo(() => {
    const list: UnifiedRealDevice[] = [];
    let count = 1;

    // Add mobiles
    mobiles
      .filter((m) => !m.isArchived)
      .forEach((m) => {
        list.push({
          id: m.id,
          sNo: count++,
          deviceType: 'mobile',
          deviceId: m.deviceId,
          deviceBrand: m.deviceBrand,
          model: m.model,
          project: m.project,
          pocId: m.pocId,
          pocName: m.pocName,
          status: m.status,
          isArchived: m.isArchived,
          rawItem: m,
        });
      });

    // Add desktops
    desktops
      .filter((d) => !d.isArchived)
      .forEach((d) => {
        list.push({
          id: d.id,
          sNo: count++,
          deviceType: 'desktop',
          deviceId: d.deviceId,
          deviceBrand: d.deviceBrand,
          model: d.model,
          project: d.project,
          pocId: d.pocId,
          pocName: d.pocName,
          status: d.status,
          isArchived: d.isArchived,
          rawItem: d,
        });
      });

    return list;
  }, [mobiles, desktops]);

  // Counts for pills
  const totalCount = unifiedData.length;
  const mobileCount = unifiedData.filter((d) => d.deviceType === 'mobile').length;
  const desktopCount = unifiedData.filter((d) => d.deviceType === 'desktop').length;

  const processedData = useMemo(() => {
    let result = [...unifiedData];

    // Filter by device type (mobile vs desktop)
    if (typeFilter !== 'all') {
      result = result.filter((i) => i.deviceType === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.deviceId.toLowerCase().includes(q) ||
          i.deviceBrand.toLowerCase().includes(q) ||
          i.model.toLowerCase().includes(q) ||
          i.project.toLowerCase().includes(q) ||
          i.deviceType.toLowerCase().includes(q) ||
          (i.pocName && i.pocName.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'sNo') comp = a.sNo - b.sNo;
      else if (sortField === 'type') comp = a.deviceType.localeCompare(b.deviceType);
      else if (sortField === 'deviceId') comp = a.deviceId.localeCompare(b.deviceId);
      else if (sortField === 'brand') comp = a.deviceBrand.localeCompare(b.deviceBrand);
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      return sortAsc ? comp : -comp;
    });

    return result;
  }, [unifiedData, typeFilter, statusFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field: 'sNo' | 'type' | 'deviceId' | 'brand' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['S.No', 'Device Type', 'Device ID', 'Device Brand', 'Model', 'Project', 'PoC', 'Status'];
    const rows = processedData.map((i, idx) => [
      idx + 1,
      i.deviceType.toUpperCase(),
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
    link.download = `candela_real_devices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const hasActiveFilters = Boolean(searchQuery) || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl overflow-hidden flex flex-col text-xs shadow-none">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-[#E5EBE6] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, model, brand, engineer..."
              className="w-full h-8 pl-8 pr-2.5 bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded-lg text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none transition-colors"
            />
          </div>

          {/* Device Type Filter Switcher (All / Mobiles / Desktops) */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#F1F5F2] border border-[#E5EBE6] text-xs">
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-[#172A21] shadow-xs'
                  : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({totalCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('mobile');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'mobile'
                  ? 'bg-white text-[#7E22CE] shadow-xs'
                  : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobiles ({mobileCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('desktop');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
                typeFilter === 'desktop'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-[#64748B] hover:text-[#172A21]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktops ({desktopCount})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-2.5 pr-7 bg-[#FFFFFF] border border-[#E5EBE6] hover:border-[#CBD5E1] rounded-lg text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In-Use">In-Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-[#247A51] hover:underline px-1.5 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] hover:bg-[#F5F7F5] text-[#172A21] rounded-lg text-xs font-medium transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onAddMobile}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#7E22CE] hover:bg-[#6B21A8] text-white rounded-lg text-xs font-medium transition-colors"
                title="Register Mobile Device"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Mobile</span>
              </button>
              <button
                type="button"
                onClick={onAddDesktop}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#247A51] hover:bg-[#1D6342] text-white rounded-lg text-xs font-medium transition-colors"
                title="Register Desktop Workstation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Desktop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21]">
              <th className="py-2.5 px-3 font-semibold text-center w-12">
                <button
                  type="button"
                  onClick={() => handleSort('sNo')}
                  className="flex items-center justify-center gap-1 mx-auto hover:text-[#247A51]"
                >
                  <span>#</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold w-28">
                <button
                  type="button"
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-[#247A51]"
                >
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort('deviceId')}
                  className="flex items-center gap-1 hover:text-[#247A51]"
                >
                  <span>Device ID / Tag</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort('brand')}
                  className="flex items-center gap-1 hover:text-[#247A51]"
                >
                  <span>Brand & Model</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">Project / Lab</th>
              <th className="py-2.5 px-3 font-semibold">Assigned Engineer (PoC)</th>
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
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EBE6]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const isMobile = item.deviceType === 'mobile';
                return (
                  <tr key={item.id} className="hover:bg-[#F9FAF9] transition-colors">
                    <td className="py-2.5 px-3 text-center text-[#64748B] font-mono">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      {isMobile ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F3FF] text-[#7E22CE] border border-[#DDD6FE]">
                          <Smartphone className="w-3 h-3 text-[#7E22CE]" />
                          <span>Mobile</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#0284C7] border border-[#BFDBFE]">
                          <Monitor className="w-3 h-3 text-[#0284C7]" />
                          <span>Desktop</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#172A21]">
                      {item.deviceId}
                    </td>
                    <td className="py-2.5 px-3 text-[#172A21]">
                      <div className="font-semibold">{item.deviceBrand}</div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-xs">{item.model}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#172A21]">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#F5F7F5] border border-[#E5EBE6] text-[#475569]">
                        {item.project || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#172A21]">
                      {item.pocName ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#EBF4EF] text-[#247A51] border border-[#D5E9DE] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {item.pocName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="truncate max-w-[140px]">{item.pocName}</span>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onView(item.rawItem, item.deviceType)}
                          className="p-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded transition-colors"
                          title="View Hardware Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(item.rawItem, item.deviceType)}
                              className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded transition-colors"
                              title="Edit Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onArchive(item.id, item.deviceId, item.deviceType)}
                              className="p-1 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                              title="Archive Hardware"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#64748B]">
                  No matching real devices found in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#E5EBE6] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-xs text-[#64748B]">
        <div>
          Showing{' '}
          <strong className="text-[#172A21]">
            {processedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-[#172A21]">
            {Math.min(currentPage * pageSize, processedData.length)}
          </strong>{' '}
          of <strong className="text-[#172A21]">{processedData.length}</strong> real devices
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-[#E5EBE6] hover:bg-[#F5F7F5] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-medium text-[#172A21]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded border border-[#E5EBE6] hover:bg-[#F5F7F5] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
