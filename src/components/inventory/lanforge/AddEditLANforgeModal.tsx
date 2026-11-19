'use client';

import React, { useState, useEffect } from 'react';
import { 
  LANforgeItem, 
  LANforgeLocation, 
  GlobalInventoryStatus, 
  LANforgeRadio 
} from '@/types/inventory';
import { useAuth } from '@/context/AuthContext';
import { useDropdowns } from '@/context/DropdownContext';
import { X, Plus, Trash2, Radio, AlertCircle, Save, Loader2 } from 'lucide-react';

interface AddEditLANforgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, radios: LANforgeRadio[]) => Promise<{ success: boolean; error?: string }>;
  initialItem?: LANforgeItem | null;
}

export function AddEditLANforgeModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: AddEditLANforgeModalProps) {
  const { usersList } = useAuth();
  const { getItemsByCategory } = useDropdowns();
  const locationOptions = getItemsByCategory('locations', true);
  const chipsetOptions = getItemsByCategory('chipsets', true);
  const speedOptions = getItemsByCategory('ethernetSpeeds', true);
  const projectOptions = getItemsByCategory('projects', true);
  const isEditing = Boolean(initialItem);

  const [location, setLocation] = useState<LANforgeLocation>('VINSR');
  const [testbedIp, setTestbedIp] = useState('');
  const [project, setProject] = useState('');
  const [pocId, setPocId] = useState<string>('');
  const [lanforgeId, setLanforgeId] = useState('');
  const [lanforgeModel, setLanforgeModel] = useState('LANforge CT521B');
  const [maxEthernetSpeed, setMaxEthernetSpeed] = useState('10 Gbps');
  const [totalClients, setTotalClients] = useState(64);
  const [noOf11beClients, setNoOf11beClients] = useState(0);
  const [noOf11axClients, setNoOf11axClients] = useState(48);
  const [noOf11acClients, setNoOf11acClients] = useState(16);
  const [noOf11nClients, setNoOf11nClients] = useState(0);
  const [status, setStatus] = useState<GlobalInventoryStatus>('Available');
  const [comments, setComments] = useState('');

  // Repeatable Radio Configuration Section
  const [radios, setRadios] = useState<LANforgeRadio[]>([
    { id: 'r-1', chipset: 'Qualcomm QCN9274', quantity: 2 },
  ]);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setLocation(initialItem.location);
      setTestbedIp(initialItem.testbedIp);
      setProject(initialItem.project);
      setPocId(initialItem.pocId || '');
      setLanforgeId(initialItem.lanforgeId);
      setLanforgeModel(initialItem.lanforgeModel);
      setMaxEthernetSpeed(initialItem.maxEthernetSpeed);
      setTotalClients(initialItem.totalClients);
      setNoOf11beClients(initialItem.noOf11beClients);
      setNoOf11axClients(initialItem.noOf11axClients);
      setNoOf11acClients(initialItem.noOf11acClients);
      setNoOf11nClients(initialItem.noOf11nClients);
      setStatus(initialItem.status);
      setComments(initialItem.comments);
      setRadios(initialItem.radios && initialItem.radios.length > 0 ? initialItem.radios : []);
      setErrorMessage('');
    } else {
      setLocation('VINSR');
      setTestbedIp('192.168.1.');
      setProject('');
      setPocId('');
      setLanforgeId('LF-521B-');
      setLanforgeModel('LANforge CT521B');
      setMaxEthernetSpeed('10 Gbps');
      setTotalClients(64);
      setNoOf11beClients(0);
      setNoOf11axClients(48);
      setNoOf11acClients(16);
      setNoOf11nClients(0);
      setStatus('Available');
      setComments('');
      setRadios([{ id: `rad-${Date.now()}`, chipset: 'Qualcomm QCN9274', quantity: 2 }]);
      setErrorMessage('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  // Validate IP Address helper
  const isValidIpv4 = (ip: string) => {
    const regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    return regex.test(ip.trim());
  };

  const handleAddRadio = () => {
    setRadios([
      ...radios,
      { id: `rad-${Date.now()}`, chipset: 'Qualcomm QCN9274', quantity: 1 },
    ]);
  };

  const handleRemoveRadio = (id: string) => {
    setRadios(radios.filter((r) => r.id !== id));
  };

  const handleRadioChange = (id: string, field: 'chipset' | 'quantity', val: any) => {
    setRadios(
      radios.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!lanforgeId.trim()) {
      setErrorMessage('LANforge ID is required.');
      return;
    }

    if (testbedIp.trim() && !isValidIpv4(testbedIp)) {
      setErrorMessage('Please enter a valid IPv4 Testbed IP address (e.g. 192.168.1.101) or leave empty if unassigned.');
      return;
    }

    if (!project.trim()) {
      setErrorMessage('Project description or name is required.');
      return;
    }

    // Client counts non-negative check
    if (
      totalClients < 0 ||
      noOf11beClients < 0 ||
      noOf11axClients < 0 ||
      noOf11acClients < 0 ||
      noOf11nClients < 0
    ) {
      setErrorMessage('Client counts must be non-negative integers.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSave(
      {
        location,
        testbedIp: testbedIp.trim(),
        project: project.trim(),
        pocId: pocId || null,
        lanforgeId: lanforgeId.trim(),
        lanforgeModel: lanforgeModel.trim(),
        maxEthernetSpeed,
        totalClients: Number(totalClients),
        noOf11beClients: Number(noOf11beClients),
        noOf11axClients: Number(noOf11axClients),
        noOf11acClients: Number(noOf11acClients),
        noOf11nClients: Number(noOf11nClients),
        status,
        comments: comments.trim(),
      },
      radios
    );
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to save LANforge record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5EBE6] flex items-center justify-between bg-[#F9FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#247A51] text-white flex items-center justify-center font-bold text-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172A21]">
                {isEditing ? `Edit LANforge — ${initialItem?.lanforgeId}` : 'Register New LANforge Testbed'}
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Configure network testbed parameters, client capacity, and radio chipsets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172A21] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded text-xs text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Identification & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                LANforge ID *
              </label>
              <input
                type="text"
                required
                value={lanforgeId}
                onChange={(e) => setLanforgeId(e.target.value)}
                placeholder="e.g. LF-521B-001"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Location Dropdown *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LANforgeLocation)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                {locationOptions.map((loc) => (
                  <option key={loc.id} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Testbed IP
              </label>
              <input
                type="text"
                value={testbedIp}
                onChange={(e) => setTestbedIp(e.target.value)}
                placeholder="Optional (e.g. 192.168.1.101)"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs font-mono text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>
          </div>

          {/* Model & Ethernet Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                LANforge Model *
              </label>
              <input
                type="text"
                required
                value={lanforgeModel}
                onChange={(e) => setLanforgeModel(e.target.value)}
                placeholder="e.g. CT523c"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Max Ethernet Speed
              </label>
              <select
                value={maxEthernetSpeed}
                onChange={(e) => setMaxEthernetSpeed(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                {speedOptions.map((s) => (
                  <option key={s.id} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Status *
              </label>
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

          {/* Project & PoC Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                Project *
              </label>
              <input
                type="text"
                required
                list="lanforge-project-options"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Netgear, SpaceX, Jio"
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              />
              <datalist id="lanforge-project-options">
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.value} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#172A21] mb-1">
                PoC Name (Authorized Employee)
              </label>
              <select
                value={pocId}
                onChange={(e) => setPocId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
              >
                <option value="">Unassigned (In Pool)</option>
                {usersList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Counts Breakdown */}
          <div className="p-3 bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Client Emulation Capacity (Integers)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="block text-[11px] text-[#64748B] mb-0.5">Total Clients</label>
                <input
                  type="number"
                  min="0"
                  value={totalClients}
                  onChange={(e) => setTotalClients(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-0.5">11be Clients</label>
                <input
                  type="number"
                  min="0"
                  value={noOf11beClients}
                  onChange={(e) => setNoOf11beClients(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-0.5">11ax Clients</label>
                <input
                  type="number"
                  min="0"
                  value={noOf11axClients}
                  onChange={(e) => setNoOf11axClients(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-0.5">11ac Clients</label>
                <input
                  type="number"
                  min="0"
                  value={noOf11acClients}
                  onChange={(e) => setNoOf11acClients(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-0.5">11n Clients</label>
                <input
                  type="number"
                  min="0"
                  value={noOf11nClients}
                  onChange={(e) => setNoOf11nClients(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                />
              </div>
            </div>
          </div>

          {/* Repeatable WiFi Radio Chipset Section */}
          <div className="p-3 bg-[#FFFFFF] border border-[#E5EBE6] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                WiFi Radio Configuration ({radios.length} Chipsets)
              </span>
              <button
                type="button"
                onClick={handleAddRadio}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#247A51] hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>Add Radio</span>
              </button>
            </div>

            {radios.length === 0 ? (
              <p className="text-[11px] text-[#94A3B8] italic py-1">
                No active radios configured (Ethernet traffic generator only).
              </p>
            ) : (
              <div className="space-y-2">
                {radios.map((rad, idx) => (
                  <div key={rad.id || idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={rad.chipset}
                        onChange={(e) => handleRadioChange(rad.id, 'chipset', e.target.value)}
                        className="w-full px-2 py-1 bg-[#F9FAF9] border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                      >
                        {chipsetOptions.map((c) => (
                          <option key={c.id} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        max="16"
                        value={rad.quantity}
                        onChange={(e) => handleRadioChange(rad.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-[#F9FAF9] border border-[#E5EBE6] rounded text-xs text-[#172A21]"
                        title="Quantity of this radio chipset"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRadio(rad.id)}
                      className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                      title="Remove radio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-medium text-[#172A21] mb-1">
              Comments & Testbed Notes
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Operational details, calibration status, or test chamber cabling notes..."
              className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E5EBE6] rounded text-xs text-[#172A21] focus:outline-none focus:border-[#247A51]"
            />
          </div>

          {/* Controls */}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Register LANforge'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
