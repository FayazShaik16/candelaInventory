'use client';

import React, { useState, useEffect } from 'react';
import { ChamberItem, GlobalInventoryStatus } from '@/types/inventory';
import { useAuth } from '@/context/AuthContext';
import { useDropdowns } from '@/context/DropdownContext';
import { X, Box, AlertCircle, Save, Loader2 } from 'lucide-react';

interface AddEditChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
  initialItem?: ChamberItem | null;
}

export function AddEditChamberModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: AddEditChamberModalProps) {
  const { usersList } = useAuth();
  const { getItemsByCategory } = useDropdowns();
  const chamberTypeOptions = getItemsByCategory('chamberTypes', true);
  const projectOptions = getItemsByCategory('projects', true);
  const isEditing = Boolean(initialItem);

  const [chamberType, setChamberType] = useState('');
  const [chamberId, setChamberId] = useState('');
  const [usedById, setUsedById] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState<GlobalInventoryStatus>('Available');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setChamberType(initialItem.chamberType);
      setChamberId(initialItem.chamberId);
      setUsedById(initialItem.usedById || '');
      setProject(initialItem.project);
      setStatus(initialItem.status);
      setErrorMessage('');
    } else {
      const defaultVal = chamberTypeOptions.length > 0 ? chamberTypeOptions[0].value : 'Large';
      setChamberType(defaultVal);
      setChamberId('CH-');
      setUsedById('');
      setProject('');
      setStatus('Available');
      setErrorMessage('');
    }
  }, [initialItem, isOpen]);

  // Keep chamberType synchronized when chamberTypeOptions loads or updates from Settings
  useEffect(() => {
    if (!isEditing && isOpen && chamberTypeOptions.length > 0) {
      if (!chamberType || !chamberTypeOptions.some((c) => c.value === chamberType)) {
        setChamberType(chamberTypeOptions[0].value);
      }
    }
  }, [chamberTypeOptions, isEditing, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!chamberId.trim()) {
      setErrorMessage('Chamber ID is required.');
      return;
    }
    if (!chamberType.trim()) {
      setErrorMessage('Chamber Type is required.');
      return;
    }
    if (!project.trim()) {
      setErrorMessage('Project is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSave({
      chamberType: chamberType.trim(),
      chamberId: chamberId.trim(),
      usedById: usedById || null,
      project: project.trim(),
      status,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to save Chamber record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#247A51] text-white flex items-center justify-center font-bold text-xs">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172A21]">
                {isEditing ? `Edit Chamber — ${initialItem?.chamberId}` : 'Register Test Chamber'}
              </h2>
              <p className="text-[11px] text-[#64748B]">Add RF / Anechoic isolation chamber</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[#64748B] hover:text-[#172A21] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">Chamber ID *</label>
            <input
              type="text"
              required
              value={chamberId}
              onChange={(e) => setChamberId(e.target.value)}
              placeholder="e.g. CH-ISO-01"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#172A21]">Chamber Type *</label>
              <span className="text-[10px] text-[#64748B]">Updated via Settings</span>
            </div>
            <select
              required
              value={chamberType}
              onChange={(e) => setChamberType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51] cursor-pointer"
            >
              <option value="" disabled>-- Select Chamber Type --</option>
              {chamberTypeOptions.map((c) => (
                <option key={c.id} value={c.value}>
                  {c.label !== c.value ? `${c.label} (${c.value})` : c.label}
                </option>
              ))}
              {/* Preserves custom chamber type when editing existing items */}
              {initialItem?.chamberType && !chamberTypeOptions.some((c) => c.value === initialItem.chamberType) && (
                <option key="existing-chamber-type" value={initialItem.chamberType}>
                  {initialItem.chamberType}
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">Project *</label>
            <input
              type="text"
              required
              list="chamber-project-options"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Jio, Chamberlain, Netgear, SpaceX"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
            <datalist id="chamber-project-options">
              {projectOptions.map((p) => (
                <option key={p.id} value={p.value} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">Used By (Employee)</label>
              <select
                value={usedById}
                onChange={(e) => setUsedById(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">Unassigned</option>
                {usersList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GlobalInventoryStatus)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="Available">Available</option>
                <option value="In-Use">In-Use</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5EBE6] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#172A21] border border-[#E5EBE6] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Register Chamber'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
