import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const EMPLOYEES = [
  { name: 'Sirisha', email: 'sirisha@candelatech.com' },
  { name: 'Tejas', email: 'tejas@candelatech.com' },
  { name: 'Deepika', email: 'deepika@candelatech.com' },
  { name: 'Shyamala', email: 'shyamala@candelatech.com' },
  { name: 'Pranathi', email: 'pranathi@candelatech.com' },
  { name: 'Lokesh', email: 'lokesh@candelatech.com' },
  { name: 'Aarif', email: 'aarif@candelatech.com' },
  { name: 'Venkat', email: 'venkat@candelatech.com' },
  { name: 'Bindu', email: 'bindu@candelatech.com' },
  { name: 'Chaitanya', email: 'chaitanya@candelatech.com' },
  { name: 'Tarun', email: 'tarun@candelatech.com' },
  { name: 'Tejaswari', email: 'tejaswari@candelatech.com' },
  { name: 'IT Team', email: 'it.team@candelatech.com' },
  { name: 'Inventory', email: 'inventory@candelatech.com' },
];

async function seed() {
  console.log('--- 1. PROVISION EMPLOYEES ---');
  const userMap = {}; // name (lowercase) -> profile id

  // Fetch existing profiles
  const { data: existingProfiles } = await supabase.from('profiles').select('id, full_name, email');
  (existingProfiles || []).forEach(p => {
    userMap[p.full_name.toLowerCase()] = p.id;
    if (p.email) userMap[p.email.toLowerCase()] = p.id;
  });

  for (const emp of EMPLOYEES) {
    if (!userMap[emp.name.toLowerCase()]) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: 'CandelaPassword2026!',
        email_confirm: true,
        user_metadata: {
          full_name: emp.name,
          role: 'employee'
        }
      });
      if (data?.user) {
        userMap[emp.name.toLowerCase()] = data.user.id;
        console.log(`Created user: ${emp.name} (${data.user.id})`);
      } else if (error) {
        // If user already exists in auth, lookup profile
        const { data: prof } = await supabase.from('profiles').select('id').eq('email', emp.email).single();
        if (prof) {
          userMap[emp.name.toLowerCase()] = prof.id;
        } else {
          console.warn(`User error for ${emp.name}:`, error.message);
        }
      }
    }
  }

  // Refresh profile map
  const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email');
  (allProfiles || []).forEach(p => {
    userMap[p.full_name.toLowerCase()] = p.id;
    const first = p.full_name.split(' ')[0].toLowerCase();
    userMap[first] = p.id;
  });
  console.log('Available user mappings:', Object.keys(userMap));

  console.log('\n--- 2. SYNC DROPDOWN SETTINGS ---');
  const dropdownData = [
    // Locations
    { category: 'locations', label: 'VINSR (Lab Bay 1)', value: 'VINSR', description: 'Primary high-density testbed bay' },
    { category: 'locations', label: 'OPEL (Lab Bay 2)', value: 'OPEL', description: 'Automated 11be multi-link benchmark facility' },
    { category: 'locations', label: 'GVP (Lab Bay 3)', value: 'GVP', description: 'Long-term stability and legacy validation rack' },
    { category: 'locations', label: 'PRIMA (Lab Bay 4)', value: 'PRIMA', description: 'PM Team & GX automated test chamber' },

    // Projects
    { category: 'projects', label: 'Netgear', value: 'Netgear', description: 'Netgear enterprise AP throughput & roaming' },
    { category: 'projects', label: 'SpaceX', value: 'SpaceX', description: 'Satellite ground station & client stress matrix' },
    { category: 'projects', label: 'Jio', value: 'Jio', description: 'Telecom high-capacity carrier validation' },
    { category: 'projects', label: 'Chamberlain', value: 'Chamberlain', description: 'IoT & residential mobility testbed' },
    { category: 'projects', label: 'Hotwire', value: 'Hotwire', description: 'Fiber-to-the-home broadband stress tests' },
    { category: 'projects', label: 'celona', value: 'celona', description: 'Private 5G and Wi-Fi convergence testbed' },
    { category: 'projects', label: 'GX', value: 'GX', description: 'Next-generation gateway benchmark' },
    { category: 'projects', label: 'PM Team', value: 'PM Team', description: 'Product management validation fleet' },
    { category: 'projects', label: 'Inventory', value: 'Inventory', description: 'Unassigned lab hardware pool' },
    { category: 'projects', label: 'Maintenance', value: 'Maintenance', description: 'Hardware under repair or diagnostics' },

    // Chamber Types
    { category: 'chamberTypes', label: 'Large Chamber', value: 'Large', description: 'Full-size multipath walk-in isolation chamber' },
    { category: 'chamberTypes', label: 'Medium Chamber', value: 'Medium', description: 'Standard benchtop RF isolation enclosure' },
    { category: 'chamberTypes', label: 'HiaB (High-Isolation Box)', value: 'HiaB', description: 'High-density multi-radio RF shielded box' },
    { category: 'chamberTypes', label: 'Thermal Chamber', value: 'Thermal chamber', description: 'Environmental temperature stress chamber' },

    // Ethernet Speeds
    { category: 'ethernetSpeeds', label: '10 Gbps (10GBASE-T / SFP+)', value: '10 Gbps', description: 'High-speed stress testbed backhaul' },
    { category: 'ethernetSpeeds', label: '1 Gbps (1000BASE-T)', value: '1 Gbps', description: 'Standard gigabit interface' },
    { category: 'ethernetSpeeds', label: '800 Mbps (Fast Ethernet / Co-channel)', value: '800 Mbps', description: 'Bandwidth throttled test interface' },
    { category: 'ethernetSpeeds', label: '2.5 Gbps (2.5GBASE-T)', value: '2.5 Gbps', description: 'Multi-gigabit access point uplink' },
    { category: 'ethernetSpeeds', label: '5 Gbps (5GBASE-T)', value: '5 Gbps', description: 'Enterprise Wi-Fi 6 AP uplink' },
    { category: 'ethernetSpeeds', label: '25 Gbps (25GBASE-SR)', value: '25 Gbps', description: 'Next-gen high capacity uplink' },

    // Brands
    { category: 'brands', label: 'Samsung Electronics', value: 'Samsung', description: 'Android flagship test devices' },
    { category: 'brands', label: 'Apple Inc.', value: 'Apple', description: 'iOS and macOS reference hardware' },
    { category: 'brands', label: 'Google Pixel', value: 'Google Pixel', description: 'Reference Android roaming devices' },
    { category: 'brands', label: 'OnePlus', value: 'Oneplus', description: 'High-performance mobile clients' },
    { category: 'brands', label: 'HP Enterprise', value: 'HP', description: 'Windows lab controller computers' },
    { category: 'brands', label: 'Dell Technologies', value: 'Dell', description: 'Precision Linux workstations' },
    { category: 'brands', label: 'Lenovo', value: 'Lenovo', description: 'ThinkPad / ThinkStation test clients' },
    { category: 'brands', label: 'Vivo', value: 'Vivo', description: 'Mobile test devices' },
    { category: 'brands', label: 'Oppo', value: 'oppo', description: 'Mobile test devices' },
    { category: 'brands', label: 'Honor', value: 'Honor', description: 'Mobile test devices' },
    { category: 'brands', label: 'Qualcomm', value: 'Qualcomm', description: 'Reference design evaluation platforms' },
    { category: 'brands', label: 'MacBook', value: 'MacBook', description: 'Apple macOS testbed laptop' },
    { category: 'brands', label: 'iPad', value: 'IPad', description: 'Apple iOS tablet device' },

    // WiFi Radio Chipsets
    { category: 'chipsets', label: 'Intel BE200 (Wi-Fi 7)', value: 'Intel BE200', description: 'Tri-band 802.11be M.2 client radio' },
    { category: 'chipsets', label: 'MediaTek MT7996 (Wi-Fi 7)', value: 'MTK7996', description: 'Enterprise 802.11be high-throughput chipset' },
    { category: 'chipsets', label: 'MediaTek MT7915 (Wi-Fi 6)', value: 'MTK7915', description: 'Dual-band 802.11ax PCIe radio' },
    { category: 'chipsets', label: 'MediaTek MT7922 (Wi-Fi 6E)', value: 'MTK7922', description: '2x2 160MHz 6GHz client radio' },
    { category: 'chipsets', label: 'Intel AX210 (Wi-Fi 6E)', value: 'Intel AX210', description: 'Tri-band 2.4/5/6 GHz radio' },
    { category: 'chipsets', label: 'Qualcomm ATH10k (Wave 1/2)', value: 'Qualcomm ATH10k', description: 'Enterprise 802.11ac PCIe radio' },
    { category: 'chipsets', label: 'Qualcomm ATH9k (802.11n)', value: 'Qualcomm ATH9k', description: 'High-density 802.11abgn legacy radio' },
    { category: 'chipsets', label: 'ATH10k Wave 1 (802.11ac)', value: 'ath10k-Wave1', description: 'Legacy 802.11ac wave-1 PCIe radio' },
    { category: 'chipsets', label: 'ATH9k Legacy (802.11n)', value: 'ath9k', description: 'Legacy 802.11n radio' },
    { category: 'chipsets', label: '802.11ac Wave-1', value: 'AC wave-1', description: 'First-generation 802.11ac client radio' },
    { category: 'chipsets', label: '802.11ac Wave-2', value: 'AC Wave-2', description: 'MU-MIMO 802.11ac client radio' },
  ];

  for (let idx = 0; idx < dropdownData.length; idx++) {
    const item = dropdownData[idx];
    const id = `dd-${item.category}-${idx + 1}`;
    await supabase.from('inventory_dropdown_settings').upsert({
      id,
      category: item.category,
      label: item.label,
      value: item.value,
      is_active: true,
      is_system_default: true,
      description: item.description,
      updated_at: new Date().toISOString()
    }, { onConflict: 'category,value' });
  }
  console.log(`Synced ${dropdownData.length} dropdown items to Supabase.`);

  console.log('\n--- 3. PURGE EXISTING INVENTORY TABLES ---');
  await supabase.from('lanforge_radios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('inventory_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lanforges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('desktops').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('mobiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('chambers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleaned old records.');

  console.log('\n--- 4. SEED LANFORGES FROM EXCEL ---');
  const RAW_LANFORGES = [
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Sirisha', id: 'LF-OPEL-523C-01', model: 'CT523c', speed: '10 Gbps', total: 124, be: 124, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/16, MTK7996/1', status: 'In-Use', comments: '' },
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Sirisha', id: 'LF-OPEL-523C-02', model: 'CT523c', speed: '1 Gbps', total: 20, be: 20, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/20', status: 'In-Use', comments: '' },
    { loc: 'OPEL', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-OPEL-523C-03', model: 'CT523c', speed: '10 Gbps', total: 31, be: 8, ax: 23, ac: 0, n: 0, radios: 'MTK7915/1, MTK7922/1, Intel BE200/8', status: 'Available', comments: '' },
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Tejas', id: 'LF-OPEL-523C-04', model: 'CT523c', speed: '10 Gbps', total: 114, be: 0, ax: 114, ac: 0, n: 0, radios: 'MTK7915/6', status: 'In-Use', comments: '' },
    { loc: 'PRIMA', ip: '192.168.215.184', proj: 'PM Team', poc: 'Deepika', id: 'ct523-6e08', model: 'CT523c', speed: '10 Gbps', total: 112, be: 112, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/4, MTK7996/1', status: 'In-Use', comments: '[Location: PRIMA] Intel BE200/2, Mtk7922/1, Mtk7915/1, Qualcomm ATH10k/1, Qualcomm ATH9k/1' },
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Shyamala', id: 'LF-OPEL-523C-05', model: 'CT523c', speed: '10 Gbps', total: 142, be: 2, ax: 76, ac: 64, n: 0, radios: 'MTK7915/4, BE200/2, ath10k-Wave1/1', status: 'In-Use', comments: 'Intel ax210/2, MTK7915/5' },
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Shyamala', id: 'LF-OPEL-523C-06', model: 'CT523c', speed: '1 Gbps', total: 500, be: 2, ax: 42, ac: 256, n: 200, radios: 'BE200/2, ath9k/1, AC wave-1/1, AC Wave-2/3, MTK7915/2, MTK7922/1', status: 'In-Use', comments: 'ath9k/1, ath10k/7, MTK7922/1' },
    { loc: 'GVP', ip: '', proj: 'Chamberlain', poc: 'Pranathi', id: 'LF-GVP-523C-01', model: 'CT523c', speed: '10 Gbps', total: 308, be: 2, ax: 42, ac: 64, n: 200, radios: 'mtk7922/1, Intel BE200/2, ath9k/1, mtk7915/2', status: 'In-Use', comments: '6 weeks' },
    { loc: 'VINSR', ip: '', proj: 'Jio', poc: 'Lokesh', id: 'LF-VINSR-523C-01', model: 'CT523c', speed: '10 Gbps', total: 306, be: 4, ax: 38, ac: 64, n: 200, radios: 'Intel BE200/4, ath9k/1, MTK7915/2, ath10k/1', status: 'In-Use', comments: '1 week' },
    { loc: 'GVP', ip: '', proj: 'SpaceX', poc: 'Aarif', id: 'LF-GVP-523C-02', model: 'CT523c', speed: '10 Gbps', total: 154, be: 110, ax: 44, ac: 0, n: 0, radios: 'MTK7996/1, MTK7915/2, AX210/2, BE200/2, MTK7922/1', status: 'In-Use', comments: '6 months' },
    { loc: 'GVP', ip: '', proj: 'SpaceX', poc: 'Venkat', id: 'LF-GVP-523C-03', model: 'CT523c', speed: '10 Gbps', total: 133, be: 0, ax: 133, ac: 0, n: 0, radios: 'MTK7915/7', status: 'In-Use', comments: 'Intel AX210/32' },
    { loc: 'PRIMA', ip: '', proj: 'GX', poc: 'Bindu', id: 'LF-PRIMA-523C-01', model: 'CT523c', speed: '10 Gbps', total: 0, be: 0, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/2, ath9k/1, MTK7915/3', status: 'In-Use', comments: '[Location: PRIMA]' },
    { loc: 'OPEL', ip: '', proj: 'Netgear', poc: 'Chaitanya', id: 'CT523c-6e06', model: 'CT523c', speed: '10 Gbps', total: 0, be: 0, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/4, MTK7922/4, MTK7915/2', status: 'In-Use', comments: '' },
    { loc: 'OPEL', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'CT523c-2117', model: 'CT523c', speed: '10 Gbps', total: 0, be: 0, ax: 0, ac: 0, n: 0, radios: 'Intel BE200/2, MTK7915/2', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Netgear', poc: 'Inventory', id: 'LF-523B-01', model: 'CT523b', speed: '1 Gbps', total: 166, be: 0, ax: 38, ac: 128, n: 0, radios: 'Qualcomm ATH10k/2, MTK7915/2', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Netgear', poc: 'Sirisha', id: 'LF-523B-02', model: 'CT523b', speed: '1 Gbps', total: 66, be: 0, ax: 2, ac: 64, n: 0, radios: 'Qualcomm ATH10k/4', status: 'In-Use', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Netgear', poc: 'Inventory', id: 'LF-521B-01', model: 'CT521b', speed: '1 Gbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'MTK7915/2', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Netgear', poc: 'Shyamala', id: 'LF-521C-01', model: 'CT521c', speed: '1 Gbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'MTK7915/2', status: 'In-Use', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-521A-01', model: 'CT521a', speed: '800 Mbps', total: 2, be: 0, ax: 2, ac: 0, n: 0, radios: 'Intel AX210/2', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Hotwire', poc: 'Venkat', id: 'LF-521A-02', model: 'CT521a', speed: '800 Mbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'MTK7915/2', status: 'In-Use', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-521A-03', model: 'CT521a', speed: '800 Mbps', total: 4, be: 0, ax: 0, ac: 0, n: 0, radios: 'MTK7922/1', status: 'Available', comments: '' },
    { loc: 'GVP', ip: '', proj: 'SpaceX', poc: 'Aarif', id: 'LF-521A-04', model: 'CT521a', speed: '800 Mbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'MTK7915/2', status: 'In-Use', comments: 'GVP' },
    { loc: 'VINSR', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-521A-05', model: 'CT521a', speed: '800 Mbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'Qualcomm ATH10k/1, Qualcomm ATH9k/1', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-521A-06', model: 'CT521a', speed: '800 Mbps', total: 201, be: 1, ax: 0, ac: 0, n: 200, radios: 'Qualcomm ATH9k/1, BE200/1', status: 'Available', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Hotwire', poc: 'Venkat', id: 'LF-521A-07', model: 'CT521a', speed: '800 Mbps', total: 38, be: 0, ax: 38, ac: 0, n: 0, radios: 'MTK7915/2', status: 'In-Use', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Hotwire', poc: 'Venkat', id: 'LF-521A-08', model: 'CT521a', speed: '800 Mbps', total: 0, be: 0, ax: 0, ac: 0, n: 0, radios: 'Qualcomm ATH10k/2', status: 'In-Use', comments: '' },
    { loc: 'VINSR', ip: '', proj: 'Inventory', poc: 'Inventory', id: 'LF-521A-09', model: 'CT521a', speed: '800 Mbps', total: 0, be: 0, ax: 0, ac: 0, n: 0, radios: 'Qualcomm ATH10k/2', status: 'Available', comments: '' },
  ];

  for (let idx = 0; idx < RAW_LANFORGES.length; idx++) {
    const raw = RAW_LANFORGES[idx];
    const pocId = userMap[raw.poc.toLowerCase()] || null;
    const ip = raw.ip.trim() || '0.0.0.0';
    // Map PRIMA to VINSR in Postgres enum, but keep in comments so frontend displays PRIMA
    const dbLoc = raw.loc === 'PRIMA' ? 'VINSR' : raw.loc;
    const comments = raw.loc === 'PRIMA' && !raw.comments.includes('[Location: PRIMA]')
      ? `[Location: PRIMA] ${raw.comments}`.trim()
      : raw.comments;

    const { data: lf, error } = await supabase.from('lanforges').insert({
      s_no: idx + 1,
      location: dbLoc,
      testbed_ip: ip,
      project: raw.proj,
      poc_id: raw.status === 'In-Use' ? pocId : null,
      lanforge_id: raw.id,
      lanforge_model: raw.model,
      max_ethernet_speed: raw.speed,
      total_clients: raw.total,
      no_of_11be_clients: raw.be,
      no_of_11ax_clients: raw.ax,
      no_of_11ac_clients: raw.ac,
      no_of_11n_clients: raw.n,
      status: raw.status,
      comments: comments || null,
      is_archived: false,
    }).select().single();

    if (error) {
      console.error(`Failed to insert LANforge ${raw.id}:`, error.message);
      continue;
    }

    // Parse radios
    const radioParts = raw.radios.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    for (const r of radioParts) {
      // e.g. "Intel BE200/16" or "MTK7996/1" or "1. mtk7922-1"
      const match = r.match(/^(?:\d+\.\s*)?([^\/\-]+)(?:[\/\-](\d+))?$/);
      const chipset = match ? match[1].trim() : r;
      const qty = match && match[2] ? parseInt(match[2], 10) : 1;
      await supabase.from('lanforge_radios').insert({
        lanforge_ref: lf.id,
        chipset,
        quantity: qty || 1
      });
    }

    // Insert active assignment if In-Use
    if (raw.status === 'In-Use' && pocId) {
      await supabase.from('inventory_assignments').insert({
        inventory_type: 'lanforge',
        inventory_id: lf.id,
        inventory_tag: raw.id,
        employee_id: pocId,
        assignment_status: 'active',
        notes: `Assigned for project ${raw.proj}`
      });
    }
  }
  console.log(`Seeded ${RAW_LANFORGES.length} LANforges.`);

  console.log('\n--- 5. SEED MOBILES FROM EXCEL ---');
  const RAW_MOBILES = [
    { id: 'MOB-SAM-S25-EERO', brand: 'Samsung', model: 'S25', proj: 'Netgear', poc: 'Sirisha', status: 'In-Use' },
    { id: 'MOB-SAM-S23-01', brand: 'Samsung', model: 'S23', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'MOB-SAM-S21U-EERO', brand: 'Samsung', model: 'S21 ultra 5G', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'MOB-OP-11-EERO', brand: 'Oneplus', model: '11 5G', proj: 'Netgear', poc: 'Sirisha', status: 'In-Use' },
    { id: 'MOB-PIXEL-8-EERO', brand: 'Google Pixel', model: '8', proj: 'Netgear', poc: 'Sirisha', status: 'In-Use' },
    { id: 'MOB-PIXEL-8-MNT', brand: 'Google Pixel', model: '8', proj: 'Maintenance', poc: 'IT team', status: 'Under Maintenance' },
    { id: 'MOB-HONOR-9X-01', brand: 'Honor', model: '9X', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'MOB-SAM-S20FE-01', brand: 'Samsung', model: 'S20 FE', proj: 'Inventory', poc: 'Tarun', status: 'In-Use' },
    { id: 'MOB-VIVO-Y15-01', brand: 'Vivo', model: 'Y15', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'MOB-OPPO-A55-01', brand: 'oppo', model: 'A55', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'MOB-VIVO-V11P-01', brand: 'Vivo', model: 'V11 pro', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'MOB-IPHONE-15-EERO', brand: 'Apple', model: 'iPhone 15', proj: 'Netgear', poc: 'Sirisha', status: 'In-Use' },
    { id: 'MOB-IPHONE-12-01', brand: 'Apple', model: 'iPhone 12', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'MOB-IPHONE-12-02', brand: 'Apple', model: 'iPhone 12', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'MOB-OP-12-EERO', brand: 'Oneplus', model: '12', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'MOB-SAM-BULGE-MNT', brand: 'Samsung', model: 'Battery bulge', proj: 'Maintenance', poc: 'IT team', status: 'Under Maintenance' },
  ];

  for (let idx = 0; idx < RAW_MOBILES.length; idx++) {
    const raw = RAW_MOBILES[idx];
    const pocId = userMap[raw.poc.toLowerCase()] || null;
    const { data: mb, error } = await supabase.from('mobiles').insert({
      s_no: idx + 1,
      device_id: raw.id,
      device_brand: raw.brand,
      model: raw.model,
      project: raw.proj,
      poc_id: raw.status === 'In-Use' ? pocId : null,
      status: raw.status,
      is_archived: false,
    }).select().single();

    if (error) {
      console.error(`Failed to insert mobile ${raw.id}:`, error.message);
      continue;
    }

    if (raw.status === 'In-Use' && pocId) {
      await supabase.from('inventory_assignments').insert({
        inventory_type: 'mobile',
        inventory_id: mb.id,
        inventory_tag: raw.id,
        employee_id: pocId,
        assignment_status: 'active',
        notes: `Assigned for project ${raw.proj}`
      });
    }
  }
  console.log(`Seeded ${RAW_MOBILES.length} Mobiles.`);

  console.log('\n--- 6. SEED DESKTOPS / LAPTOPS FROM EXCEL ---');
  const RAW_DESKTOPS = [
    { id: 'LAP-MAC-M3-01', brand: 'MacBook', model: 'Air M3', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'TAB-IPAD-01', brand: 'IPad', model: 'iPad', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'LAP-LENOVO-01', brand: 'Lenovo', model: 'ThinkPad Laptop', proj: 'SpaceX', poc: 'Aarif', status: 'In-Use' },
    { id: 'LAP-QC-EERO-01', brand: 'Qualcomm', model: 'Qualcomm laptop eero', proj: 'Inventory', poc: 'Inventory', status: 'Available' },
    { id: 'LAP-HP-CELONA-01', brand: 'HP', model: 'Windows Workstation', proj: 'celona', poc: 'Pranathi', status: 'In-Use' },
    { id: 'DT-DELL-CELONA-01', brand: 'Dell', model: 'Linux Controller', proj: 'celona', poc: 'Pranathi', status: 'In-Use' },
    { id: 'LAP-HP-02', brand: 'HP', model: 'Laptop', proj: 'Netgear', poc: 'Tejaswari', status: 'In-Use' },
    { id: 'LAP-HP-03', brand: 'HP', model: 'Laptop', proj: 'Netgear', poc: 'Tejaswari', status: 'In-Use' },
    { id: 'DT-DELL-02', brand: 'Dell', model: 'Workstation', proj: 'Netgear', poc: 'Tejaswari', status: 'In-Use' },
  ];

  for (let idx = 0; idx < RAW_DESKTOPS.length; idx++) {
    const raw = RAW_DESKTOPS[idx];
    const pocId = userMap[raw.poc.toLowerCase()] || null;
    const { data: dt, error } = await supabase.from('desktops').insert({
      s_no: idx + 1,
      device_id: raw.id,
      device_brand: raw.brand,
      model: raw.model,
      project: raw.proj,
      poc_id: raw.status === 'In-Use' ? pocId : null,
      status: raw.status,
      is_archived: false,
    }).select().single();

    if (error) {
      console.error(`Failed to insert desktop ${raw.id}:`, error.message);
      continue;
    }

    if (raw.status === 'In-Use' && pocId) {
      await supabase.from('inventory_assignments').insert({
        inventory_type: 'desktop',
        inventory_id: dt.id,
        inventory_tag: raw.id,
        employee_id: pocId,
        assignment_status: 'active',
        notes: `Assigned for project ${raw.proj}`
      });
    }
  }
  console.log(`Seeded ${RAW_DESKTOPS.length} Desktops.`);

  console.log('\n--- 7. SEED CHAMBERS FROM EXCEL ---');
  const RAW_CHAMBERS = [
    { sNo: 1, loc: 'VINSR', type: 'Large', id: 'CH-VINSR-LRG-1', poc: 'Lokesh', proj: 'Jio', status: 'In-Use' },
    { sNo: 2, loc: 'VINSR', type: 'Large', id: 'CH-VINSR-LRG-2', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 3, loc: 'VINSR', type: 'Large', id: 'CH-VINSR-LRG-3', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 4, loc: 'VINSR', type: 'Large', id: 'CH-VINSR-LRG-4', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 5, loc: 'VINSR', type: 'Large', id: 'CH-VINSR-LRG-5', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 6, loc: 'VINSR', type: 'Medium', id: 'CH-VINSR-MED-1', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 7, loc: 'VINSR', type: 'Medium', id: 'CH-VINSR-MED-2', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 8, loc: 'GVP', type: 'Medium', id: 'CH-GVP-MED-3', poc: 'Pranathi', proj: 'Chamberlain', status: 'In-Use' },
    { sNo: 9, loc: 'GVP', type: 'Medium', id: 'CH-GVP-MED-4', poc: 'Pranathi', proj: 'Chamberlain', status: 'In-Use' },
    { sNo: 10, loc: 'GVP', type: 'Medium', id: 'CH-GVP-MED-5', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 11, loc: 'GVP', type: 'Medium', id: 'CH-GVP-MED-6', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 12, loc: 'GVP', type: 'Medium', id: 'CH-GVP-MED-7', poc: '', proj: 'Inventory', status: 'Available' },
    { sNo: 13, loc: 'OPEL', type: 'HiaB', id: 'CH-OPEL-HIAB-1', poc: 'Sirisha', proj: 'Netgear', status: 'In-Use' },
    { sNo: 14, loc: 'GVP', type: 'HiaB', id: 'CH-GVP-HIAB-2', poc: 'Aarif', proj: 'SpaceX', status: 'In-Use' },
    { sNo: 15, loc: 'OPEL', type: 'Thermal chamber', id: 'CH-OPEL-THRM-1', poc: '', proj: 'Inventory', status: 'Available' },
  ];

  for (const raw of RAW_CHAMBERS) {
    const pocId = raw.poc ? userMap[raw.poc.toLowerCase()] : null;
    const { data: ch, error } = await supabase.from('chambers').insert({
      s_no: raw.sNo,
      chamber_type: `${raw.type} (${raw.loc})`,
      chamber_id: raw.id,
      used_by_id: raw.status === 'In-Use' ? pocId : null,
      project: raw.proj,
      status: raw.status,
      is_archived: false,
    }).select().single();

    if (error) {
      console.error(`Failed to insert chamber ${raw.id}:`, error.message);
      continue;
    }

    if (raw.status === 'In-Use' && pocId) {
      await supabase.from('inventory_assignments').insert({
        inventory_type: 'chamber',
        inventory_id: ch.id,
        inventory_tag: raw.id,
        employee_id: pocId,
        assignment_status: 'active',
        notes: `Assigned for project ${raw.proj}`
      });
    }
  }
  console.log(`Seeded ${RAW_CHAMBERS.length} Chambers.`);

  console.log('\n--- 8. SEED AUDIT LOGS ---');
  const adminId = userMap['admin supervisor'] || Object.values(userMap)[0];
  await supabase.from('inventory_activity_logs').insert([
    {
      action_type: 'created',
      performed_by: adminId,
      description: 'Imported complete hardware inventory from production Excel database (Nov 2026).'
    },
    {
      action_type: 'status_change',
      performed_by: adminId,
      description: 'Synchronized live custody assignments for Netgear, SpaceX, Jio, and Chamberlain testbeds.'
    }
  ]);
  console.log('Seeded initial audit activity logs.');

  console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
