'use client';

import React, { useState, useMemo } from 'react';
import { UserProfile, UserRole, AccountStatus } from '@/types/auth';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  UserCheck, 
  UserX, 
  KeyRound, 
  SlidersHorizontal, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Shield,
  RotateCcw
} from 'lucide-react';

interface UserManagementTableProps {
  users: UserProfile[];
  currentUserId?: string;
  onViewUser: (user: UserProfile) => void;
  onEditUser: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
}

export function UserManagementTable({
  users,
  currentUserId,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onResetPassword,
  onChangeRole,
}: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'role' | 'status' | 'created'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState({
    sno: true,
    name: true,
    email: true,
    role: true,
    status: true,
    created: true,
    lastSignIn: true,
    actions: true,
  });

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let result = users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && u.account_status !== statusFilter) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.full_name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.full_name.localeCompare(b.full_name);
      } else if (sortField === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (sortField === 'status') {
        comparison = a.account_status.localeCompare(b.account_status);
      } else if (sortField === 'created') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [users, roleFilter, statusFilter, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  const handleSort = (field: 'name' | 'role' | 'status' | 'created') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const hasActiveFilters = Boolean(searchQuery) || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg overflow-hidden flex flex-col text-xs shadow-none">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-[#E5EBE6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full h-8 pl-8 pr-2.5 bg-[#FFFFFF] border border-[#E5EBE6] focus:border-[#247A51] rounded text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-2.5 pr-7 bg-[#FFFFFF] border border-[#E5EBE6] hover:border-[#CBD5E1] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="employee">Employees</option>
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="h-8 px-2 flex items-center gap-1 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded border border-[#FEE2E2]"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right side toolbar */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Column Visibility */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnsMenuOpen(!columnsMenuOpen)}
              className="h-8 px-2.5 flex items-center gap-1.5 text-xs text-[#172A21] bg-[#FFFFFF] border border-[#E5EBE6] hover:bg-[#F5F7F5] rounded"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Columns</span>
            </button>

            {columnsMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#E5EBE6] rounded-md shadow-sm z-30 py-1.5">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#64748B] border-b border-[#E5EBE6] uppercase tracking-wider">
                  Toggle Columns
                </div>
                {Object.entries({
                  sno: 'S.No',
                  name: 'Employee Name',
                  email: 'Email Address',
                  role: 'Role',
                  status: 'Account Status',
                  created: 'Date Created',
                  lastSignIn: 'Last Sign In',
                  actions: 'Actions',
                }).map(([key, label]) => {
                  const isVisible = columnVisibility[key as keyof typeof columnVisibility];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof columnVisibility],
                        }))
                      }
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-[#F5F7F5] text-left text-[#172A21]"
                    >
                      <span>{label}</span>
                      {isVisible && <Check className="w-3.5 h-3.5 text-[#247A51]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto min-h-[320px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5EBE6] bg-[#F9FAF9] text-[#172A21]">
              {columnVisibility.sno && (
                <th className="py-2.5 px-3 font-semibold text-center w-12">S.No</th>
              )}
              {columnVisibility.name && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Employee Name</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.email && (
                <th className="py-2.5 px-3 font-semibold">Email Address</th>
              )}
              {columnVisibility.role && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Role</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.status && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Account Status</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.created && (
                <th className="py-2.5 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort('created')}
                    className="flex items-center gap-1 hover:text-[#247A51]"
                  >
                    <span>Date Created</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                  </button>
                </th>
              )}
              {columnVisibility.lastSignIn && (
                <th className="py-2.5 px-3 font-semibold">Last Sign In</th>
              )}
              {columnVisibility.actions && (
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EBE6]">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u, idx) => {
                const sNo = (currentPage - 1) * pageSize + idx + 1;
                const isAdmin = u.role === 'admin';
                const isActive = u.account_status === 'active';
                const isSelf = u.id === currentUserId;

                return (
                  <tr key={u.id} className="hover:bg-[#F9FAF9] transition-colors">
                    {columnVisibility.sno && (
                      <td className="py-2.5 px-3 text-center text-[#64748B] font-mono">
                        {sNo}
                      </td>
                    )}
                    {columnVisibility.name && (
                      <td className="py-2.5 px-3 text-[#172A21]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EBF4EF] border border-[#D5E9DE] text-[#247A51] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-[#EBF4EF] text-[#247A51] font-normal px-1 rounded">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {columnVisibility.email && (
                      <td className="py-2.5 px-3 text-[#64748B] font-mono">
                        {u.email}
                      </td>
                    )}
                    {columnVisibility.role && (
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isAdmin
                              ? 'bg-[#173D30] text-[#FFFFFF]' // Dark green
                              : 'bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]' // Blue
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isAdmin ? 'Admin' : 'Employee'}</span>
                        </span>
                      </td>
                    )}
                    {columnVisibility.status && (
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isActive
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]' // Green
                              : 'bg-[#F5F7F5] text-[#64748B] border border-[#E5EBE6]' // Neutral grey
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#16A34A]' : 'bg-[#64748B]'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                    )}
                    {columnVisibility.created && (
                      <td className="py-2.5 px-3 text-[#64748B]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    )}
                    {columnVisibility.lastSignIn && (
                      <td className="py-2.5 px-3 text-[#64748B]">
                        {u.last_sign_in_at
                          ? new Date(u.last_sign_in_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    )}
                    {columnVisibility.actions && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewUser(u)}
                            className="p-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditUser(u)}
                            className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded"
                            title="Edit Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onChangeRole(u)}
                            disabled={isSelf}
                            className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded disabled:opacity-30 disabled:pointer-events-none"
                            title={isAdmin ? 'Change to Employee' : 'Promote to Admin'}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleStatus(u)}
                            disabled={isSelf}
                            className={`p-1 rounded disabled:opacity-30 disabled:pointer-events-none ${
                              isActive
                                ? 'text-[#D97706] hover:bg-[#FFFBEB]'
                                : 'text-[#16A34A] hover:bg-[#F0FDF4]'
                            }`}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onResetPassword(u)}
                            className="p-1 text-[#64748B] hover:text-[#247A51] hover:bg-[#EBF4EF] rounded"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-[#64748B]">
                  No matching employees found in user registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#E5EBE6] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
        <div>
          Showing <strong>{(currentPage - 1) * pageSize + (paginatedUsers.length > 0 ? 1 : 0)}</strong> to{' '}
          <strong>{Math.min(currentPage * pageSize, processedUsers.length)}</strong> of{' '}
          <strong>{processedUsers.length}</strong> employees
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
