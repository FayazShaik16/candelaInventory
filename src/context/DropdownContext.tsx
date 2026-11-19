'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DropdownCategory = 
  | 'locations'
  | 'projects'
  | 'chipsets'
  | 'brands'
  | 'chamberTypes'
  | 'ethernetSpeeds';

export interface DropdownItem {
  id: string;
  category: DropdownCategory;
  label: string;
  value: string;
  isActive: boolean;
  isSystemDefault?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_DROPDOWN_VALUES: Record<DropdownCategory, Array<{ label: string; value: string; description?: string }>> = {
  locations: [
    { label: 'VINSR (Lab Bay 1)', value: 'VINSR', description: 'Primary high-density testbed bay' },
    { label: 'OPEL (Lab Bay 2)', value: 'OPEL', description: 'Automated 11be multi-link benchmark facility' },
    { label: 'GVP (Lab Bay 3)', value: 'GVP', description: 'Long-term stability and legacy validation rack' },
    { label: 'PRIMA (Lab Bay 4)', value: 'PRIMA', description: 'PM Team & GX automated test chamber' },
  ],
  projects: [
    { label: 'Netgear', value: 'Netgear', description: 'Netgear enterprise AP throughput & roaming' },
    { label: 'SpaceX', value: 'SpaceX', description: 'Satellite ground station & client stress matrix' },
    { label: 'Jio', value: 'Jio', description: 'Telecom high-capacity carrier validation' },
    { label: 'Chamberlain', value: 'Chamberlain', description: 'IoT & residential mobility testbed' },
    { label: 'Hotwire', value: 'Hotwire', description: 'Fiber-to-the-home broadband stress tests' },
    { label: 'celona', value: 'celona', description: 'Private 5G and Wi-Fi convergence testbed' },
    { label: 'GX', value: 'GX', description: 'Next-generation gateway benchmark' },
    { label: 'PM Team', value: 'PM Team', description: 'Product management validation fleet' },
    { label: 'Inventory', value: 'Inventory', description: 'Unassigned lab hardware pool' },
    { label: 'Maintenance', value: 'Maintenance', description: 'Hardware under repair or diagnostics' },
  ],
  chipsets: [
    { label: 'Intel BE200 (Wi-Fi 7)', value: 'Intel BE200', description: 'Tri-band 802.11be M.2 client radio' },
    { label: 'MediaTek MT7996 (Wi-Fi 7)', value: 'MTK7996', description: 'Enterprise 802.11be high-throughput chipset' },
    { label: 'MediaTek MT7915 (Wi-Fi 6)', value: 'MTK7915', description: 'Dual-band 802.11ax PCIe radio' },
    { label: 'MediaTek MT7922 (Wi-Fi 6E)', value: 'MTK7922', description: '2x2 160MHz 6GHz client radio' },
    { label: 'Intel AX210 (Wi-Fi 6E)', value: 'Intel AX210', description: 'Tri-band 2.4/5/6 GHz radio' },
    { label: 'Qualcomm ATH10k (Wave 1/2)', value: 'Qualcomm ATH10k', description: 'Enterprise 802.11ac PCIe radio' },
    { label: 'Qualcomm ATH9k (802.11n)', value: 'Qualcomm ATH9k', description: 'High-density 802.11abgn legacy radio' },
    { label: 'ATH10k Wave 1 (802.11ac)', value: 'ath10k-Wave1', description: 'Legacy 802.11ac wave-1 PCIe radio' },
    { label: 'ATH9k Legacy (802.11n)', value: 'ath9k', description: 'Legacy 802.11n radio' },
    { label: '802.11ac Wave-1', value: 'AC wave-1', description: 'First-generation 802.11ac client radio' },
    { label: '802.11ac Wave-2', value: 'AC Wave-2', description: 'MU-MIMO 802.11ac client radio' },
  ],
  brands: [
    { label: 'Samsung Electronics', value: 'Samsung', description: 'Android flagship test devices' },
    { label: 'Apple Inc.', value: 'Apple', description: 'iOS and macOS reference hardware' },
    { label: 'Google Pixel', value: 'Google Pixel', description: 'Reference Android roaming devices' },
    { label: 'OnePlus', value: 'Oneplus', description: 'High-performance mobile clients' },
    { label: 'HP Enterprise', value: 'HP', description: 'Windows lab controller computers' },
    { label: 'Dell Technologies', value: 'Dell', description: 'Precision Linux workstations' },
    { label: 'Lenovo', value: 'Lenovo', description: 'ThinkPad / ThinkStation test clients' },
    { label: 'Vivo', value: 'Vivo', description: 'Mobile test devices' },
    { label: 'Oppo', value: 'oppo', description: 'Mobile test devices' },
    { label: 'Honor', value: 'Honor', description: 'Mobile test devices' },
    { label: 'Qualcomm', value: 'Qualcomm', description: 'Reference design evaluation platforms' },
    { label: 'MacBook', value: 'MacBook', description: 'Apple macOS testbed laptop' },
    { label: 'iPad', value: 'IPad', description: 'Apple iOS tablet device' },
  ],
  chamberTypes: [
    { label: 'RF Isolation Chamber (Shielded Box)', value: 'RF Isolation Chamber', description: 'High-attenuation shielded RF box (>90 dB isolation)' },
    { label: 'Over-The-Air Chamber (OTA)', value: 'Over-The-Air Chamber (OTA)', description: 'Multipath simulation and antenna array testing' },
    { label: 'Reverberation Chamber', value: 'Reverberation Chamber', description: 'Isotropic statistical multipath test environment' },
    { label: 'Anechoic Chamber', value: 'Anechoic Chamber', description: 'Free-space RF emission and antenna calibration' },
    { label: 'Large Chamber', value: 'Large', description: 'Full-size multipath walk-in isolation chamber' },
    { label: 'Medium Chamber', value: 'Medium', description: 'Standard benchtop RF isolation enclosure' },
    { label: 'HiaB (High-Isolation Box)', value: 'HiaB', description: 'High-density multi-radio RF shielded box' },
    { label: 'Thermal Chamber', value: 'Thermal chamber', description: 'Environmental temperature stress chamber' },
  ],
  ethernetSpeeds: [
    { label: '10 Gbps (10GBASE-T / SFP+)', value: '10 Gbps', description: 'High-speed stress testbed backhaul' },
    { label: '1 Gbps (1000BASE-T)', value: '1 Gbps', description: 'Standard gigabit interface' },
    { label: '800 Mbps (Fast Ethernet / Co-channel)', value: '800 Mbps', description: 'Bandwidth throttled test interface' },
    { label: '2.5 Gbps (2.5GBASE-T)', value: '2.5 Gbps', description: 'Multi-gigabit access point uplink' },
    { label: '5 Gbps (5GBASE-T)', value: '5 Gbps', description: 'Enterprise Wi-Fi 6 access point port' },
    { label: '25 Gbps (25GBASE-SR / SFP28)', value: '25 Gbps', description: 'High-capacity LANforge CT523c interface' },
    { label: '40 Gbps (QSFP+)', value: '40 Gbps', description: 'Core lab aggregation interface' },
    { label: '100 Gbps (QSFP28)', value: '100 Gbps', description: 'Next-generation backbone throughput pipeline' },
  ],
};

function generateInitialItems(): DropdownItem[] {
  const items: DropdownItem[] = [];
  const now = '2026-11-19T00:00:00.000Z';

  Object.entries(DEFAULT_DROPDOWN_VALUES).forEach(([cat, vals]) => {
    vals.forEach((v, idx) => {
      items.push({
        id: `dd-${cat}-${idx + 1}`,
        category: cat as DropdownCategory,
        label: v.label,
        value: v.value,
        isActive: true,
        isSystemDefault: true,
        description: v.description,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return items;
}

interface DropdownContextType {
  items: DropdownItem[];
  getItemsByCategory: (category: DropdownCategory, activeOnly?: boolean) => DropdownItem[];
  addItem: (category: DropdownCategory, label: string, value: string, description?: string) => { success: boolean; error?: string };
  updateItem: (id: string, updates: Partial<Pick<DropdownItem, 'label' | 'value' | 'description' | 'isActive'>>) => { success: boolean; error?: string };
  deleteItem: (id: string) => { success: boolean; error?: string };
  toggleItemStatus: (id: string) => { success: boolean; error?: string };
  resetCategoryToDefaults: (category: DropdownCategory) => void;
  resetAllToDefaults: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const STORAGE_KEY = 'candela_dropdown_settings_v2';

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DropdownItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to parse stored dropdown options:', err);
      }
    }
    return generateInitialItems();
  });

  // Fetch live options from database API on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/dropdowns')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dropdowns from server, using local fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.warn('Failed to persist dropdown settings:', err);
      }
    }
  }, [items]);

  const getItemsByCategory = (category: DropdownCategory, activeOnly = true): DropdownItem[] => {
    return items.filter((i) => i.category === category && (!activeOnly || i.isActive));
  };

  const addItem = (category: DropdownCategory, label: string, value: string, description?: string) => {
    const cleanLabel = label.trim();
    const cleanValue = value.trim();

    if (!cleanLabel || !cleanValue) {
      return { success: false, error: 'Both label and value are required.' };
    }

    const exists = items.some(
      (i) => i.category === category && (i.value.toLowerCase() === cleanValue.toLowerCase() || i.label.toLowerCase() === cleanLabel.toLowerCase())
    );
    if (exists) {
      return { success: false, error: `An option with value "${cleanValue}" or label "${cleanLabel}" already exists in ${category}.` };
    }

    const newItem: DropdownItem = {
      id: `dd-${category}-${Date.now()}`,
      category,
      label: cleanLabel,
      value: cleanValue,
      isActive: true,
      isSystemDefault: false,
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);

    // Persist to database in background
    fetch('/api/dropdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(console.error);

    return { success: true };
  };

  const updateItem = (id: string, updates: Partial<Pick<DropdownItem, 'label' | 'value' | 'description' | 'isActive'>>) => {
    const target = items.find((i) => i.id === id);
    if (!target) {
      return { success: false, error: 'Item not found.' };
    }

    if (updates.value && updates.value !== target.value) {
      const exists = items.some(
        (i) => i.id !== id && i.category === target.category && i.value.toLowerCase() === updates.value!.toLowerCase()
      );
      if (exists) {
        return { success: false, error: `An option with value "${updates.value}" already exists in ${target.category}.` };
      }
    }

    const updatedItem = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

    // Persist to database in background
    fetch('/api/dropdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    }).catch(console.error);

    return { success: true };
  };

  const deleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) {
      return { success: false, error: 'Item not found.' };
    }

    setItems((prev) => prev.filter((i) => i.id !== id));

    // Persist to database in background
    fetch(`/api/dropdowns?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(console.error);

    return { success: true };
  };

  const toggleItemStatus = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) {
      return { success: false, error: 'Item not found.' };
    }

    const updatedItem = {
      ...target,
      isActive: !target.isActive,
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

    fetch('/api/dropdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    }).catch(console.error);

    return { success: true };
  };

  const resetCategoryToDefaults = (category: DropdownCategory) => {
    const defaults = DEFAULT_DROPDOWN_VALUES[category].map((v, idx) => ({
      id: `dd-${category}-${idx + 1}`,
      category,
      label: v.label,
      value: v.value,
      isActive: true,
      isSystemDefault: true,
      description: v.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setItems((prev) => [...prev.filter((i) => i.category !== category), ...defaults]);

    defaults.forEach((item) => {
      fetch('/api/dropdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(console.error);
    });
  };

  const resetAllToDefaults = () => {
    setItems(generateInitialItems());
  };

  return (
    <DropdownContext.Provider
      value={{
        items,
        getItemsByCategory,
        addItem,
        updateItem,
        deleteItem,
        toggleItemStatus,
        resetCategoryToDefaults,
        resetAllToDefaults,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdowns() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdowns must be used within a DropdownProvider');
  }
  return context;
}
