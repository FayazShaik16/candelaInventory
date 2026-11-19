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

async function exportSeeds() {
  const { data: lfList } = await supabase.from('lanforges').select('*, lanforge_radios(*)').order('s_no');
  const { data: dtList } = await supabase.from('desktops').select('*').order('s_no');
  const { data: mbList } = await supabase.from('mobiles').select('*').order('s_no');
  const { data: chList } = await supabase.from('chambers').select('*').order('s_no');
  const { data: asgnList } = await supabase.from('inventory_assignments').select('*, profiles:employee_id(full_name, email)').order('assigned_at');
  const { data: logList } = await supabase.from('inventory_activity_logs').select('*, profiles:performed_by(full_name, role)').order('created_at', { ascending: false });

  // Map to frontend types
  const lanforges = (lfList || []).map(l => {
    const isPrima = l.comments && l.comments.includes('[Location: PRIMA]');
    return {
      id: l.id,
      sNo: l.s_no,
      location: isPrima ? 'PRIMA' : l.location,
      testbedIp: l.testbed_ip === '0.0.0.0' ? '' : l.testbed_ip,
      project: l.project,
      pocId: l.poc_id,
      lanforgeId: l.lanforge_id,
      lanforgeModel: l.lanforge_model,
      maxEthernetSpeed: l.max_ethernet_speed,
      totalClients: l.total_clients,
      noOf11beClients: l.no_of_11be_clients,
      noOf11axClients: l.no_of_11ax_clients,
      noOf11acClients: l.no_of_11ac_clients,
      noOf11nClients: l.no_of_11n_clients,
      status: l.status,
      comments: (l.comments || '').replace('[Location: PRIMA]', '').trim(),
      radios: (l.lanforge_radios || []).map(r => ({
        id: r.id,
        lanforgeRef: r.lanforge_ref,
        chipset: r.chipset,
        quantity: r.quantity
      })),
      isArchived: l.is_archived,
      createdAt: l.created_at,
      updatedAt: l.updated_at
    };
  });

  const desktops = (dtList || []).map(d => ({
    id: d.id,
    sNo: d.s_no,
    deviceId: d.device_id,
    deviceBrand: d.device_brand,
    model: d.model,
    project: d.project,
    pocId: d.poc_id,
    status: d.status,
    isArchived: d.is_archived,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));

  const mobiles = (mbList || []).map(m => ({
    id: m.id,
    sNo: m.s_no,
    deviceId: m.device_id,
    deviceBrand: m.device_brand,
    model: m.model,
    project: m.project,
    pocId: m.poc_id,
    status: m.status,
    isArchived: m.is_archived,
    createdAt: m.created_at,
    updatedAt: m.updated_at
  }));

  const chambers = (chList || []).map(c => ({
    id: c.id,
    sNo: c.s_no,
    chamberType: c.chamber_type,
    chamberId: c.chamber_id,
    usedById: c.used_by_id,
    project: c.project,
    status: c.status,
    isArchived: c.is_archived,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));

  const assignments = (asgnList || []).map(a => ({
    id: a.id,
    equipmentCategory: a.inventory_type,
    equipmentId: a.inventory_id,
    equipmentTag: a.inventory_tag,
    employeeId: a.employee_id,
    employeeName: a.profiles?.full_name || 'Assigned Custodian',
    employeeEmail: a.profiles?.email || '',
    assignedDate: a.assigned_at,
    returnDate: a.returned_at,
    assignedBy: a.assigned_by || 'Admin Supervisor',
    notes: a.notes || '',
    status: a.assignment_status
  }));

  const activityLogs = (logList || []).map(l => ({
    id: l.id,
    timestamp: l.created_at,
    unitAssetTag: l.inventory_tag || 'DATABASE',
    inventoryCategory: l.inventory_type || 'lanforge',
    inventoryId: l.inventory_id,
    action: l.action_type,
    title: `Inventory Synchronized: ${l.action_type}`,
    description: l.description,
    performedBy: l.profiles?.full_name || 'Admin Supervisor',
    user: {
      name: l.profiles?.full_name || 'Admin Supervisor',
      role: 'Operations Lead'
    }
  }));

  const fileContent = `import { 
  LANforgeItem, 
  DesktopItem, 
  MobileItem, 
  ChamberItem, 
  EquipmentAssignment,
  ActivityLog 
} from '@/types/inventory';

export const INITIAL_ASSIGNMENTS: EquipmentAssignment[] = ${JSON.stringify(assignments, null, 2)};

export const INITIAL_LANFORGES: LANforgeItem[] = ${JSON.stringify(lanforges, null, 2)};

export const INITIAL_DESKTOPS: DesktopItem[] = ${JSON.stringify(desktops, null, 2)};

export const INITIAL_MOBILES: MobileItem[] = ${JSON.stringify(mobiles, null, 2)};

export const INITIAL_CHAMBERS: ChamberItem[] = ${JSON.stringify(chambers, null, 2)};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = ${JSON.stringify(activityLogs, null, 2)};
`;

  fs.writeFileSync('src/data/inventorySeed.ts', fileContent, 'utf8');
  console.log('Successfully wrote real Excel data to src/data/inventorySeed.ts!');
}

exportSeeds().catch(err => {
  console.error(err);
  process.exit(1);
});
