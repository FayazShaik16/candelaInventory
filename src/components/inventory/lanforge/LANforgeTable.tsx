'use client';

import React, { useState, useMemo } from 'react';
import { LANforgeItem, GlobalInventoryStatus, LANforgeLocation } from '@/types/inventory';
import { useDropdowns } from '@/context/DropdownContext';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Check, 
  Download, 
  Plus, 
  Eye, 
  Edit3, 
  Archive, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';

interface LANforgeTableProps {
  data: LANforgeItem[];
  onView: (item: LANforgeItem) => void;
  onEdit: (item: LANforgeItem) => void;
  onArchive: (item: LANforgeItem) => void;
  onAddNew: () => void;
  isAdmin: boolean;
}

export function LANforgeTable({
  data,
  onView,
  onEdit,
  onArchive,
  onAddNew,
  isAdmin,
}: LANforgeTableProps) {
  const { getItemsByCategory } = useDropdowns();
  const locationOptions = getItemsByCategory('locations', true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortField, setSortField] = useState<'sNo' | 'lanforgeId' | 'status' | 'location' | 'clients'>('sNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Column Visibility
  const [columnVisibility, setColumnVisibility] = useState({
    sNo: true,
    location: true,
    testbedIp: true,
    project: true,
    pocName: true,
    lanforgeId: true,
    lanforgeModel: true,
    maxEthernetSpeed: true,
    totalClients: true,
    noOf11beClients: false,
    noOf11axClients: false,
    noOf11acClients: false,
    noOf11nClients: false,
    status: true,
    comments: false,
    previouslyUsedBy: true,
    actions: true,
  });

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = data.filter((item) => !item.isArchived);

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (locationFilter !== 'all') {
      result = result.filter((i) => i.location === locationFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.lanforgeId.toLowerCase().includes(q) ||
          i.lanforgeModel.toLowerCase().includes(q) ||
          i.testbedIp.includes(q) ||
          i.project.toLowerCase().includes(q) ||
          (i.pocName && i.pocName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'sNo') comp = a.sNo - b.sNo;
      else if (sortField === 'lanforgeId') comp = a.lanforgeId.localeCompare(b.lanforgeId);
      else if (sortField === 'status') comp = a.status.localeCompare(b.status);
      else if (sortField === 'location') comp = a.location.localeCompare(b.location);
      else if (sortField === 'clients') comp = a.totalClients - b.totalClients;
      return sortAsc ? comp : -comp;
    });

    return result;
  }, [data, statusFilter, locationFilter, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (field: 'sNo' | 'lanforgeId' | 'status' | 'location' | 'clients') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'S.No',
      'Location',
      'Testbed IP',
      'Project',
      'PoC Name',
      'LANforge ID',
      'LANforge Model',
      'Maximum Ethernet Speed',
      'Total Number of Clients',
      'No of 11be Clients',
      'No of 11ax Clients',
      'No of 11ac Clients',
      'No of 11n Clients',
      'Status',
      'Comments',
      'Previously Used By',
    ];

    const rows = processedData.map((i) => [
      i.sNo,
      `"${i.location}"`,
      `"${i.testbedIp}"`,
      `"${i.project}"`,
      `"${i.pocName || 'Unassigned'}"`,
      `"${i.lanforgeId}"`,
      `"${i.lanforgeModel}"`,
      `"${i.maxEthernetSpeed}"`,
      i.totalClients,
      i.noOf11beClients,
      i.noOf11axClients,
      i.noOf11acClients,
      i.noOf11nClients,
      `"${i.status}"`,
      `"${(i.comments || '').replace(/"/g, '""')}"`,
      `"${(i.previouslyUsedBy || []).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `candela_lanforges_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Selection
  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(paginatedData.map((i) => i.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((i) => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== 'all' || locationFilter !== 'all';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg overflow-hidden flex flex-col text-xs shadow-none">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-[#E5EBE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search LANforge ID, IP, Model, PoC..."
              className="w-full h-8 pl-8 pr-2.5 bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-2.5 pr-7 bg-[#FFFFFF] border border-[#E5EBE6] hover:border-[#CBD5E1] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] appearance-none cursor-pointer"
            >
              <option value="all">All Locations</option>
              {locationOptions.map((loc) => (
                <option key={loc.id} value={loc.value}>
                  {loc.value}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Status Filter */}
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
                setLocationFilter('all');
                setCurrentPage(1);
              }}
              className="h-8 px-2 flex items-center gap-1 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded border border-[#FEE2E2]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          {/* Columns */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnsMenuOpen(!columnsMenuOpen)}
              className="h-8 px-2.5 flex items-center gap-1.5 text-xs text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Columns</span>
            </button>

            {columnsMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E5EBE6] rounded-md shadow-lg z-30 py-1.5 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#64748B] border-b border-[#E5EBE6] uppercase tracking-wider">
                  Toggle Columns
                </div>
                {Object.entries({
                  sNo: 'S.No',
                  location: 'Location',
                  testbedIp: 'Testbed IP',
                  project: 'Project',
                  pocName: 'PoC Name',
                  lanforgeId: 'LANforge ID',
                  lanforgeModel: 'Model',
                  maxEthernetSpeed: 'Max Speed',
                  totalClients: 'Total Clients',
                  noOf11beClients: '11be Clients',
                  noOf11axClients: '11ax Clients',
                  noOf11acClients: '11ac Clients',
                  noOf11nClients: '11n Clients',
                  status: 'Status',
                  comments: 'Comments',
                  previouslyUsedBy: 'Previously Used By',
                  actions: 'Actions',
                }).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setColumnVisibility((p) => ({
                        ...p,
                        [key]: !p[key as keyof typeof columnVisibility],
                      }))
                    }
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#F5F7F5] text-left text-[#172A21]"
                  >
                    <span>{label}</span>
                    {columnVisibility[key as keyof typeof columnVisibility] && (
                      <Check className="w-3.5 h-3.5 text-[#247A51]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-2.5 flex items-center gap-1.5 text-xs text-[#172A21] bg-white border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded"
            title="Export CSV of filtered records"
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
              <span>Add LANforge</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[340px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21]">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((i) => selectedIds.includes(i.id))
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#247A51] accent-[#247A51] cursor-pointer"
                />
              </th>
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
              {columnVisibility.lanforgeId && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('lanforgeId')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>LANforge ID</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.location && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('location')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Location</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.testbedIp && (
                <th className="py-2.5 px-3 font-semibold">Testbed IP</th>
              )}
              {columnVisibility.lanforgeModel && (
                <th className="py-2.5 px-3 font-semibold">Model</th>
              )}
              {columnVisibility.project && (
                <th className="py-2.5 px-3 font-semibold">Project</th>
              )}
              {columnVisibility.pocName && (
                <th className="py-2.5 px-3 font-semibold">PoC Name</th>
              )}
              {columnVisibility.maxEthernetSpeed && (
                <th className="py-2.5 px-3 font-semibold">Max Speed</th>
              )}
              {columnVisibility.totalClients && (
                <th className="py-2.5 px-3 font-semibold text-center">
                  <button
                    type="button"
                    onClick={() => handleSort('clients')}
                    className="flex items-center gap-1 hover:text-[#247A51] mx-auto"
                  >
                    <span>Clients</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.noOf11beClients && (
                <th className="py-2.5 px-3 font-semibold text-center">11be</th>
              )}
              {columnVisibility.noOf11axClients && (
                <th className="py-2.5 px-3 font-semibold text-center">11ax</th>
              )}
              {columnVisibility.noOf11acClients && (
                <th className="py-2.5 px-3 font-semibold text-center">11ac</th>
              )}
              {columnVisibility.noOf11nClients && (
                <th className="py-2.5 px-3 font-semibold text-center">11n</th>
              )}
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
              {columnVisibility.previouslyUsedBy && (
                <th className="py-2.5 px-3 font-semibold">Previously Used By</th>
              )}
              {columnVisibility.comments && (
                <th className="py-2.5 px-3 font-semibold">Comments</th>
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
                  className={`hover:bg-[#F9FAF9] transition-colors cursor-pointer ${
                    selectedIds.includes(item.id) ? 'bg-[#EBF4EF]/40' : ''
                  }`}
                >
                  <td
                    className="py-2.5 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="rounded border-[#CBD5E1] text-[#247A51] accent-[#247A51] cursor-pointer"
                    />
                  </td>
                  {columnVisibility.sNo && (
                    <td className="py-2.5 px-3 text-center text-[#64748B] font-mono">
                      {item.sNo}
                    </td>
                  )}
                  {columnVisibility.lanforgeId && (
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-[#247A51] hover:underline">
                        {item.lanforgeId}
                      </span>
                    </td>
                  )}
                  {columnVisibility.location && (
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#F5F7F5] border border-[#E5EBE6] font-semibold text-[#172A21]">
                        {item.location}
                      </span>
                    </td>
                  )}
                  {columnVisibility.testbedIp && (
                    <td className="py-2.5 px-3 font-mono text-[#64748B]">
                      {item.testbedIp && item.testbedIp !== '0.0.0.0' ? item.testbedIp : '—'}
                    </td>
                  )}
                  {columnVisibility.lanforgeModel && (
                    <td className="py-2.5 px-3 font-medium text-[#172A21]">
                      {item.lanforgeModel}
                    </td>
                  )}
                  {columnVisibility.project && (
                    <td className="py-2.5 px-3 text-[#172A21] max-w-[180px] truncate">
                      {item.project}
                    </td>
                  )}
                  {columnVisibility.pocName && (
                    <td className="py-2.5 px-3 text-[#172A21]">
                      {item.pocName}
                    </td>
                  )}
                  {columnVisibility.maxEthernetSpeed && (
                    <td className="py-2.5 px-3 text-[#64748B]">
                      {item.maxEthernetSpeed}
                    </td>
                  )}
                  {columnVisibility.totalClients && (
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#172A21]">
                      {item.totalClients}
                    </td>
                  )}
                  {columnVisibility.noOf11beClients && (
                    <td className="py-2.5 px-3 text-center font-mono text-[#64748B]">
                      {item.noOf11beClients}
                    </td>
                  )}
                  {columnVisibility.noOf11axClients && (
                    <td className="py-2.5 px-3 text-center font-mono text-[#64748B]">
                      {item.noOf11axClients}
                    </td>
                  )}
                  {columnVisibility.noOf11acClients && (
                    <td className="py-2.5 px-3 text-center font-mono text-[#64748B]">
                      {item.noOf11acClients}
                    </td>
                  )}
                  {columnVisibility.noOf11nClients && (
                    <td className="py-2.5 px-3 text-center font-mono text-[#64748B]">
                      {item.noOf11nClients}
                    </td>
                  )}
                  {columnVisibility.status && (
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                  )}
                  {columnVisibility.previouslyUsedBy && (
                    <td className="py-2.5 px-3 text-[#64748B] max-w-[140px] truncate">
                      {item.previouslyUsedBy && item.previouslyUsedBy.length > 0
                        ? item.previouslyUsedBy.join(', ')
                        : '—'}
                    </td>
                  )}
                  {columnVisibility.comments && (
                    <td className="py-2.5 px-3 text-[#64748B] max-w-[140px] truncate">
                      {item.comments || '—'}
                    </td>
                  )}
                  {columnVisibility.actions && (
                    <td
                      className="py-2.5 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className="p-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded"
                              title="Edit LANforge"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onArchive(item)}
                              className="p-1 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                              title="Archive Record"
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
                <td colSpan={18} className="py-12 text-center text-xs text-[#64748B]">
                  No matching LANforge records found.
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
          <strong>{processedData.length}</strong> LANforge units
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
