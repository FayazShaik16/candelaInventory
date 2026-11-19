import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  INITIAL_LANFORGES, 
  INITIAL_DESKTOPS, 
  INITIAL_MOBILES, 
  INITIAL_CHAMBERS, 
  INITIAL_ASSIGNMENTS 
} from '@/data/inventorySeed';
import { INITIAL_MOCK_PROFILES } from '@/lib/auth/mockUsers';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:7860';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

interface InventoryItemUnified {
  id: string;
  tag: string;
  model: string;
  category: 'lanforge' | 'desktop' | 'mobile' | 'chamber';
  status: string;
  location: string;
  project: string;
  custodian: string;
  details?: Record<string, any>;
}

async function getUnifiedInventory(): Promise<{
  items: InventoryItemUnified[];
  profiles: Array<{ id: string; full_name: string; email: string; role: string }>;
}> {
  const supabase = createAdminClient();
  let profiles: Array<{ id: string; full_name: string; email: string; role: string }> = INITIAL_MOCK_PROFILES.map(p => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
  }));

  let items: InventoryItemUnified[] = [];

  if (supabase) {
    try {
      const [
        { data: profList },
        { data: lfList },
        { data: dtList },
        { data: mbList },
        { data: chList },
        { data: asgnList },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role').order('full_name', { ascending: true }),
        supabase.from('lanforges').select('*, lanforge_radios(*)').order('s_no', { ascending: true }),
        supabase.from('desktops').select('*').order('s_no', { ascending: true }),
        supabase.from('mobiles').select('*').order('s_no', { ascending: true }),
        supabase.from('chambers').select('*').order('s_no', { ascending: true }),
        supabase.from('inventory_assignments').select('*, profiles:employee_id(full_name, email)').is('returned_at', null),
      ]);

      if (profList && profList.length > 0) {
        profiles = profList;
      }

      const profMap = new Map<string, string>();
      profiles.forEach(p => profMap.set(p.id, p.full_name));

      const activeAsgnMap = new Map<string, string>();
      if (asgnList) {
        asgnList.forEach((a: any) => {
          const empName = a.profiles?.full_name || profMap.get(a.employee_id) || 'Assigned';
          // DB column is `inventory_tag`, not `equipment_tag`
          if (a.inventory_tag) activeAsgnMap.set(a.inventory_tag.toUpperCase(), empName);
        });
      }

      if (lfList && lfList.length > 0) {
        lfList.forEach((l: any) => {
          const tag = (l.lanforge_id || '').toUpperCase();
          const custodian = activeAsgnMap.get(tag) || (l.poc_id ? profMap.get(l.poc_id) : null) || (l.status === 'Available' ? 'Unassigned' : 'In-Use');
          items.push({
            id: l.id,
            tag: l.lanforge_id,
            model: l.lanforge_model || 'LANforge',
            category: 'lanforge',
            status: l.status || 'Available',
            location: l.location || 'OPEL',
            project: l.project || '',
            custodian,
            details: {
              ip: l.testbed_ip,
              clients: l.total_clients,
              radios: (l.lanforge_radios || []).map((r: any) => `${r.chipset} (${r.quantity})`).join(', '),
            },
          });
        });
      }

      if (dtList && dtList.length > 0) {
        dtList.forEach((d: any) => {
          const tag = (d.device_id || '').toUpperCase();
          const custodian = activeAsgnMap.get(tag) || (d.poc_id ? profMap.get(d.poc_id) : null) || (d.status === 'Available' ? 'Unassigned' : 'In-Use');
          items.push({
            id: d.id,
            tag: d.device_id,
            model: `${d.device_brand || ''} ${d.model || ''}`.trim(),
            category: 'desktop',
            status: d.status || 'Available',
            location: d.location || 'Lab',
            project: d.project || '',
            custodian,
            details: { brand: d.device_brand, model: d.model },
          });
        });
      }

      if (mbList && mbList.length > 0) {
        mbList.forEach((m: any) => {
          const tag = (m.device_id || '').toUpperCase();
          const custodian = activeAsgnMap.get(tag) || (m.poc_id ? profMap.get(m.poc_id) : null) || (m.status === 'Available' ? 'Unassigned' : 'In-Use');
          items.push({
            id: m.id,
            tag: m.device_id,
            model: `${m.device_brand || ''} ${m.model || ''}`.trim(),
            category: 'mobile',
            status: m.status || 'Available',
            location: m.location || 'Lab',
            project: m.project || '',
            custodian,
            details: { brand: m.device_brand, model: m.model },
          });
        });
      }

      if (chList && chList.length > 0) {
        chList.forEach((c: any) => {
          const tag = (c.chamber_id || '').toUpperCase();
          const custodian = activeAsgnMap.get(tag) || (c.poc_id ? profMap.get(c.poc_id) : null) || (c.status === 'Available' ? 'Unassigned' : 'In-Use');
          items.push({
            id: c.id,
            tag: c.chamber_id,
            model: c.chamber_type || 'RF Chamber',
            category: 'chamber',
            status: c.status || 'Available',
            location: c.location || 'Lab',
            project: c.project || '',
            custodian,
            details: { type: c.chamber_type },
          });
        });
      }

      if (items.length > 0) {
        return { items, profiles };
      }
    } catch {
      // Fall through to seed fallback
    }
  }

  // Seed Fallback
  const profMap = new Map<string, string>();
  profiles.forEach(p => profMap.set(p.id, p.full_name));

  const activeAsgnMap = new Map<string, string>();
  INITIAL_ASSIGNMENTS.forEach(a => {
    if (!a.returnDate && a.equipmentTag) {
      activeAsgnMap.set(a.equipmentTag.toUpperCase(), a.employeeName || profMap.get(a.employeeId) || 'Assigned');
    }
  });

  INITIAL_LANFORGES.forEach(l => {
    const tag = (l.lanforgeId || '').toUpperCase();
    const custodian = activeAsgnMap.get(tag) || (l.pocId ? profMap.get(l.pocId) : null) || (l.status === 'Available' ? 'Unassigned' : 'In-Use');
    items.push({
      id: l.id,
      tag: l.lanforgeId,
      model: l.lanforgeModel,
      category: 'lanforge',
      status: l.status,
      location: l.location,
      project: l.project,
      custodian,
      details: {
        ip: l.testbedIp,
        clients: l.totalClients,
        radios: l.radios.map(r => `${r.chipset} (${r.quantity})`).join(', '),
      },
    });
  });

  INITIAL_DESKTOPS.forEach(d => {
    const tag = (d.deviceId || '').toUpperCase();
    const custodian = activeAsgnMap.get(tag) || d.pocName || (d.pocId ? profMap.get(d.pocId) : null) || (d.status === 'Available' ? 'Unassigned' : 'In-Use');
    items.push({
      id: d.id,
      tag: d.deviceId,
      model: `${d.deviceBrand} ${d.model}`.trim(),
      category: 'desktop',
      status: d.status,
      location: 'Lab',
      project: d.project,
      custodian,
      details: { brand: d.deviceBrand, model: d.model },
    });
  });

  INITIAL_MOBILES.forEach(m => {
    const tag = (m.deviceId || '').toUpperCase();
    const custodian = activeAsgnMap.get(tag) || m.pocName || (m.pocId ? profMap.get(m.pocId) : null) || (m.status === 'Available' ? 'Unassigned' : 'In-Use');
    items.push({
      id: m.id,
      tag: m.deviceId,
      model: `${m.deviceBrand} ${m.model}`.trim(),
      category: 'mobile',
      status: m.status,
      location: 'Lab',
      project: m.project,
      custodian,
      details: { brand: m.deviceBrand, model: m.model },
    });
  });

  INITIAL_CHAMBERS.forEach(c => {
    const tag = (c.chamberId || '').toUpperCase();
    const custodian = activeAsgnMap.get(tag) || c.usedByName || (c.usedById ? profMap.get(c.usedById) : null) || (c.status === 'Available' ? 'Unassigned' : 'In-Use');
    items.push({
      id: c.id,
      tag: c.chamberId,
      model: c.chamberType,
      category: 'chamber',
      status: c.status,
      location: 'Lab',
      project: c.project,
      custodian,
      details: { type: c.chamberType },
    });
  });

  return { items, profiles };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversation_id, context_unit_tag } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message text is required.' },
        { status: 400 }
      );
    }

    // 1. Attempt proxy to FastAPI backend if available
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${AI_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': req.headers.get('x-user-role') || 'admin',
          'x-user-id': req.headers.get('x-user-id') || 'usr-admin-01',
          'x-user-name': req.headers.get('x-user-name') || 'Admin Supervisor',
        },
        body: JSON.stringify({ message, conversation_id, context_unit_tag }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // If FastAPI backend responded successfully, return it
        if (data && data.text) {
          return NextResponse.json({ ...data, engine: 'fastapi-backend' });
        }
      }
    } catch {
      // Backend offline or unreachable
    }

    // 2. Fetch Live Real Database State
    const { items, profiles } = await getUnifiedInventory();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const textLower = message.toLowerCase().trim();
    const msgId = `msg-${Date.now().toString(36)}`;
    const convId = conversation_id || `conv-${Date.now().toString(36)}`;

    // Identify mentioned employee from actual team directory
    let matchedProfile: { id: string; full_name: string; email: string; role: string } | null = null;
    for (const p of profiles) {
      const nameParts = p.full_name.toLowerCase().split(/\s+/);
      const isMatch = nameParts.some(part => part.length >= 3 && textLower.includes(part));
      if (isMatch) {
        matchedProfile = p;
        break;
      }
    }

    // Identify mentioned hardware tag / model
    let matchedItem: InventoryItemUnified | undefined;
    if (context_unit_tag) {
      matchedItem = items.find(i => i.tag.toUpperCase() === context_unit_tag.toUpperCase());
    }

    if (!matchedItem) {
      // 1. Look for patterns like 523c-03, 523c03, 521b-01, lf-opel-523c-03, dt-01, mob-02, ch-01
      const tagMatch = textLower.match(/\b(lf-[a-z0-9_-]+|dt-[a-z0-9_-]+|mob-[a-z0-9_-]+|ch-[a-z0-9_-]+|52[135][a-z0-9_-]*|ct52[135][a-z0-9_-]*)\b/i);
      if (tagMatch) {
        const queryClean = tagMatch[1].replace(/[\s_-]+/g, '').toLowerCase();
        const candidates = items.filter(i => {
          const itemTagClean = i.tag.replace(/[\s_-]+/g, '').toLowerCase();
          return itemTagClean.includes(queryClean) || queryClean.includes(itemTagClean);
        });

        if (candidates.length === 1) {
          matchedItem = candidates[0];
        } else if (candidates.length > 1) {
          if (textLower.includes('opel')) {
            matchedItem = candidates.find(c => c.location.toLowerCase().includes('opel'));
          } else if (textLower.includes('gvp')) {
            matchedItem = candidates.find(c => c.location.toLowerCase().includes('gvp'));
          } else if (textLower.includes('vinsr')) {
            matchedItem = candidates.find(c => c.location.toLowerCase().includes('vinsr'));
          }

          if (!matchedItem && (textLower.includes('free') || textLower.includes('available'))) {
            matchedItem = candidates.find(c => c.status === 'Available');
          }

          if (!matchedItem) {
            matchedItem = candidates[0];
          }
        }
      }
    }

    if (!matchedItem) {
      for (const item of items) {
        const itemTagClean = item.tag.replace(/[\s_-]+/g, '').toLowerCase();
        const inputClean = textLower.replace(/[\s_-]+/g, '');
        if (inputClean.includes(itemTagClean)) {
          matchedItem = item;
          break;
        }
      }
    }

    // 3. Action Preview: Assignment / Custody Transfer
    if (textLower.includes('assign') || textLower.includes('transfer') || textLower.includes('allocate') || textLower.includes('reassign')) {
      const isTransfer = textLower.includes('transfer') || textLower.includes('reassign');
      const unit = matchedItem || items.find(i => i.status === 'Available') || items[0];

      // If no employee mentioned, ask for one
      if (!matchedProfile) {
        const teamNames = profiles
          .filter(p => p.role !== 'admin')
          .map(p => p.full_name)
          .join(', ');
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `I found unit **${unit.tag}** (${unit.status}). Who should I assign it to?\n\nAvailable team members: ${teamNames}\n\nTry: *"Assign ${unit.tag} to [Name]"*`,
          status: 'success',
          engine: 'candela-database-ai',
        });
      }

      const targetEmp = matchedProfile;
      const targetEmpName = targetEmp.full_name;
      
      let targetProject = unit.project || 'General Allocation';
      const projMatch = textLower.match(/for\s+(?:project\s+)?([a-z0-9\s_-]+?)(?:\.|$)/i);
      if (projMatch) targetProject = projMatch[1].trim();

      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Prepared ${isTransfer ? 'custody transfer' : 'assignment'} preview for **${unit.tag}** (${unit.model}). Please review and confirm:`,
        action_preview: {
          id: `act-${Date.now().toString(36)}`,
          intent: isTransfer ? 'equipment_transfer' : 'equipment_assignment',
          category: unit.category,
          record_identifier: unit.tag,
          unit_id: unit.id,
          unit_tag: unit.tag,
          unit_model: unit.model,
          target_employee_id: targetEmp.id,
          target_employee_name: targetEmpName,
          target_employee_email: targetEmp.email,
          target_project: targetProject,
          target_status: 'In-Use',
          title: isTransfer ? `Transfer Custody: ${unit.tag}` : `Assign Equipment: ${unit.tag}`,
          description: `Allocate hardware custody to ${targetEmpName} for ${targetProject}.`,
          changes: [
            { field: 'Custodian', from: unit.custodian || 'Unassigned', to: targetEmpName },
            { field: 'Status', from: unit.status, to: 'In-Use' },
            ...(targetProject ? [{ field: 'Project', from: unit.project || 'None', to: targetProject }] : []),
          ],
          requires_confirmation: true,
          confirmation_token: `candela-token-${Date.now()}`,
          expires_at: new Date(Date.now() + 300000).toISOString(),
        },
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 4. Action Preview: Equipment Return / Make Available / Release
    // Detect: "return", "check in", "check-in", "make available", "mark as available",
    //         "free up", "release", "unassign", "set available", "mark available"
    const isReturnIntent =
      textLower.includes('return') ||
      textLower.includes('check in') ||
      textLower.includes('check-in') ||
      textLower.includes('free up') ||
      textLower.includes('release') ||
      textLower.includes('unassign') ||
      (textLower.includes('make') && textLower.includes('available')) ||
      (textLower.includes('mark') && textLower.includes('available')) ||
      (textLower.includes('set') && textLower.includes('available'));

    if (isReturnIntent) {
      const unit = matchedItem || items.find(i => i.status === 'In-Use') || items[0];
      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Prepared equipment release preview for **${unit.tag}** (${unit.model}). This will return it to Available inventory. Please confirm:`,
        action_preview: {
          id: `act-${Date.now().toString(36)}`,
          intent: 'equipment_return',
          category: unit.category,
          record_identifier: unit.tag,
          unit_id: unit.id,
          unit_tag: unit.tag,
          unit_model: unit.model,
          target_status: 'Available',
          title: `Release Equipment: ${unit.tag}`,
          description: `Return hardware from ${unit.custodian || 'current custodian'} to Available inventory.`,
          changes: [
            { field: 'Custodian', from: unit.custodian || 'Assigned', to: 'Unassigned' },
            { field: 'Status', from: unit.status, to: 'Available' },
          ],
          requires_confirmation: true,
          confirmation_token: `candela-token-${Date.now()}`,
          expires_at: new Date(Date.now() + 300000).toISOString(),
        },
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 5. Action Preview: Status Update (Under Maintenance only — Available handled above)
    const isStatusUpdateIntent =
      textLower.includes('maintenance') ||
      textLower.includes('under maintenance') ||
      (textLower.includes('status') && (textLower.includes('set') || textLower.includes('change') || textLower.includes('mark')));

    if (isStatusUpdateIntent) {
      const unit = matchedItem || items[0];
      const targetStatus = textLower.includes('available') ? 'Available' : 'Under Maintenance';

      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Prepared status update for ${unit.tag} to '${targetStatus}'. Please review and confirm:`,
        action_preview: {
          id: `act-${Date.now().toString(36)}`,
          intent: 'status_update',
          category: unit.category,
          record_identifier: unit.tag,
          unit_id: unit.id,
          unit_tag: unit.tag,
          unit_model: unit.model,
          target_status: targetStatus,
          title: `Shift Status: ${unit.tag}`,
          description: `Update operational status to ${targetStatus}.`,
          changes: [
            { field: 'Status', from: unit.status, to: targetStatus },
          ],
          requires_confirmation: true,
          confirmation_token: `candela-token-${Date.now()}`,
          expires_at: new Date(Date.now() + 300000).toISOString(),
        },
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 6. Action Preview: Radio Configuration Update
    if (textLower.includes('radio') || textLower.includes('chipset')) {
      const unit = (matchedItem && matchedItem.category === 'lanforge') ? matchedItem : (items.find(i => i.category === 'lanforge') || items[0]);
      let chipset = 'Intel BE200';
      if (textLower.includes('ax210')) chipset = 'Intel AX210';
      if (textLower.includes('qcn9274') || textLower.includes('qualcomm')) chipset = 'Qualcomm QCN9274';
      if (textLower.includes('bcm4375') || textLower.includes('broadcom')) chipset = 'Broadcom BCM4375';

      const qtyMatch = textLower.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 2;

      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Prepared radio hardware interface update for ${unit.tag}. Please review and confirm:`,
        action_preview: {
          id: `act-${Date.now().toString(36)}`,
          intent: 'radio_configuration_update',
          category: 'lanforge',
          record_identifier: unit.tag,
          unit_id: unit.id,
          unit_tag: unit.tag,
          unit_model: unit.model,
          radio_chipset: chipset,
          radio_quantity: quantity,
          title: `Update Radios: ${unit.tag}`,
          description: `Configure ${quantity}x ${chipset} radio interfaces on testbed.`,
          changes: [
            { field: `${chipset} Quantity`, from: 0, to: quantity },
          ],
          requires_confirmation: true,
          confirmation_token: `candela-token-${Date.now()}`,
          expires_at: new Date(Date.now() + 300000).toISOString(),
        },
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 6. Query by Employee Custodian (e.g. "What equipment is assigned to Sirisha?")
    if (matchedProfile || textLower.includes('assigned to') || textLower.includes('my equipment')) {
      const targetName = matchedProfile ? matchedProfile.full_name : 'Sirisha';
      const assignedUnits = items.filter(i => 
        i.custodian && i.custodian.toLowerCase().includes(targetName.toLowerCase())
      );

      if (assignedUnits.length > 0) {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `Found ${assignedUnits.length} active hardware unit${assignedUnits.length === 1 ? '' : 's'} assigned to ${targetName}:`,
          query_results: assignedUnits.map(u => ({
            id: u.id,
            tag: u.tag,
            model: u.model,
            category: u.category,
            status: u.status,
            location: u.location,
            custodian: u.custodian,
            details: u.details,
          })),
          status: 'success',
          engine: 'candela-database-ai',
        });
      } else {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `Currently, no hardware assets are actively assigned to ${targetName} in the live database. All equipment is either available or allocated to other engineers.`,
          query_results: [],
          status: 'success',
          engine: 'candela-database-ai',
        });
      }
    }

    // 7. Query Available Units — only as a pure query (no action verbs like make/set/mark/free/release/return/unassign)
    const isActionVerb = ['make', 'set', 'mark', 'free up', 'release', 'unassign', 'return', 'check in'].some(v => textLower.includes(v));
    if (!isActionVerb && (textLower.includes('available') || textLower.includes('ready for assignment') || textLower.includes('free') || textLower.includes('unassigned'))) {
      let filtered = items.filter(i => i.status === 'Available');
      if (textLower.includes('lanforge')) filtered = filtered.filter(i => i.category === 'lanforge');
      else if (textLower.includes('desktop')) filtered = filtered.filter(i => i.category === 'desktop');
      else if (textLower.includes('mobile') || textLower.includes('phone')) filtered = filtered.filter(i => i.category === 'mobile');
      else if (textLower.includes('chamber')) filtered = filtered.filter(i => i.category === 'chamber');

      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Found ${filtered.length} hardware unit${filtered.length === 1 ? '' : 's'} currently Available and ready for project assignment:`,
        query_results: filtered.slice(0, 10).map(u => ({
          id: u.id,
          tag: u.tag,
          model: u.model,
          category: u.category,
          status: u.status,
          location: u.location,
          custodian: u.custodian,
          details: u.details,
        })),
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 8. Query by Lab Location (OPEL, VINSR, GVP, PRIMA)
    const locMatch = ['opel', 'vinsr', 'gvp', 'prima'].find(l => textLower.includes(l));
    if (locMatch) {
      const locUpper = locMatch.toUpperCase();
      let locUnits = items.filter(i => i.location && i.location.toUpperCase().includes(locUpper));
      if (textLower.includes('lanforge')) locUnits = locUnits.filter(i => i.category === 'lanforge');
      else if (textLower.includes('desktop')) locUnits = locUnits.filter(i => i.category === 'desktop');
      else if (textLower.includes('mobile')) locUnits = locUnits.filter(i => i.category === 'mobile');
      else if (textLower.includes('chamber')) locUnits = locUnits.filter(i => i.category === 'chamber');

      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Found ${locUnits.length} hardware asset${locUnits.length === 1 ? '' : 's'} located in lab facility '${locUpper}':`,
        query_results: locUnits.slice(0, 10).map(u => ({
          id: u.id,
          tag: u.tag,
          model: u.model,
          category: u.category,
          status: u.status,
          location: u.location,
          custodian: u.custodian,
          details: u.details,
        })),
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 9. Query by Specific Tag / Identifier
    if (matchedItem) {
      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Found asset specifications for ${matchedItem.tag} (${matchedItem.model}):`,
        query_results: [{
          id: matchedItem.id,
          tag: matchedItem.tag,
          model: matchedItem.model,
          category: matchedItem.category,
          status: matchedItem.status,
          location: matchedItem.location,
          custodian: matchedItem.custodian,
          details: matchedItem.details,
        }],
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 10. General Overview & System Capabilities
    const lfCount = items.filter(i => i.category === 'lanforge').length;
    const dtCount = items.filter(i => i.category === 'desktop').length;
    const mbCount = items.filter(i => i.category === 'mobile').length;
    const chCount = items.filter(i => i.category === 'chamber').length;

    return NextResponse.json({
      message_id: msgId,
      conversation_id: convId,
      sender: 'assistant',
      timestamp,
      text: `Hello! I am your Candela Lab Inventory Assistant, directly synchronized with your live database.\n\n` +
        `**Live Inventory Summary:**\n` +
        `• **LANforge Testbeds:** ${lfCount} units (CT523c, CT521B, CT525 across OPEL, VINSR, GVP)\n` +
        `• **Engineering Desktops:** ${dtCount} workstations (Dell, HP, Lenovo)\n` +
        `• **Mobile Test Fleet:** ${mbCount} devices (Pixel, Galaxy, OnePlus)\n` +
        `• **RF Chambers:** ${chCount} enclosures (Anechoic & RF Isolation)\n\n` +
        `**Team Members:** ${profiles.map(p => p.full_name).join(', ')}\n\n` +
        `**Quick commands you can try:**\n` +
        `1. *"What equipment is currently assigned to Sirisha?"*\n` +
        `2. *"Show all available LANforges in OPEL"*\n` +
        `3. *"Assign LF-OPEL-523C-01 to Deepika for project Netgear"*\n` +
        `4. *"Set DT-01 to Under Maintenance for diagnostic run"*\n` +
        `5. *"Show equipment assigned to Tejas"*`,
      query_results: items.slice(0, 4).map(u => ({
        id: u.id,
        tag: u.tag,
        model: u.model,
        category: u.category,
        status: u.status,
        location: u.location,
        custodian: u.custodian,
        details: u.details,
      })),
      status: 'success',
      engine: 'candela-database-ai',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal assistant processing error.' },
      { status: 500 }
    );
  }
}
