'use client';

import React, { useState, useEffect } from 'react';
import { MobileItem, GlobalInventoryStatus } from '@/types/inventory';
import { useAuth } from '@/context/AuthContext';
import { useDropdowns } from '@/context/DropdownContext';
import { X, Smartphone, AlertCircle, Save, Loader2 } from 'lucide-react';

interface AddEditMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
  initialItem?: MobileItem | null;
}

export function AddEditMobileModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: AddEditMobileModalProps) {
  const { usersList } = useAuth();
  const { getItemsByCategory } = useDropdowns();
  const brandOptions = getItemsByCategory('brands', true);
  const projectOptions = getItemsByCategory('projects', true);
  const isEditing = Boolean(initialItem);

  const [deviceId, setDeviceId] = useState('');
  const [deviceBrand, setDeviceBrand] = useState('Google');
  const [model, setModel] = useState('');
  const [project, setProject] = useState('');
  const [pocId, setPocId] = useState('');
  const [status, setStatus] = useState<GlobalInventoryStatus>('Available');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setDeviceId(initialItem.deviceId);
      setDeviceBrand(initialItem.deviceBrand);
      setModel(initialItem.model);
      setProject(initialItem.project);
      setPocId(initialItem.pocId || '');
      setStatus(initialItem.status);
      setErrorMessage('');
    } else {
      setDeviceId('MOB-');
      setDeviceBrand('Google');
      setModel('Pixel 9 Pro');
      setProject('');
      setPocId('');
      setStatus('Available');
      setErrorMessage('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!deviceId.trim()) {
      setErrorMessage('Device ID is required.');
      return;
    }
    if (!model.trim()) {
      setErrorMessage('Model is required.');
      return;
    }
    if (!project.trim()) {
      setErrorMessage('Project is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSave({
      deviceId: deviceId.trim(),
      deviceBrand: deviceBrand.trim(),
      model: model.trim(),
      project: project.trim(),
      pocId: pocId || null,
      status,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to save Mobile record.');
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
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172A21]">
                {isEditing ? `Edit Mobile — ${initialItem?.deviceId}` : 'Register New Mobile Handset'}
              </h2>
              <p className="text-[11px] text-[#64748B]">Add mobile device to test client fleet</p>
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
            <label className="block text-xs font-medium text-[#172A21] mb-1">Device ID *</label>
            <input
              type="text"
              required
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g. MOB-PIXEL-01"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">Device Brand *</label>
              <select
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Pixel 9 Pro"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">Project *</label>
            <input
              type="text"
              required
              list="mobile-project-options"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. Netgear, SpaceX, Maintenance"
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
            <datalist id="mobile-project-options">
              {projectOptions.map((p) => (
                <option key={p.id} value={p.value} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">PoC (Point of Contact)</label>
              <select
                value={pocId}
                onChange={(e) => setPocId(e.target.value)}
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
                  <span>{isEditing ? 'Save Changes' : 'Register Mobile'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
