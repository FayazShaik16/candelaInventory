'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, StatusLegend } from '../inventory/shared/StatusBadge';
import { 
  Sliders, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Plus, 
  ArrowRight,
  Radio,
  SlidersHorizontal,
  X,
  Send,
  Layers
} from 'lucide-react';

interface AttenuatorUnit {
  id: string;
  tag: string;
  model: string;
  channels: string;
  attenuationRange: string;
  stepSize: string;
  frequencyRange: string;
  status: 'In-Use' | 'Available' | 'Under Maintenance';
  project: string;
  custodian: string;
  location: string;
}

export const INITIAL_ATTENUATORS: AttenuatorUnit[] = [
  {
    id: 'att-01',
    tag: 'CAN-ATT-8X8-01',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz (Wi-Fi 7)',
    status: 'In-Use',
    project: 'Jio',
    custodian: 'Deepika',
    location: 'OPEL Lab - Rack 04'
  },
  {
    id: 'att-02',
    tag: 'CAN-ATT-8X8-02',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz (Wi-Fi 7)',
    status: 'In-Use',
    project: 'Netgear',
    custodian: 'Sirisha',
    location: 'OPEL Lab - Rack 02'
  },
  {
    id: 'att-03',
    tag: 'CAN-ATT-8X8-03',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz (Wi-Fi 7)',
    status: 'Available',
    project: 'Unassigned',
    custodian: 'Lab Stock',
    location: 'Central Equipment Room'
  },
  {
    id: 'att-04',
    tag: 'CAN-ATT-4X4-01',
    model: '4x4 High-Speed Step Attenuator',
    channels: '4 In / 4 Out',
    attenuationRange: '0 - 63.0 dB',
    stepSize: '1.0 dB',
    frequencyRange: '0.5 - 6.0 GHz',
    status: 'In-Use',
    project: 'Jio 5G',
    custodian: 'Fayaz Ahmed',
    location: 'GVP Chamber Bay'
  },
  {
    id: 'att-05',
    tag: 'CAN-ATT-4X4-02',
    model: '4x4 High-Speed Step Attenuator',
    channels: '4 In / 4 Out',
    attenuationRange: '0 - 63.0 dB',
    stepSize: '1.0 dB',
    frequencyRange: '0.5 - 6.0 GHz',
    status: 'Available',
    project: 'Unassigned',
    custodian: 'Lab Stock',
    location: 'Central Equipment Room'
  },
  {
    id: 'att-06',
    tag: 'CAN-ATT-12X12-01',
    model: '12x12 Matrix Attenuator Enclosure',
    channels: '12 In / 12 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 8.0 GHz (Ultra-Wideband)',
    status: 'In-Use',
    project: 'Chamberlain',
    custodian: 'Lokesh',
    location: 'GVP Anechoic Chamber'
  },
  {
    id: 'att-07',
    tag: 'CAN-ATT-8X8-04',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz',
    status: 'Under Maintenance',
    project: 'Calibration Bench',
    custodian: 'Admin Lead',
    location: 'RF Metrology Bench'
  },
  {
    id: 'att-08',
    tag: 'CAN-ATT-2X2-01',
    model: '2x2 Portable Benchmark Attenuator',
    channels: '2 In / 2 Out',
    attenuationRange: '0 - 31.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '2.4 / 5 / 6 GHz',
    status: 'Available',
    project: 'Unassigned',
    custodian: 'Lab Stock',
    location: 'Benchtop Stand 1'
  },
  {
    id: 'att-09',
    tag: 'CAN-ATT-8X8-05',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz (Wi-Fi 7)',
    status: 'In-Use',
    project: 'Google',
    custodian: 'Sandeep',
    location: 'OPEL Lab - Rack 05'
  },
  {
    id: 'att-10',
    tag: 'CAN-ATT-8X8-06',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz (Wi-Fi 7)',
    status: 'In-Use',
    project: 'Meta',
    custodian: 'Ramesh',
    location: 'OPEL Lab - Rack 03'
  },
  {
    id: 'att-11',
    tag: 'CAN-ATT-4X4-03',
    model: '4x4 High-Speed Step Attenuator',
    channels: '4 In / 4 Out',
    attenuationRange: '0 - 63.0 dB',
    stepSize: '1.0 dB',
    frequencyRange: '0.5 - 6.0 GHz',
    status: 'In-Use',
    project: 'Intel',
    custodian: 'Vikas',
    location: 'GVP Chamber Bay 2'
  },
  {
    id: 'att-12',
    tag: 'CAN-ATT-4X4-04',
    model: '4x4 High-Speed Step Attenuator',
    channels: '4 In / 4 Out',
    attenuationRange: '0 - 63.0 dB',
    stepSize: '1.0 dB',
    frequencyRange: '0.5 - 6.0 GHz',
    status: 'Available',
    project: 'Unassigned',
    custodian: 'Lab Stock',
    location: 'Central Equipment Room'
  },
  {
    id: 'att-13',
    tag: 'CAN-ATT-16X16-01',
    model: '16x16 Full Matrix RF Attenuator',
    channels: '16 In / 16 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.5 GHz (Wi-Fi 7 Massive MIMO)',
    status: 'In-Use',
    project: 'Qualcomm',
    custodian: 'Pradeep',
    location: 'Anechoic Chamber 1'
  },
  {
    id: 'att-14',
    tag: 'CAN-ATT-8X8-07',
    model: '8x8 Programmable RF Attenuator Bank',
    channels: '8 In / 8 Out',
    attenuationRange: '0 - 95.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '0.1 - 7.2 GHz',
    status: 'Under Maintenance',
    project: 'Calibration Bench',
    custodian: 'Admin Lead',
    location: 'RF Metrology Bench'
  },
  {
    id: 'att-15',
    tag: 'CAN-ATT-2X2-02',
    model: '2x2 Portable Benchmark Attenuator',
    channels: '2 In / 2 Out',
    attenuationRange: '0 - 31.5 dB',
    stepSize: '0.5 dB',
    frequencyRange: '2.4 / 5 / 6 GHz',
    status: 'In-Use',
    project: 'Cisco',
    custodian: 'Sneha',
    location: 'Benchtop Stand 2'
  },
  {
    id: 'att-16',
    tag: 'CAN-ATT-4X4-05',
    model: '4x4 High-Speed Step Attenuator',
    channels: '4 In / 4 Out',
    attenuationRange: '0 - 63.0 dB',
    stepSize: '1.0 dB',
    frequencyRange: '0.5 - 6.0 GHz',
    status: 'Available',
    project: 'Unassigned',
    custodian: 'Lab Stock',
    location: 'Central Equipment Room'
  }
];

interface AttenuatorsViewProps {
  onRequestResource?: () => void;
}

export function AttenuatorsView({ onRequestResource }: AttenuatorsViewProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In-Use' | 'Available' | 'Under Maintenance'>('all');

  const filtered = useMemo(() => {
    return INITIAL_ATTENUATORS.filter((att) => {
      if (statusFilter !== 'all' && att.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tag = att.tag.toLowerCase();
        const model = att.model.toLowerCase();
        const project = att.project.toLowerCase();
        const custodian = att.custodian.toLowerCase();
        if (!tag.includes(q) && !model.includes(q) && !project.includes(q) && !custodian.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, statusFilter]);

  const counts = useMemo(() => {
    const total = INITIAL_ATTENUATORS.length;
    const inUse = INITIAL_ATTENUATORS.filter((a) => a.status === 'In-Use').length;
    const available = INITIAL_ATTENUATORS.filter((a) => a.status === 'Available').length;
    const maintenance = INITIAL_ATTENUATORS.filter((a) => a.status === 'Under Maintenance').length;
    return { total, inUse, available, maintenance };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5EBE6]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#E0F2FE] rounded text-[#0369A1]">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#172A21]">
              RF Programmable Attenuators Fleet
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Candela programmable step attenuators and RF pathloss banks for automated OTA chamber and Wi-Fi roaming testing.
          </p>
        </div>

        {!isAdmin && onRequestResource && (
          <button
            type="button"
            onClick={onRequestResource}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#247A51] hover:bg-[#1D6342] rounded-lg transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Attenuator</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Units</span>
            <Layers className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#172A21] mt-1">{counts.total}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Cataloged attenuator banks</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>In-Use</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803D] mt-1">{counts.inUse}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Active in RF testbeds</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Available</span>
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0369A1] mt-1">{counts.available}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Ready for project allocation</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E5EBE6] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Maintenance</span>
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#C2410C] mt-1">{counts.maintenance}</div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Calibration / diagnostics</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E5EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tag, model, project, custodian..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9FAF9] border border-[#E5EBE6] rounded-lg text-[#172A21] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#247A51]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'In-Use', 'Available', 'Under Maintenance'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#247A51] text-white'
                  : 'bg-[#F5F7F5] text-[#64748B] hover:bg-[#E5EBE6]'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5EBE6] overflow-hidden shadow-sm">
        <StatusLegend />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAF9] border-b border-[#E5EBE6] text-[#64748B] font-semibold uppercase text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-3">Model & Specs</th>
                <th className="py-3 px-3">Channels & Range</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-3">Custodian</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE6]">
              {filtered.map((att) => (
                <tr key={att.id} className="hover:bg-[#F9FAF9] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#172A21] text-[12px]">
                    {att.tag}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#172A21]">{att.model}</div>
                    <div className="text-[11px] text-[#64748B]">{att.frequencyRange}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono text-[#172A21]">{att.channels}</div>
                    <div className="text-[11px] text-[#64748B]">{att.attenuationRange} (Step: {att.stepSize})</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={att.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-medium text-[#172A21]">
                    {att.project}
                  </td>
                  <td className="py-3 px-3 text-[#172A21]">
                    {att.custodian}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] text-[11.5px]">
                    {att.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
