'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { useDropdowns } from '@/context/DropdownContext';
import { ResourceCategory, RequestPriority } from '@/types/inventory';
import { 
  X, 
  Send, 
  Radio, 
  Smartphone, 
  Monitor, 
  Box, 
  Sliders, 
  Cable, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  Layers,
  FolderKanban
} from 'lucide-react';

interface RequestResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ResourceCategory;
}

export function RequestResourceModal({
  isOpen,
  onClose,
  defaultCategory = 'lanforge',
}: RequestResourceModalProps) {
  const { user } = useAuth();
  const { createRequest, lanforges, desktops, mobiles, chambers } = useInventory();
  const { getItemsByCategory } = useDropdowns();
  const projectOptions = getItemsByCategory('projects', true);

  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>(defaultCategory);
  const [targetSpecs, setTargetSpecs] = useState('');
  const [preferredAssetTag, setPreferredAssetTag] = useState('');
  const [project, setProject] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('2 Weeks');
  const [priority, setPriority] = useState<RequestPriority>('Standard');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Category labels and icons
  const categories: { key: ResourceCategory; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'lanforge', label: 'LANforge Testbed', desc: 'Traffic generator / Wi-Fi 6E/7', icon: Radio },
    { key: 'mobile', label: 'Real Mobile Device', desc: 'Android / iOS client stations', icon: Smartphone },
    { key: 'desktop', label: 'Workstation / Desktop', desc: 'Linux / Windows test controllers', icon: Monitor },
    { key: 'chamber', label: 'RF / Anechoic Chamber', desc: 'Shielded box or OTA chamber', icon: Box },
    { key: 'attenuator', label: 'RF Attenuator', desc: 'CAN-ATT 8x8 programmable box', icon: Sliders },
    { key: 'accessory', label: 'Cables & Accessories', desc: 'RF cables, splitters, antennas', icon: Cable },
  ];

  // Available units for quick selection if employee wants a specific asset
  const getAvailableUnits = () => {
    switch (resourceCategory) {
      case 'lanforge':
        return lanforges.filter((i) => i.status === 'Available' && !i.isArchived).map((i) => ({ id: i.id, tag: i.lanforgeId, model: i.lanforgeModel }));
      case 'desktop':
        return desktops.filter((i) => i.status === 'Available' && !i.isArchived).map((i) => ({ id: i.id, tag: i.deviceId, model: `${i.deviceBrand} ${i.model}` }));
      case 'mobile':
        return mobiles.filter((i) => i.status === 'Available' && !i.isArchived).map((i) => ({ id: i.id, tag: i.deviceId, model: `${i.deviceBrand} ${i.model}` }));
      case 'chamber':
        return chambers.filter((i) => i.status === 'Available' && !i.isArchived).map((i) => ({ id: i.id, tag: i.chamberId, model: i.chamberType }));
      default:
        return [];
    }
  };

  const availableUnits = getAvailableUnits();
  const selectedCatMeta = categories.find((c) => c.key === resourceCategory) || categories[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to submit an equipment request.');
      return;
    }

    if (!project.trim()) {
      setErrorMsg('Please specify the project or test campaign name.');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('Please briefly describe the testing purpose / objective.');
      return;
    }

    setIsSubmitting(true);

    const matchingUnit = availableUnits.find((u) => u.tag === preferredAssetTag);

    const res = await createRequest({
      employeeId: user.id,
      employeeName: user.full_name || 'Candela Engineer',
      employeeEmail: user.email || '',
      resourceCategory,
      resourceLabel: selectedCatMeta.label,
      targetSpecs: targetSpecs.trim() || undefined,
      preferredAssetId: matchingUnit?.id,
      preferredAssetTag: preferredAssetTag || undefined,
      project: project.trim(),
      purpose: purpose.trim(),
      priority,
      duration,
      adminNotes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Request ${res.request?.id} submitted successfully! The lab operations team has been notified.`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setErrorMsg(res.error || 'Failed to submit equipment request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#FFFFFF] border border-[#E5EBE6] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#247A51] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172A21]">Request Hardware & Resources</h2>
              <p className="text-[11px] text-[#64748B]">Request testbeds, client fleet, attenuators, or chambers for your project</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-[#64748B] hover:text-[#172A21] hover:bg-[#E5EBE6] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-[#EBF4EF] border border-[#D5E9DE] rounded-lg text-xs text-[#247A51] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1: Select Resource Category */}
          <div>
            <label className="block text-xs font-semibold text-[#172A21] mb-1.5">
              1. What type of equipment do you need? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = resourceCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setResourceCategory(cat.key);
                      setPreferredAssetTag('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#247A51] bg-[#EBF4EF] text-[#247A51] ring-1 ring-[#247A51]'
                        : 'border-[#E5EBE6] bg-white text-[#172A21] hover:bg-[#F9FAF9]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#247A51]' : 'text-[#64748B]'}`} />
                      <span className="font-bold text-xs truncate">{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] leading-tight line-clamp-1">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Preferred Unit or Custom Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Preferred Available Unit (Optional)
              </label>
              <select
                value={preferredAssetTag}
                onChange={(e) => {
                  setPreferredAssetTag(e.target.value);
                  const matching = availableUnits.find((u) => u.tag === e.target.value);
                  if (matching) {
                    setTargetSpecs(matching.model);
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">Any available unit matching specs</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.tag}>
                    {u.tag} — {u.model}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">
                {availableUnits.length} units currently in available pool
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Target Model / Specifications
              </label>
              <input
                type="text"
                value={targetSpecs}
                onChange={(e) => setTargetSpecs(e.target.value)}
                placeholder="e.g. Wi-Fi 7 CT523c / 4-radio / Pixel 9 Pro"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
              <span className="text-[10px] text-[#64748B] mt-0.5 block">
                Specify radio count, chipset, or hardware standard
              </span>
            </div>
          </div>

          {/* Step 3: Project & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Project / Test Campaign *
              </label>
              <input
                type="text"
                required
                list="req-project-options"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Jio, Chamberlain, SpaceX, Netgear"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
              <datalist id="req-project-options">
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.value} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Required Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="3 Days">3 Days (Quick test / validation)</option>
                <option value="1 Week">1 Week (Sprint milestone)</option>
                <option value="2 Weeks">2 Weeks (Standard sprint)</option>
                <option value="1 Month">1 Month (Comprehensive testing)</option>
                <option value="Ongoing">Ongoing (Long-term testbed setup)</option>
              </select>
            </div>
          </div>

          {/* Purpose & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Testing Purpose & Objectives *
              </label>
              <textarea
                required
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Briefly describe what test scripts, roaming benchmarks, or throughput validations will be run..."
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="Standard">Standard</option>
                <option value="High Priority">High Priority</option>
                <option value="Urgent">Urgent (Customer Blocker)</option>
              </select>
              <span className="text-[10px] text-[#64748B] mt-1 block">
                Urgent requests are flagged directly on admin review
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Special Setup Requirements / Lab Bay Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need RF cables with SMA connectors, or specific firmware 5.4.8"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded-md text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5EBE6] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">
              Submitting as: <strong className="text-[#172A21]">{user?.full_name || 'Candela Engineer'}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded-md bg-white hover:bg-[#F5F7F5] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
