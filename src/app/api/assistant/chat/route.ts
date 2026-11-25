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

      if (lfList) {
        lfList
          .filter((l: any) => !l.is_archived)
          .forEach((l: any) => {
            const tag = (l.lanforge_id || '').toUpperCase();
            const isPrima = l.comments && l.comments.includes('[Location: PRIMA]');
            const location = isPrima ? 'PRIMA' : (l.location || 'OPEL');
            const custodian = activeAsgnMap.get(tag) || (l.poc_id ? profMap.get(l.poc_id) : null) || (l.status === 'Available' ? 'Unassigned' : 'In-Use');
            items.push({
              id: l.id,
              tag: l.lanforge_id,
              model: l.lanforge_model || 'LANforge',
              category: 'lanforge',
              status: l.status || 'Available',
              location,
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

      if (dtList) {
        dtList
          .filter((d: any) => !d.is_archived)
          .forEach((d: any) => {
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

      if (mbList) {
        mbList
          .filter((m: any) => !m.is_archived)
          .forEach((m: any) => {
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

      if (chList) {
        chList
          .filter((c: any) => !c.is_archived)
          .forEach((c: any) => {
            const tag = (c.chamber_id || '').toUpperCase();
            const custodian = activeAsgnMap.get(tag) || (c.used_by_id ? profMap.get(c.used_by_id) : (c.poc_id ? profMap.get(c.poc_id) : null)) || (c.status === 'Available' ? 'Unassigned' : 'In-Use');
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

      return { items, profiles };
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

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const formatResultItem = (u: InventoryItemUnified) => ({
      id: u.id,
      tag: u.tag,
      model: u.model,
      category: u.category,
      status: u.status,
      location: u.location,
      project: u.project,
      custodian: u.custodian,
      details: u.details,
    });

    // Identify mentioned employee from actual team directory using strict word boundaries
    let matchedProfile: { id: string; full_name: string; email: string; role: string } | null = null;

    const toMatch = textLower.match(/\b(?:to|assign to|transfer to|for)\s+([a-z]+)\b/i);
    if (toMatch) {
      const targetWord = toMatch[1].toLowerCase();
      if (targetWord.length >= 3) {
        const explicitProfile = profiles.find((p) =>
          p.full_name.toLowerCase().split(/\s+/).some((part) => part === targetWord || part.startsWith(targetWord))
        );
        if (explicitProfile) {
          matchedProfile = explicitProfile;
        }
      }
    }

    if (!matchedProfile) {
      for (const p of profiles) {
        const nameParts = p.full_name.toLowerCase().split(/\s+/);
        const isMatch = nameParts.some((part) => {
          if (part.length < 3) return false;
          return new RegExp(`\\b${escapeRegex(part)}\\b`, 'i').test(textLower);
        });
        if (isMatch) {
          matchedProfile = p;
          break;
        }
      }
    }

    // Identify exact or specific asset tag match (e.g. LF-OPEL-523C-01, DT-01, MOB-02, CH-01)
    let matchedItem: InventoryItemUnified | undefined;
    if (context_unit_tag) {
      matchedItem = items.find((i) => i.tag.toUpperCase() === context_unit_tag.toUpperCase());
    }

    if (!matchedItem) {
      for (const item of items) {
        const tagEscaped = escapeRegex(item.tag.toLowerCase());
        if (new RegExp(`\\b${tagEscaped}\\b`, 'i').test(textLower)) {
          matchedItem = item;
          break;
        }
      }
    }

    if (!matchedItem) {
      // Specific prefix-tag pattern like lf-opel-523c-03, dt-01, mob-02, ch-01
      const exactTagMatch = textLower.match(/\b(lf-[a-z0-9_-]+|dt-[a-z0-9_-]+|mob-[a-z0-9_-]+|ch-[a-z0-9_-]+)\b/i);
      if (exactTagMatch) {
        const queryClean = exactTagMatch[1].replace(/[\s_-]+/g, '').toLowerCase();
        const candidates = items.filter((i) => i.tag.replace(/[\s_-]+/g, '').toLowerCase().includes(queryClean));
        if (candidates.length === 1) {
          matchedItem = candidates[0];
        } else if (candidates.length > 1) {
          matchedItem = candidates.find((c) => c.status === 'Available') || candidates[0];
        }
      }
    }

    // Determine if the user is asking a query/filter vs. requesting a state mutation
    const isQueryQuestion =
      /\b(show|list|find|get|what|which|how many|count|filter|search|view|display|check|tell me|who)\b/i.test(textLower) ||
      textLower.endsWith('?');

    // 3. Action Preview: Assignment / Custody Transfer (imperative verb with word boundary)
    const isAssignMutation =
      /\b(assign|transfer|allocate|reassign)\b/i.test(textLower) &&
      !(/\b(what|which|show|list|who)\b.*\b(assigned|allocated)\b/i.test(textLower));

    if (isAssignMutation) {
      const isTransfer = /\b(transfer|reassign)\b/i.test(textLower);
      const unit = matchedItem || items.find((i) => i.status === 'Available') || items[0];

      if (!unit) {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: 'No hardware units were found in the database to assign.',
          status: 'success',
          engine: 'candela-database-ai',
        });
      }

      if (!matchedProfile) {
        const teamNames = profiles
          .filter((p) => p.role !== 'admin')
          .map((p) => p.full_name)
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
    const isReturnIntent =
      /\b(return|check[\s-]?in|free\s+up|release|unassign)\b/i.test(textLower) ||
      (/\b(make|mark|set)\b/i.test(textLower) && /\bavailable\b/i.test(textLower));

    if (isReturnIntent) {
      const unit = matchedItem || items.find((i) => i.status === 'In-Use') || items[0];
      if (unit) {
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
    }

    // 5. Action Preview: Status Update to Under Maintenance (only when imperative verb + unit or explicit set/mark)
    const isStatusUpdateIntent =
      !isQueryQuestion &&
      (/\b(mark|set|put|move|change|update)\b/i.test(textLower) || Boolean(matchedItem)) &&
      /\b(maintenance|under maintenance)\b/i.test(textLower);

    if (isStatusUpdateIntent) {
      const unit = matchedItem || items[0];
      const targetStatus = /\bavailable\b/i.test(textLower) ? 'Available' : 'Under Maintenance';

      if (unit) {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `Prepared status update for **${unit.tag}** to '${targetStatus}'. Please review and confirm:`,
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
    }

    // 6. Action Preview: Radio Configuration Update
    if (/\b(update|set|add|configure|change)\b.*\b(radio|radios|chipset)\b/i.test(textLower)) {
      const unit = (matchedItem && matchedItem.category === 'lanforge') ? matchedItem : (items.find((i) => i.category === 'lanforge') || items[0]);
      let chipset = 'Intel BE200';
      if (textLower.includes('ax210')) chipset = 'Intel AX210';
      if (textLower.includes('qcn9274') || textLower.includes('qualcomm')) chipset = 'Qualcomm QCN9274';
      if (textLower.includes('bcm4375') || textLower.includes('broadcom')) chipset = 'Broadcom BCM4375';

      const qtyMatch = textLower.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 2;

      if (unit) {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `Prepared radio hardware interface update for **${unit.tag}**. Please review and confirm:`,
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
    }

    // =========================================================================
    // 7. UNIFIED MULTI-CONDITION QUERY & FILTER ENGINE
    //    Supports single or combined filters: Status, Category, Location,
    //    Custodian, Project, and Model/Brand/Chipset keywords.
    //    Always returns ALL matching units (no artificial 1-unit truncation).
    // =========================================================================
    const appliedFilters: string[] = [];
    let filtered = [...items];

    // 7a. Status filter
    let statusFilter: string | null = null;
    if (/\b(available|free|unassigned|ready)\b/i.test(textLower)) {
      statusFilter = 'Available';
    } else if (/\b(maintenance|under maintenance|repair|faulty)\b/i.test(textLower)) {
      statusFilter = 'Under Maintenance';
    } else if (/\b(in[\s-]?use|occupied|allocated|busy)\b/i.test(textLower)) {
      statusFilter = 'In-Use';
    }
    if (statusFilter) {
      filtered = filtered.filter((i) => i.status === statusFilter);
      appliedFilters.push(`Status: ${statusFilter}`);
    }

    // 7b. Category filter
    let categoryFilter: string | null = null;
    if (/\b(lanforge|lanforges|testbed|testbeds)\b/i.test(textLower)) {
      categoryFilter = 'lanforge';
      filtered = filtered.filter((i) => i.category === 'lanforge');
      appliedFilters.push('Category: LANforges');
    } else if (/\b(real devices?|client devices?)\b/i.test(textLower)) {
      categoryFilter = 'real-devices';
      filtered = filtered.filter((i) => i.category === 'desktop' || i.category === 'mobile');
      appliedFilters.push('Category: Real Devices');
    } else if (/\b(desktop|desktops|workstation|workstations)\b/i.test(textLower)) {
      categoryFilter = 'desktop';
      filtered = filtered.filter((i) => i.category === 'desktop');
      appliedFilters.push('Category: Desktops');
    } else if (/\b(mobile|mobiles|phone|phones|smartphone|smartphones)\b/i.test(textLower)) {
      categoryFilter = 'mobile';
      filtered = filtered.filter((i) => i.category === 'mobile');
      appliedFilters.push('Category: Mobiles');
    } else if (/\b(chamber|chambers|enclosure|enclosures)\b/i.test(textLower)) {
      categoryFilter = 'chamber';
      filtered = filtered.filter((i) => i.category === 'chamber');
      appliedFilters.push('Category: Chambers');
    }

    // 7c. Location filter
    const locMatch = ['opel', 'vinsr', 'gvp', 'prima'].find((l) =>
      new RegExp(`\\b${l}\\b`, 'i').test(textLower)
    );
    if (locMatch) {
      const locUpper = locMatch.toUpperCase();
      filtered = filtered.filter((i) => i.location && i.location.toUpperCase().includes(locUpper));
      appliedFilters.push(`Location: ${locUpper}`);
    }

    // 7d. Custodian / Employee filter
    const isMyEquipment = /\b(my equipment|assigned to me|my units|my devices)\b/i.test(textLower);
    const currentUserName = req.headers.get('x-user-name') || '';
    if (matchedProfile) {
      filtered = filtered.filter(
        (i) => i.custodian && i.custodian.toLowerCase().includes(matchedProfile!.full_name.toLowerCase())
      );
      appliedFilters.push(`Custodian: ${matchedProfile.full_name}`);
    } else if (isMyEquipment && currentUserName) {
      filtered = filtered.filter(
        (i) => i.custodian && i.custodian.toLowerCase().includes(currentUserName.toLowerCase())
      );
      appliedFilters.push(`Custodian: ${currentUserName}`);
    }

    // 7e. Model / Brand / Chipset / Tag-prefix keyword filter
    const modelKeywords = [
      'ct523c', '523c', 'ct521b', '521b', 'ct525', '525',
      'pixel', 'samsung', 'galaxy', 'oneplus', 'iphone', 'apple', 'motorola', 'xiaomi',
      'dell', 'lenovo', 'thinkpad', 'hp', 'macbook',
      'be200', 'ax210', 'qcn9274', 'bcm4375',
      'anechoic', 'isolation', 'shielded'
    ];
    const matchedModelKw = modelKeywords.find((kw) => new RegExp(`\\b${escapeRegex(kw)}`, 'i').test(textLower));
    if (matchedModelKw) {
      const kwLower = matchedModelKw.toLowerCase();
      filtered = filtered.filter((i) => {
        const hay = `${i.tag} ${i.model} ${i.details?.radios || ''} ${i.details?.brand || ''}`.toLowerCase();
        return hay.includes(kwLower);
      });
      appliedFilters.push(`Model/Spec: ${matchedModelKw.toUpperCase()}`);
    }

    // 7f. Project filter (match against actual projects present in live DB)
    const knownProjects = Array.from(
      new Set(
        items
          .map((i) => i.project?.trim())
          .filter((p): p is string => Boolean(p && p.length >= 2 && p.toLowerCase() !== 'unassigned' && p.toLowerCase() !== 'none'))
      )
    );
    const matchedProject = knownProjects.find((proj) =>
      new RegExp(`\\b${escapeRegex(proj)}\\b`, 'i').test(textLower)
    );
    if (matchedProject) {
      filtered = filtered.filter((i) => i.project && i.project.toLowerCase().includes(matchedProject.toLowerCase()));
      appliedFilters.push(`Project: ${matchedProject}`);
    }

    // If any filter was applied, return ALL matching units
    if (appliedFilters.length > 0) {
      const filterSummary = appliedFilters.join(' • ');
      if (filtered.length > 0) {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `Found **${filtered.length}** hardware unit${filtered.length === 1 ? '' : 's'} matching **${filterSummary}**:`,
          query_results: filtered.map(formatResultItem),
          status: 'success',
          engine: 'candela-database-ai',
        });
      } else {
        return NextResponse.json({
          message_id: msgId,
          conversation_id: convId,
          sender: 'assistant',
          timestamp,
          text: `No hardware units matched **${filterSummary}** in the live database.`,
          query_results: [],
          status: 'success',
          engine: 'candela-database-ai',
        });
      }
    }

    // 8. Query by Specific Tag / Identifier (only when no broader filter was given)
    if (matchedItem) {
      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        text: `Found asset specifications for **${matchedItem.tag}** (${matchedItem.model}):`,
        query_results: [formatResultItem(matchedItem)],
        status: 'success',
        engine: 'candela-database-ai',
      });
    }

    // 9. General Overview & System Capabilities
    const lfCount = items.filter((i) => i.category === 'lanforge').length;
    const dtCount = items.filter((i) => i.category === 'desktop').length;
    const mbCount = items.filter((i) => i.category === 'mobile').length;
    const chCount = items.filter((i) => i.category === 'chamber').length;

    return NextResponse.json({
      message_id: msgId,
      conversation_id: convId,
      sender: 'assistant',
      timestamp,
      text: `Hello! I am your Candela Lab Inventory Assistant, directly synchronized with your live database.\n\n` +
        `**Live Inventory Summary:**\n` +
        `• **LANforge Testbeds:** ${lfCount} units\n` +
        `• **Real Devices:** ${dtCount + mbCount} units (${mbCount} Mobiles, ${dtCount} Desktops)\n` +
        `• **RF Chambers:** ${chCount} enclosures\n\n` +
        `**Quick commands you can try:**\n` +
        `1. *"Show all available units"*\n` +
        `2. *"Show available LANforges in OPEL"*\n` +
        `3. *"Show units under maintenance"*\n` +
        `4. *"What equipment is assigned to Sirisha?"*\n` +
        `5. *"Show all CT523c units"*`,
      query_results: items.slice(0, 4).map(formatResultItem),
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
