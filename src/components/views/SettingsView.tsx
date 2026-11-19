'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  ListFilter, 
  Radio, 
  Cpu, 
  MapPin, 
  FolderKanban, 
  Laptop, 
  Box, 
  Zap, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Save, 
  X, 
  ShieldAlert,
  Server
} from 'lucide-react';
import { useDropdowns, DropdownCategory, DropdownItem } from '@/context/DropdownContext';
import { useAuth } from '@/context/AuthContext';

export function SettingsView() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const { 
    items, 
    getItemsByCategory, 
    addItem, 
    updateItem, 
    deleteItem, 
    toggleItemStatus, 
    resetCategoryToDefaults, 
    resetAllToDefaults 
  } = useDropdowns();

  // Active top-level settings tab
  const [activeTab, setActiveTab] = useState<'dropdowns' | 'facilities' | 'ai' | 'infrastructure'>('dropdowns');

  // Active dropdown category
  const [selectedCategory, setSelectedCategory] = useState<DropdownCategory>('locations');

  // Add / Edit Modal & State
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<DropdownItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const categories: Array<{ id: DropdownCategory; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'locations', label: 'Lab Locations', icon: <MapPin className="w-3.5 h-3.5" />, desc: 'Physical facilities, bays and racks (e.g., VINSR, OPEL, GVP)' },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-3.5 h-3.5" />, desc: 'Testing campaigns and validation initiatives' },
    { id: 'chipsets', label: 'Radio Chipsets', icon: <Cpu className="w-3.5 h-3.5" />, desc: 'Supported Wi-Fi 6E/7 radio interface chipsets' },
    { id: 'brands', label: 'Hardware Brands', icon: <Laptop className="w-3.5 h-3.5" />, desc: 'Desktop and mobile client manufacturers' },
    { id: 'chamberTypes', label: 'Chamber Types', icon: <Box className="w-3.5 h-3.5" />, desc: 'RF isolation and antenna testing enclosure types' },
    { id: 'ethernetSpeeds', label: 'Ethernet Speeds', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Network interface speed standards' },
  ];

  const currentCategoryMeta = categories.find((c) => c.id === selectedCategory)!;
  const currentItems = getItemsByCategory(selectedCategory, false).filter((item) => 
    !searchFilter.trim() || 
    item.label.toLowerCase().includes(searchFilter.toLowerCase()) || 
    item.value.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const openAddModal = () => {
    setFormLabel('');
    setFormValue('');
    setFormDescription('');
    setFormError(null);
    setIsAdding(true);
  };

  const openEditModal = (item: DropdownItem) => {
    setEditingItem(item);
    setFormLabel(item.label);
    setFormValue(item.value);
    setFormDescription(item.description || '');
    setFormError(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = addItem(selectedCategory, formLabel, formValue, formDescription);
    if (!res.success) {
      setFormError(res.error || 'Failed to add item.');
      return;
    }
    setIsAdding(false);
    showToast(`Added "${formLabel}" to ${currentCategoryMeta.label}.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setFormError(null);
    const res = updateItem(editingItem.id, {
      label: formLabel.trim(),
      value: formValue.trim(),
      description: formDescription.trim() || undefined,
    });
    if (!res.success) {
      setFormError(res.error || 'Failed to update item.');
      return;
    }
    setEditingItem(null);
    showToast(`Updated "${formLabel}".`);
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Are you sure you want to delete "${label}"? This option will no longer appear in future forms.`)) {
      const res = deleteItem(id);
      if (res.success) {
        showToast(`Deleted "${label}".`);
      }
    }
  };

  const handleToggle = (id: string, label: string, currentStatus: boolean) => {
    toggleItemStatus(id);
    showToast(`${currentStatus ? 'Deactivated' : 'Activated'} "${label}".`);
  };

  const handleResetCategory = () => {
    if (confirm(`Reset all ${currentCategoryMeta.label} to default Candela options? Any custom values in this category will be reset.`)) {
      resetCategoryToDefaults(selectedCategory);
      showToast(`Reset ${currentCategoryMeta.label} to system defaults.`);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl pb-12">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#E5EBE6] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#172A21] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#247A51]" />
            Platform Administration & Settings
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure system dropdown parameters, facility synchronization, AI copilot policies, and infrastructure.
          </p>
        </div>

        {/* Status Toast */}
        {successToast && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EBF4EF] border border-[#D5E9DE] text-[#247A51] text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E5EBE6] pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('dropdowns')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t transition-colors border-b-2 ${
            activeTab === 'dropdowns'
              ? 'border-[#247A51] text-[#247A51] bg-[#FFFFFF]'
              : 'border-transparent text-[#64748B] hover:text-[#172A21] hover:bg-[#F9FAF9]'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Dropdown Menu Values</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#EBF4EF] text-[#247A51] font-mono">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t transition-colors border-b-2 ${
            activeTab === 'facilities'
              ? 'border-[#247A51] text-[#247A51] bg-[#FFFFFF]'
              : 'border-transparent text-[#64748B] hover:text-[#172A21] hover:bg-[#F9FAF9]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Lab Facilities & Bays</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t transition-colors border-b-2 ${
            activeTab === 'ai'
              ? 'border-[#247A51] text-[#247A51] bg-[#FFFFFF]'
              : 'border-transparent text-[#64748B] hover:text-[#172A21] hover:bg-[#F9FAF9]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Assistant Guardrails</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('infrastructure')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t transition-colors border-b-2 ${
            activeTab === 'infrastructure'
              ? 'border-[#247A51] text-[#247A51] bg-[#FFFFFF]'
              : 'border-transparent text-[#64748B] hover:text-[#172A21] hover:bg-[#F9FAF9]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Infrastructure & Deployment</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DROPDOWN MENU VALUES (ADMIN REQUESTED FEATURE)     */}
      {/* ========================================================= */}
      {activeTab === 'dropdowns' && (
        <div className="space-y-4">
          {/* Subheader bar with category selector pills */}
          <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-3">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Select Dropdown Category to Manage:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {categories.map((cat) => {
                const count = getItemsByCategory(cat.id, false).length;
                const activeCount = getItemsByCategory(cat.id, true).length;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchFilter('');
                    }}
                    className={`flex flex-col text-left p-2.5 rounded border transition-all ${
                      isSelected
                        ? 'border-[#247A51] bg-[#EBF4EF] text-[#247A51]'
                        : 'border-[#E5EBE6] bg-[#FFFFFF] hover:bg-[#F9FAF9] text-[#172A21]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        {cat.icon}
                        <span className="truncate">{cat.label}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">
                      {activeCount} active ({count} total)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Category Header & Actions */}
          <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F9FAF9]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#172A21] flex items-center gap-1.5">
                    {currentCategoryMeta.icon}
                    {currentCategoryMeta.label}
                  </h3>
                  <span className="text-[10px] bg-[#EBF4EF] text-[#247A51] font-semibold px-2 py-0.5 rounded border border-[#D5E9DE]">
                    {currentItems.length} Options
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {currentCategoryMeta.desc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter options..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#E5EBE6] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#247A51] w-40"
                />

                <button
                  type="button"
                  onClick={handleResetCategory}
                  className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded bg-[#FFFFFF] hover:bg-[#F5F7F5] transition-colors flex items-center gap-1"
                  title="Reset this category to default options"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors flex items-center gap-1 shadow-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>

            {/* Table of Dropdown Options */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5EBE6] bg-[#FFFFFF] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Display Label</th>
                    <th className="py-2.5 px-4">Value / Form Code</th>
                    <th className="py-2.5 px-4">Description / Notes</th>
                    <th className="py-2.5 px-4 text-center">Type</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBE6]">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748B]">
                        No dropdown options found matching &quot;{searchFilter}&quot;.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-[#F9FAF9] transition-colors ${
                          !item.isActive ? 'opacity-60 bg-[#F9FAF9]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-semibold text-[#172A21]">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#247A51]">
                          {item.value}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B] max-w-xs truncate">
                          {item.description || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {item.isSystemDefault ? (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                              System
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EBF4EF] text-[#247A51] border border-[#D5E9DE]">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(item.id, item.label, item.isActive)}
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border transition-colors ${
                              item.isActive
                                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#DCFCE7]'
                                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] hover:bg-[#FEE2E2]'
                            }`}
                            title="Click to toggle active state"
                          >
                            {item.isActive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            {item.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1 text-[#64748B] hover:text-[#172A21] hover:bg-[#E5EBE6] rounded"
                              title="Edit option"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!item.isSystemDefault && (
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id, item.label)}
                                className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded"
                                title="Delete option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LAB FACILITIES & HARDWARE SYNC                     */}
      {/* ========================================================= */}
      {activeTab === 'facilities' && (
        <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5EBE6]">
            <Radio className="w-4 h-4 text-[#247A51]" />
            <h3 className="text-xs font-bold text-[#172A21]">Laboratory Locations & RF Chambers</h3>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { name: 'VINSR (Lab Bay 1)', role: 'Primary 160MHz Dual 5GHz Channel Bonding Bay', status: 'Online Sync', ipRange: '192.168.1.100 - 192.168.1.150' },
              { name: 'OPEL (Lab Bay 2)', role: 'Automated 11be Multi-Link Benchmark Facility', status: 'Online Sync', ipRange: '192.168.1.151 - 192.168.1.200' },
              { name: 'GVP (Lab Bay 3)', role: 'Long-term AP Stress & Legacy Fallback Rack', status: 'Online Sync', ipRange: '192.168.1.201 - 192.168.1.250' },
              { name: 'San Jose RF Chamber Annex', role: 'Over-The-Air Anechoic Chamber', status: 'Standby Sync', ipRange: '10.20.4.0/24' },
            ].map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded bg-[#F9FAF9] border border-[#E5EBE6]">
                <div>
                  <span className="font-bold text-[#172A21] text-xs block">{loc.name}</span>
                  <span className="text-[11px] text-[#64748B]">{loc.role}</span>
                  <span className="text-[10px] font-mono text-[#94A3B8] block mt-0.5">Subnet: {loc.ipRange}</span>
                </div>
                <span className="text-[10px] text-[#247A51] bg-[#EBF4EF] border border-[#D5E9DE] px-2 py-0.5 rounded font-mono font-medium">
                  {loc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AI ASSISTANT AUTOMATION GUARDRAILS                 */}
      {/* ========================================================= */}
      {activeTab === 'ai' && (
        <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5EBE6]">
            <Cpu className="w-4 h-4 text-[#247A51]" />
            <h3 className="text-xs font-bold text-[#172A21]">AI Assistant Automation Permissions</h3>
          </div>
          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#247A51] accent-[#247A51]" />
              <div>
                <span className="font-semibold text-[#172A21]">Require manual confirmation on AI equipment reassignment</span>
                <p className="text-[11px] text-[#64748B]">Displays Action Preview Cards with HMAC tokens prior to applying mutations to database.</p>
              </div>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#247A51] accent-[#247A51]" />
              <div>
                <span className="font-semibold text-[#172A21]">Enforce 5-minute timeout on pending action tokens</span>
                <p className="text-[11px] text-[#64748B]">Expired tokens require re-parsing instruction to prevent stale race conditions.</p>
              </div>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#247A51] accent-[#247A51]" />
              <div>
                <span className="font-semibold text-[#172A21]">Strict Administrator clearance assertion</span>
                <p className="text-[11px] text-[#64748B]">Employee role accounts can query inventory but cannot execute hardware custody transfers.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: INFRASTRUCTURE & DEPLOYMENT METADATA              */}
      {/* ========================================================= */}
      {activeTab === 'infrastructure' && (
        <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5EBE6]">
            <Server className="w-4 h-4 text-[#247A51]" />
            <h3 className="text-xs font-bold text-[#172A21]">Production Architecture & Service Endpoints</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">Frontend Layer</span>
              <div className="font-semibold text-[#172A21]">Next.js App Router (Turbopack)</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">Platform: Vercel Production</div>
              <div className="text-[10px] font-mono text-[#247A51] mt-1">HTTPS • HSTS • Secure Cookies</div>
            </div>

            <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">AI Backend Layer</span>
              <div className="font-semibold text-[#172A21]">FastAPI + Pydantic v2</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">Platform: Hugging Face Spaces (Docker Port 7860)</div>
              <div className="text-[10px] font-mono text-[#247A51] mt-1">Llama-3.2-3B-Instruct • Local Rule Fallback</div>
            </div>

            <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">Database & Auth</span>
              <div className="font-semibold text-[#172A21]">Supabase PostgreSQL 15</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">RLS Enabled • SSR Auth Helpers • Partial Indexes</div>
              <div className="text-[10px] font-mono text-[#247A51] mt-1">Atomic Transfer Procedures • Append-Only Audit</div>
            </div>

            <div className="p-3 rounded border border-[#E5EBE6] bg-[#F9FAF9]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">Security & Secret Management</span>
              <div className="font-semibold text-[#172A21]">Non-Exposed Service Role Keys</div>
              <div className="text-[11px] text-[#64748B] mt-0.5">Zero wildcard CORS • Client-isolated privileged APIs</div>
              <div className="text-[10px] font-mono text-[#247A51] mt-1">Cryptographic HMAC Idempotency Guards</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW DROPDOWN OPTION                            */}
      {/* ========================================================= */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-[#172A21]/40 backdrop-blur-none flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-none w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 bg-[#F9FAF9] border-b border-[#E5EBE6] flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#172A21] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#247A51]" />
                Add New {currentCategoryMeta.label} Option
              </h4>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-[#64748B] hover:text-[#172A21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-4 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hillsboro RF Chamber Bay 4"
                  value={formLabel}
                  onChange={(e) => {
                    setFormLabel(e.target.value);
                    if (!formValue) {
                      setFormValue(e.target.value);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] focus:outline-none focus:border-[#247A51]"
                />
              </div>

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Stored Code / Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HILLS-BAY4"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] font-mono text-[11px] focus:outline-none focus:border-[#247A51]"
                />
                <span className="text-[10px] text-[#64748B]">Internal identifier stored in the database record.</span>
              </div>

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Description / Calibration Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding testbed configuration, facility bay, or frequency range..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] focus:outline-none focus:border-[#247A51] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded bg-white hover:bg-[#F5F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Option</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT DROPDOWN OPTION                               */}
      {/* ========================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#172A21]/40 backdrop-blur-none flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-none w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 bg-[#F9FAF9] border-b border-[#E5EBE6] flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#172A21] flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-[#247A51]" />
                Edit {currentCategoryMeta.label} Option
              </h4>
              <button 
                type="button" 
                onClick={() => setEditingItem(null)} 
                className="text-[#64748B] hover:text-[#172A21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] focus:outline-none focus:border-[#247A51]"
                />
              </div>

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Stored Code / Value *</label>
                <input
                  type="text"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] font-mono text-[11px] focus:outline-none focus:border-[#247A51]"
                />
              </div>

              <div>
                <label className="font-medium text-[#172A21] block mb-1">Description / Calibration Notes</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5EBE6] rounded bg-[#FFFFFF] text-[#172A21] focus:outline-none focus:border-[#247A51] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded bg-white hover:bg-[#F5F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Option</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
