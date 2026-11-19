-- ==============================================================================
-- 004_dropdown_settings_schema.sql
-- Candela Inventory Platform — Dynamic Dropdown Settings & Options
-- ==============================================================================

-- 1. Create Dropdown Settings Table
CREATE TABLE IF NOT EXISTS public.inventory_dropdown_settings (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('locations', 'projects', 'chipsets', 'brands', 'chamberTypes', 'ethernetSpeeds')),
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_default BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_dropdown_category_value UNIQUE (category, value)
);

-- Index for fast lookup by category and active state
CREATE INDEX IF NOT EXISTS idx_dropdown_category_active 
ON public.inventory_dropdown_settings(category, is_active);

-- Enable Row Level Security
ALTER TABLE public.inventory_dropdown_settings ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated employees can view active and inactive dropdown values
CREATE POLICY "Allow authenticated users to read dropdown settings"
ON public.inventory_dropdown_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only administrators can create new dropdown options
CREATE POLICY "Allow administrators to insert dropdown settings"
ON public.inventory_dropdown_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Policy: Only administrators can update dropdown settings
CREATE POLICY "Allow administrators to update dropdown settings"
ON public.inventory_dropdown_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Policy: Only administrators can delete non-system dropdown settings
CREATE POLICY "Allow administrators to delete dropdown settings"
ON public.inventory_dropdown_settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Seed System Default Dropdown Values
INSERT INTO public.inventory_dropdown_settings (id, category, label, value, is_active, is_system_default, description)
VALUES
    -- Locations
    ('dd-loc-1', 'locations', 'VINSR (Lab Bay 1)', 'VINSR', true, true, 'Primary high-density Wi-Fi 6E/7 stress test bay'),
    ('dd-loc-2', 'locations', 'OPEL (Lab Bay 2)', 'OPEL', true, true, 'Automated 11be multi-link benchmark facility'),
    ('dd-loc-3', 'locations', 'GVP (Lab Bay 3)', 'GVP', true, true, 'Long-term stability and legacy validation rack'),
    
    -- Projects
    ('dd-proj-1', 'projects', 'Wi-Fi 6E High-Density AP Stress', 'Wi-Fi 6E High-Density AP Stress', true, true, 'Dual 5GHz 160MHz channel bonding stress'),
    ('dd-proj-2', 'projects', 'Automated 11be Multi-Link Benchmark', 'Automated 11be Multi-Link Benchmark', true, true, 'Wi-Fi 7 320MHz MLO latency validation'),
    ('dd-proj-3', 'projects', 'Legacy 802.11ac Fallback Validation', 'Legacy 802.11ac Fallback Validation', true, true, 'Cross-generation backward compatibility matrix'),
    ('dd-proj-4', 'projects', 'Continuous Controller Automation', 'Continuous Controller Automation', true, true, 'Dedicated testbed controller workstations'),
    ('dd-proj-5', 'projects', 'Lab Automation Master', 'Lab Automation Master', true, true, 'Primary lab orchestrator rig'),
    ('dd-proj-6', 'projects', 'Mobile Fleet Multi-Station Roaming Suite', 'Mobile Fleet Multi-Station Roaming Suite', true, true, 'Automated station mobility validation'),
    ('dd-proj-7', 'projects', 'Wi-Fi 7 Client Station Benchmark', 'Wi-Fi 7 Client Station Benchmark', true, true, 'Wi-Fi 7 client throughput and roaming testbed'),
    ('dd-proj-8', 'projects', 'Wi-Fi 6E High-Throughput RF Isolation', 'Wi-Fi 6E High-Throughput RF Isolation', true, true, 'Shielded RF isolation benchmarking'),
    ('dd-proj-9', 'projects', 'Antenna Characterization', 'Antenna Characterization', true, true, 'Over-the-air radiation pattern characterization'),

    -- Chipsets
    ('dd-chip-1', 'chipsets', 'Qualcomm QCN9274 (Wi-Fi 7)', 'Qualcomm QCN9274', true, true, 'Quad-band Wi-Fi 7 320MHz PCIe radio'),
    ('dd-chip-2', 'chipsets', 'Broadcom BCM4375 (Wi-Fi 6)', 'Broadcom BCM4375', true, true, 'Dual-band 802.11ax high-performance radio'),
    ('dd-chip-3', 'chipsets', 'Intel AX210 (Wi-Fi 6E)', 'Intel AX210', true, true, 'Tri-band 2.4/5/6 GHz M.2 radio module'),
    ('dd-chip-4', 'chipsets', 'MediaTek MT7922 (Wi-Fi 6E)', 'MediaTek MT7922', true, true, '2x2 160MHz client radio interface'),
    ('dd-chip-5', 'chipsets', 'Qualcomm FastConnect 7800 (Wi-Fi 7)', 'Qualcomm FastConnect 7800', true, true, 'High-band simultaneous multi-link radio'),

    -- Brands
    ('dd-brand-1', 'brands', 'Dell Technologies', 'Dell', true, true, 'Precision rack and tower workstations'),
    ('dd-brand-2', 'brands', 'HP Enterprise', 'HP', true, true, 'Z4 / Z6 lab automation computers'),
    ('dd-brand-3', 'brands', 'Lenovo', 'Lenovo', true, true, 'ThinkStation testbed hosts'),
    ('dd-brand-4', 'brands', 'Google Pixel', 'Google', true, true, 'Android reference roaming client stations'),
    ('dd-brand-5', 'brands', 'Samsung Electronics', 'Samsung', true, true, 'Galaxy S-series flagship test clients'),
    ('dd-brand-6', 'brands', 'Apple Inc.', 'Apple', true, true, 'iOS client hardware validation pool'),
    ('dd-brand-7', 'brands', 'OnePlus', 'OnePlus', true, true, 'OxygenOS Wi-Fi 7 client stations'),

    -- Chamber Types
    ('dd-ch-1', 'chamberTypes', 'RF Isolation Chamber (Shielded Box)', 'RF Isolation Chamber', true, true, 'High-attenuation shielded RF box (>90 dB isolation)'),
    ('dd-ch-2', 'chamberTypes', 'Over-The-Air Chamber (OTA)', 'Over-The-Air Chamber (OTA)', true, true, 'Multipath simulation and antenna array testing'),
    ('dd-ch-3', 'chamberTypes', 'Reverberation Chamber', 'Reverberation Chamber', true, true, 'Isotropic statistical multipath test environment'),
    ('dd-ch-4', 'chamberTypes', 'Anechoic Chamber', 'Anechoic Chamber', true, true, 'Free-space RF emission and antenna calibration'),

    -- Ethernet Speeds
    ('dd-eth-1', 'ethernetSpeeds', '1 Gbps (1000BASE-T)', '1 Gbps', true, true, 'Standard management and client interface'),
    ('dd-eth-2', 'ethernetSpeeds', '2.5 Gbps (2.5GBASE-T)', '2.5 Gbps', true, true, 'Multi-gigabit access point uplink'),
    ('dd-eth-3', 'ethernetSpeeds', '5 Gbps (5GBASE-T)', '5 Gbps', true, true, 'Enterprise Wi-Fi 6 access point port'),
    ('dd-eth-4', 'ethernetSpeeds', '10 Gbps (10GBASE-T / SFP+)', '10 Gbps', true, true, 'High-speed stress testbed backhaul'),
    ('dd-eth-5', 'ethernetSpeeds', '25 Gbps (25GBASE-SR / SFP28)', '25 Gbps', true, true, 'High-capacity LANforge CT523c interface'),
    ('dd-eth-6', 'ethernetSpeeds', '40 Gbps (QSFP+)', '40 Gbps', true, true, 'Core lab aggregation interface'),
    ('dd-eth-7', 'ethernetSpeeds', '100 Gbps (QSFP28)', '100 Gbps', true, true, 'Next-generation backbone throughput pipeline')
ON CONFLICT (category, value) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;
