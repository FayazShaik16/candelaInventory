import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  INITIAL_LANFORGES,
  INITIAL_DESKTOPS,
  INITIAL_MOBILES,
  INITIAL_CHAMBERS,
  INITIAL_ASSIGNMENTS,
} from '@/data/inventorySeed';
import { INITIAL_MOCK_PROFILES } from '@/lib/auth/mockUsers';

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

interface ActiveFilters {
  status?: string | null;
  category?: string | null;
  location?: string | null;
  custodian?: string | null;
  modelKeyword?: string | null;
  project?: string | null;
}

interface SessionContext {
  filters?: ActiveFilters;
  lastResultTags?: string[];
  lastMatchedTag?: string | null;
  lastMatchedCustodian?: string | null;
  lastIntent?: string | null;
}

// In-memory session store keyed by conversation_id (backed up by client-sent session_context)
const sessionStore = new Map<string, SessionContext>();
const MAX_SESSIONS = 200;

function saveSession(convId: string, ctx: SessionContext) {
  if (sessionStore.size >= MAX_SESSIONS) {
    const oldestKey = sessionStore.keys().next().value;
    if (oldestKey) sessionStore.delete(oldestKey);
  }
  sessionStore.set(convId, ctx);
}

const STOPWORDS = new Set([
  'the', 'all', 'and', 'for', 'with', 'from', 'that', 'this', 'those', 'these', 'them',
  'unit', 'units', 'device', 'devices', 'equipment', 'hardware', 'asset', 'assets',
  'show', 'list', 'find', 'get', 'give', 'tell', 'check', 'what', 'which', 'where', 'who',
  'how', 'many', 'count', 'total', 'status', 'available', 'free', 'unassigned', 'ready',
  'inuse', 'occupied', 'allocated', 'busy', 'active', 'maintenance', 'repair', 'faulty',
  'lanforge', 'lanforges', 'testbed', 'testbeds', 'desktop', 'desktops', 'workstation',
  'workstations', 'mobile', 'mobiles', 'phone', 'phones', 'chamber', 'chambers', 'real',
  'assign', 'assigned', 'transfer', 'allocate', 'release', 'return', 'set', 'mark', 'make',
  'only', 'just', 'about', 'now', 'also', 'same', 'are', 'is', 'currently', 'lab', 'project',
  'please', 'can', 'you', 'me', 'my', 'have', 'has', 'any', 'into', 'under', 'one', 'first',
  'second', 'third', 'last', 'radio', 'radios', 'chipset', 'model', 'location', 'custodian',
  'unassigned', 'none', 'general', 'client', 'clients', 'enclosure', 'enclosures',
]);

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getUnifiedInventory(): Promise<{
  items: InventoryItemUnified[];
  profiles: Array<{ id: string; full_name: string; email: string; role: string }>;
  dropdownChipsets: string[];
  dropdownLocations: string[];
  dropdownProjects: string[];
}> {
  const supabase = createAdminClient();
  let profiles: Array<{ id: string; full_name: string; email: string; role: string }> = INITIAL_MOCK_PROFILES.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
  }));

  const items: InventoryItemUnified[] = [];
  let dropdownChipsets: string[] = [];
  let dropdownLocations: string[] = [];
  let dropdownProjects: string[] = [];

  if (supabase) {
    try {
      const [
        { data: profList },
        { data: lfList },
        { data: dtList },
        { data: mbList },
        { data: chList },
        { data: asgnList },
        { data: ddList },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role').order('full_name', { ascending: true }),
        supabase.from('lanforges').select('*, lanforge_radios(*)').order('s_no', { ascending: true }),
        supabase.from('desktops').select('*').order('s_no', { ascending: true }),
        supabase.from('mobiles').select('*').order('s_no', { ascending: true }),
        supabase.from('chambers').select('*').order('s_no', { ascending: true }),
        supabase.from('inventory_assignments').select('*, profiles:employee_id(full_name, email)').is('returned_at', null),
        supabase.from('inventory_dropdown_settings').select('category, value, is_active').eq('is_active', true),
      ]);

      if (profList && profList.length > 0) {
        profiles = profList;
      }

      if (ddList) {
        dropdownChipsets = ddList.filter((d: any) => d.category === 'radio_chipsets').map((d: any) => d.value);
        dropdownLocations = ddList.filter((d: any) => d.category === 'locations').map((d: any) => d.value);
        dropdownProjects = ddList.filter((d: any) => d.category === 'projects').map((d: any) => d.value);
      }

      const profMap = new Map<string, string>();
      profiles.forEach((p) => profMap.set(p.id, p.full_name));

      const activeAsgnMap = new Map<string, string>();
      if (asgnList) {
        asgnList.forEach((a: any) => {
          const empName = a.profiles?.full_name || profMap.get(a.employee_id) || 'Assigned';
          if (a.inventory_tag) activeAsgnMap.set(a.inventory_tag.toUpperCase(), empName);
        });
      }

      if (lfList) {
        lfList
          .filter((l: any) => !l.is_archived)
          .forEach((l: any) => {
            const tag = (l.lanforge_id || '').toUpperCase();
            const isPrima = l.comments && l.comments.includes('[Location: PRIMA]');
            const location = isPrima ? 'PRIMA' : l.location || 'OPEL';
            const custodian =
              activeAsgnMap.get(tag) ||
              (l.poc_id ? profMap.get(l.poc_id) : null) ||
              (l.status === 'Available' ? 'Unassigned' : 'In-Use');
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
                ip: l.testbed_ip === '0.0.0.0' ? '' : l.testbed_ip,
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
            const custodian =
              activeAsgnMap.get(tag) ||
              (d.poc_id ? profMap.get(d.poc_id) : null) ||
              (d.status === 'Available' ? 'Unassigned' : 'In-Use');
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
            const custodian =
              activeAsgnMap.get(tag) ||
              (m.poc_id ? profMap.get(m.poc_id) : null) ||
              (m.status === 'Available' ? 'Unassigned' : 'In-Use');
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
            const custodian =
              activeAsgnMap.get(tag) ||
              (c.used_by_id ? profMap.get(c.used_by_id) : c.poc_id ? profMap.get(c.poc_id) : null) ||
              (c.status === 'Available' ? 'Unassigned' : 'In-Use');
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

      return { items, profiles, dropdownChipsets, dropdownLocations, dropdownProjects };
    } catch {
      // Fall through to seed fallback only when DB is unreachable
    }
  }

  // Seed Fallback (offline/no Supabase config only)
  const profMap = new Map<string, string>();
  profiles.forEach((p) => profMap.set(p.id, p.full_name));

  const activeAsgnMap = new Map<string, string>();
  INITIAL_ASSIGNMENTS.forEach((a) => {
    if (!a.returnDate && a.equipmentTag) {
      activeAsgnMap.set(a.equipmentTag.toUpperCase(), a.employeeName || profMap.get(a.employeeId) || 'Assigned');
    }
  });

  INITIAL_LANFORGES.forEach((l) => {
    const tag = (l.lanforgeId || '').toUpperCase();
    const custodian =
      activeAsgnMap.get(tag) ||
      (l.pocId ? profMap.get(l.pocId) : null) ||
      (l.status === 'Available' ? 'Unassigned' : 'In-Use');
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
        radios: l.radios.map((r) => `${r.chipset} (${r.quantity})`).join(', '),
      },
    });
  });

  INITIAL_DESKTOPS.forEach((d) => {
    const tag = (d.deviceId || '').toUpperCase();
    const custodian =
      activeAsgnMap.get(tag) ||
      d.pocName ||
      (d.pocId ? profMap.get(d.pocId) : null) ||
      (d.status === 'Available' ? 'Unassigned' : 'In-Use');
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

  INITIAL_MOBILES.forEach((m) => {
    const tag = (m.deviceId || '').toUpperCase();
    const custodian =
      activeAsgnMap.get(tag) ||
      m.pocName ||
      (m.pocId ? profMap.get(m.pocId) : null) ||
      (m.status === 'Available' ? 'Unassigned' : 'In-Use');
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

  INITIAL_CHAMBERS.forEach((c) => {
    const tag = (c.chamberId || '').toUpperCase();
    const custodian =
      activeAsgnMap.get(tag) ||
      c.usedByName ||
      (c.usedById ? profMap.get(c.usedById) : null) ||
      (c.status === 'Available' ? 'Unassigned' : 'In-Use');
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

  return { items, profiles, dropdownChipsets, dropdownLocations, dropdownProjects };
}

function applyFilters(items: InventoryItemUnified[], filters: ActiveFilters): InventoryItemUnified[] {
  let result = [...items];
  if (filters.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  if (filters.category) {
    if (filters.category === 'real-devices') {
      result = result.filter((i) => i.category === 'desktop' || i.category === 'mobile');
    } else {
      result = result.filter((i) => i.category === filters.category);
    }
  }
  if (filters.location) {
    const locLower = filters.location.toLowerCase();
    result = result.filter((i) => i.location && i.location.toLowerCase().includes(locLower));
  }
  if (filters.custodian) {
    const custLower = filters.custodian.toLowerCase();
    result = result.filter((i) => i.custodian && i.custodian.toLowerCase().includes(custLower));
  }
  if (filters.modelKeyword) {
    const kwLower = filters.modelKeyword.toLowerCase();
    result = result.filter((i) => {
      const hay = `${i.tag} ${i.model} ${i.details?.radios || ''} ${i.details?.brand || ''} ${i.details?.type || ''}`.toLowerCase();
      return hay.includes(kwLower);
    });
  }
  if (filters.project) {
    const projLower = filters.project.toLowerCase();
    result = result.filter((i) => i.project && i.project.toLowerCase().includes(projLower));
  }
  return result;
}

function describeFilters(filters: ActiveFilters): string {
  const parts: string[] = [];
  if (filters.status) parts.push(filters.status.toLowerCase());
  if (filters.modelKeyword) parts.push(filters.modelKeyword);
  if (filters.category) {
    const catLabels: Record<string, string> = {
      lanforge: 'LANforge units',
      'real-devices': 'Real Devices',
      desktop: 'Desktops',
      mobile: 'Mobiles',
      chamber: 'Chambers',
    };
    parts.push(catLabels[filters.category] || 'units');
  } else {
    parts.push('hardware units');
  }
  if (filters.location) parts.push(`in ${filters.location}`);
  if (filters.project) parts.push(`for project ${filters.project}`);
  if (filters.custodian) parts.push(`assigned to ${filters.custodian}`);
  return parts.join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversation_id, context_unit_tag, session_context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }

    // 1. Proxy to external AI backend ONLY when explicitly configured via env
    if (process.env.AI_BACKEND_URL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${process.env.AI_BACKEND_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': req.headers.get('x-user-role') || 'admin',
            'x-user-id': req.headers.get('x-user-id') || '',
            'x-user-name': req.headers.get('x-user-name') || 'Admin Supervisor',
          },
          body: JSON.stringify({ message, conversation_id, context_unit_tag, session_context }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data && data.text) {
            return NextResponse.json({ ...data, engine: 'fastapi-backend' });
          }
        }
      } catch {
        // External backend unreachable; continue with live DB engine
      }
    }

    // 2. Fetch Live Database State + Session Memory
    const { items, profiles, dropdownChipsets, dropdownLocations, dropdownProjects } = await getUnifiedInventory();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const textLower = message.toLowerCase().trim();
    const msgId = `msg-${Date.now().toString(36)}`;
    const convId = conversation_id || `conv-${Date.now().toString(36)}`;

    const prevContext: SessionContext = {
      ...(sessionStore.get(convId) || {}),
      ...(session_context || {}),
    };

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

    const respond = (payload: Record<string, any>, nextContext: SessionContext) => {
      saveSession(convId, nextContext);
      return NextResponse.json({
        message_id: msgId,
        conversation_id: convId,
        sender: 'assistant',
        timestamp,
        status: 'success',
        engine: 'candela-database-ai',
        session_context: nextContext,
        ...payload,
      });
    };

    // 3. Dynamically extract all valid Locations, Projects, Chipsets, and Model Tokens from live DB
    const knownLocations = Array.from(
      new Set([
        ...items.map((i) => i.location?.trim()).filter(Boolean),
        ...dropdownLocations.map((l) => l.trim()).filter(Boolean),
      ])
    ) as string[];

    const knownProjects = Array.from(
      new Set([
        ...items
          .map((i) => i.project?.trim())
          .filter((p): p is string => Boolean(p && p.length >= 2 && !['unassigned', 'none', 'general'].includes(p.toLowerCase()))),
        ...dropdownProjects.map((p) => p.trim()).filter(Boolean),
      ])
    );

    const knownChipsets: string[] = Array.from(
      new Set([
        ...dropdownChipsets,
        ...items.flatMap((i) =>
          String(i.details?.radios || '')
            .split(',')
            .map((r: string) => r.replace(/\(\d+\)/g, '').trim())
            .filter(Boolean)
        ),
      ])
    );

    const knownModelTokens = Array.from(
      new Set(
        items.flatMap((i) => {
          const raw = `${i.model} ${i.details?.brand || ''} ${i.details?.type || ''} ${i.details?.radios || ''} ${i.tag}`;
          return raw
            .toLowerCase()
            .split(/[^a-z0-9.+-]+/)
            .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
        })
      )
    );

    // 4. Identify mentioned Employee from live profiles using strict word boundaries
    let matchedProfile: { id: string; full_name: string; email: string; role: string } | null = null;
    const toMatch = textLower.match(/\b(?:to|assign to|transfer to|for)\s+([a-z]+)\b/i);
    if (toMatch && toMatch[1].length >= 3) {
      const targetWord = toMatch[1].toLowerCase();
      matchedProfile =
        profiles.find((p) =>
          p.full_name
            .toLowerCase()
            .split(/\s+/)
            .some((part) => part === targetWord || (part.length >= 3 && part.startsWith(targetWord)))
        ) || null;
    }

    if (!matchedProfile) {
      for (const p of profiles) {
        const nameParts = p.full_name.toLowerCase().split(/\s+/);
        if (nameParts.some((part) => part.length >= 3 && new RegExp(`\\b${escapeRegex(part)}\\b`, 'i').test(textLower))) {
          matchedProfile = p;
          break;
        }
      }
    }

    // 5. Identify Specific Asset Tag (or resolve pronoun/ordinal reference from session memory)
    let matchedItem: InventoryItemUnified | undefined;
    if (context_unit_tag) {
      matchedItem = items.find((i) => i.tag.toUpperCase() === context_unit_tag.toUpperCase());
    }

    if (!matchedItem) {
      for (const item of items) {
        if (new RegExp(`\\b${escapeRegex(item.tag.toLowerCase())}\\b`, 'i').test(textLower)) {
          matchedItem = item;
          break;
        }
      }
    }

    if (!matchedItem) {
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

    // Resolve session pronouns/ordinals: "it", "that", "this unit", "the first one", "2nd", etc.
    if (!matchedItem && prevContext) {
      const lastTags = prevContext.lastResultTags || [];
      let refIndex = -1;
      if (/\b(first|1st)\b/i.test(textLower)) refIndex = 0;
      else if (/\b(second|2nd)\b/i.test(textLower)) refIndex = 1;
      else if (/\b(third|3rd)\b/i.test(textLower)) refIndex = 2;
      else if (/\b(last)\b/i.test(textLower) && lastTags.length > 0) refIndex = lastTags.length - 1;

      if (refIndex >= 0 && lastTags[refIndex]) {
        matchedItem = items.find((i) => i.tag === lastTags[refIndex]);
      } else if (/\b(it|its|that unit|this unit|that one|this one)\b/i.test(textLower) || /\b(assign|transfer|release|return|set|mark)\s+that\b/i.test(textLower)) {
        const refTag = prevContext.lastMatchedTag || lastTags[0];
        if (refTag) {
          matchedItem = items.find((i) => i.tag === refTag);
        }
      }
    }

    // 6. Greetings (clean & concise, no unrequested unit dumps)
    if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)[!.,\s]*$/i.test(textLower)) {
      return respond(
        {
          text: 'Hello! How can I help you with the Candela lab inventory today?',
          query_results: [],
        },
        { ...prevContext, lastIntent: 'greeting' }
      );
    }

    // 7. Help / Overview (concise live counts only, no unrequested cards)
    if (/^(help|overview|summary|inventory summary|what can you do|capabilities)[?!.\s]*$/i.test(textLower) || /\b(what can you do|help me|inventory summary|lab summary)\b/i.test(textLower)) {
      const lfCount = items.filter((i) => i.category === 'lanforge').length;
      const dtCount = items.filter((i) => i.category === 'desktop').length;
      const mbCount = items.filter((i) => i.category === 'mobile').length;
      const chCount = items.filter((i) => i.category === 'chamber').length;
      const availCount = items.filter((i) => i.status === 'Available').length;

      return respond(
        {
          text:
            `Here is the live inventory summary across **${items.length} active units** (${availCount} available):\n\n` +
            `- **LANforges:** ${lfCount} units\n` +
            `- **Real Devices:** ${dtCount + mbCount} units (${mbCount} mobiles, ${dtCount} desktops)\n` +
            `- **Chambers:** ${chCount} enclosures\n\n` +
            `You can ask me to filter by status, category, location, project, model, or custodian, or ask to assign, release, or update unit status.`,
          query_results: [],
        },
        { ...prevContext, lastIntent: 'overview' }
      );
    }

    const isQueryQuestion =
      /\b(show|list|find|get|what|which|how many|count|filter|search|view|display|check|tell me|who|where)\b/i.test(textLower) ||
      textLower.endsWith('?');

    // 8. Action Preview: Assignment / Custody Transfer
    const isAssignMutation =
      /\b(assign|transfer|allocate|reassign)\b/i.test(textLower) &&
      !/\b(what|which|show|list|who|how many)\b.*\b(assigned|allocated)\b/i.test(textLower);

    if (isAssignMutation) {
      const isTransfer = /\b(transfer|reassign)\b/i.test(textLower);
      const unit = matchedItem || items.find((i) => i.status === 'Available') || items[0];

      if (!unit) {
        return respond({ text: 'No hardware units are available in the database to assign.', query_results: [] }, prevContext);
      }

      if (!matchedProfile) {
        const teamNames = profiles.filter((p) => p.role !== 'admin').map((p) => p.full_name).join(', ');
        return respond(
          {
            text: `Who should I assign **${unit.tag}** (${unit.status}) to?\n\nAvailable team members: ${teamNames}`,
          },
          { ...prevContext, lastMatchedTag: unit.tag, lastIntent: 'assign_prompt' }
        );
      }

      let targetProject = unit.project || 'General Allocation';
      const projMatch = textLower.match(/for\s+(?:project\s+)?([a-z0-9\s_-]+?)(?:\.|$)/i);
      if (projMatch) targetProject = projMatch[1].trim();

      return respond(
        {
          text: `Prepared ${isTransfer ? 'custody transfer' : 'assignment'} for **${unit.tag}** (${unit.model}). Please confirm below:`,
          action_preview: {
            id: `act-${Date.now().toString(36)}`,
            intent: isTransfer ? 'equipment_transfer' : 'equipment_assignment',
            category: unit.category,
            record_identifier: unit.tag,
            unit_id: unit.id,
            unit_tag: unit.tag,
            unit_model: unit.model,
            target_employee_id: matchedProfile.id,
            target_employee_name: matchedProfile.full_name,
            target_employee_email: matchedProfile.email,
            target_project: targetProject,
            target_status: 'In-Use',
            title: isTransfer ? `Transfer Custody: ${unit.tag}` : `Assign Equipment: ${unit.tag}`,
            description: `Allocate hardware custody to ${matchedProfile.full_name} for ${targetProject}.`,
            changes: [
              { field: 'Custodian', from: unit.custodian || 'Unassigned', to: matchedProfile.full_name },
              { field: 'Status', from: unit.status, to: 'In-Use' },
              ...(targetProject ? [{ field: 'Project', from: unit.project || 'None', to: targetProject }] : []),
            ],
            requires_confirmation: true,
            confirmation_token: `candela-token-${Date.now()}`,
            expires_at: new Date(Date.now() + 300000).toISOString(),
          },
        },
        { ...prevContext, lastMatchedTag: unit.tag, lastMatchedCustodian: matchedProfile.full_name, lastIntent: 'assign' }
      );
    }

    // 9. Action Preview: Equipment Return / Make Available / Release
    const isReturnIntent =
      /\b(return|check[\s-]?in|free\s+up|release|unassign)\b/i.test(textLower) ||
      (/\b(make|mark|set)\b/i.test(textLower) && /\bavailable\b/i.test(textLower));

    if (isReturnIntent) {
      const unit = matchedItem || items.find((i) => i.status === 'In-Use') || items[0];
      if (unit) {
        return respond(
          {
            text: `Prepared release for **${unit.tag}** (${unit.model}) back to Available stock. Please confirm below:`,
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
          },
          { ...prevContext, lastMatchedTag: unit.tag, lastIntent: 'return' }
        );
      }
    }

    // 10. Action Preview: Status Update to Under Maintenance
    const isStatusUpdateIntent =
      !isQueryQuestion &&
      (/\b(mark|set|put|move|change|update)\b/i.test(textLower) || Boolean(matchedItem)) &&
      /\b(maintenance|under maintenance)\b/i.test(textLower);

    if (isStatusUpdateIntent) {
      const unit = matchedItem || items[0];
      const targetStatus = /\bavailable\b/i.test(textLower) ? 'Available' : 'Under Maintenance';

      if (unit) {
        return respond(
          {
            text: `Prepared status change for **${unit.tag}** to ${targetStatus}. Please confirm below:`,
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
              changes: [{ field: 'Status', from: unit.status, to: targetStatus }],
              requires_confirmation: true,
              confirmation_token: `candela-token-${Date.now()}`,
              expires_at: new Date(Date.now() + 300000).toISOString(),
            },
          },
          { ...prevContext, lastMatchedTag: unit.tag, lastIntent: 'status_update' }
        );
      }
    }

    // 11. Action Preview: Radio Configuration Update (dynamic chipsets from DB)
    if (/\b(update|set|add|configure|change)\b.*\b(radio|radios|chipset)\b/i.test(textLower)) {
      const unit = (matchedItem && matchedItem.category === 'lanforge' ? matchedItem : items.find((i) => i.category === 'lanforge')) || items[0];
      const matchedChipset = knownChipsets.find((cs) => textLower.includes(cs.toLowerCase()) || cs.toLowerCase().split(/\s+/).some((p) => p.length >= 4 && textLower.includes(p)));
      const chipset = matchedChipset || knownChipsets[0] || 'Intel BE200';

      const qtyMatch = textLower.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 2;

      if (unit) {
        return respond(
          {
            text: `Prepared radio configuration update for **${unit.tag}**. Please confirm below:`,
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
              changes: [{ field: `${chipset} Quantity`, from: 0, to: quantity }],
              requires_confirmation: true,
              confirmation_token: `candela-token-${Date.now()}`,
              expires_at: new Date(Date.now() + 300000).toISOString(),
            },
          },
          { ...prevContext, lastMatchedTag: unit.tag, lastIntent: 'radio_update' }
        );
      }
    }

    // 12. Specific Attribute Question for an Identified Unit (e.g. "What is its IP?", "Who has DT-01?")
    if (matchedItem && isQueryQuestion) {
      const asksIp = /\b(ip|ip address|testbed ip)\b/i.test(textLower);
      const asksRadios = /\b(radio|radios|chipset|chipsets)\b/i.test(textLower);
      const asksWho = /\b(who|custodian|assigned to|using|holder)\b/i.test(textLower);
      const asksWhere = /\b(where|location|lab|facility)\b/i.test(textLower);
      const asksProject = /\b(which project|what project|project)\b/i.test(textLower);
      const asksStatus = /\b(status|available|state)\b/i.test(textLower);

      if (asksIp || asksRadios || asksWho || asksWhere || asksProject || asksStatus) {
        let answer = '';
        if (asksIp) {
          answer = matchedItem.details?.ip
            ? `The testbed IP for **${matchedItem.tag}** is \`${matchedItem.details.ip}\`.`
            : `No IP address is recorded for **${matchedItem.tag}**.`;
        } else if (asksRadios) {
          answer = matchedItem.details?.radios
            ? `**${matchedItem.tag}** is configured with: ${matchedItem.details.radios}.`
            : `No radio interfaces are listed for **${matchedItem.tag}**.`;
        } else if (asksWho) {
          answer =
            matchedItem.custodian && matchedItem.custodian !== 'Unassigned'
              ? `**${matchedItem.tag}** is currently assigned to **${matchedItem.custodian}**.`
              : `**${matchedItem.tag}** is currently unassigned (${matchedItem.status}).`;
        } else if (asksWhere) {
          answer = `**${matchedItem.tag}** is located in **${matchedItem.location}**.`;
        } else if (asksProject) {
          answer = matchedItem.project
            ? `**${matchedItem.tag}** is assigned to project **${matchedItem.project}**.`
            : `**${matchedItem.tag}** has no active project assigned.`;
        } else {
          answer = `**${matchedItem.tag}** (${matchedItem.model}) is currently **${matchedItem.status}**${matchedItem.custodian && matchedItem.custodian !== 'Unassigned' ? `, assigned to ${matchedItem.custodian}` : ''}.`;
        }

        return respond(
          {
            text: answer,
            query_results: [formatResultItem(matchedItem)],
          },
          { ...prevContext, lastMatchedTag: matchedItem.tag, lastResultTags: [matchedItem.tag], lastIntent: 'unit_detail' }
        );
      }
    }

    // 13. Extract Filters for Queries + Apply Session Memory for Follow-ups
    const newFilters: ActiveFilters = {};

    if (/\b(available|free|unassigned|ready)\b/i.test(textLower)) {
      newFilters.status = 'Available';
    } else if (/\b(maintenance|under maintenance|repair|faulty)\b/i.test(textLower)) {
      newFilters.status = 'Under Maintenance';
    } else if (/\b(in[\s-]?use|occupied|allocated|busy)\b/i.test(textLower)) {
      newFilters.status = 'In-Use';
    }

    if (/\b(lanforge|lanforges|testbed|testbeds)\b/i.test(textLower)) {
      newFilters.category = 'lanforge';
    } else if (/\b(real devices?|client devices?)\b/i.test(textLower)) {
      newFilters.category = 'real-devices';
    } else if (/\b(desktop|desktops|workstation|workstations)\b/i.test(textLower)) {
      newFilters.category = 'desktop';
    } else if (/\b(mobile|mobiles|phone|phones|smartphone|smartphones)\b/i.test(textLower)) {
      newFilters.category = 'mobile';
    } else if (/\b(chamber|chambers|enclosure|enclosures)\b/i.test(textLower)) {
      newFilters.category = 'chamber';
    }

    const locMatch = knownLocations.find((l) => new RegExp(`\\b${escapeRegex(l)}\\b`, 'i').test(textLower));
    if (locMatch) newFilters.location = locMatch;

    const currentUserName = req.headers.get('x-user-name') || '';
    const isMyEquipment = /\b(my equipment|assigned to me|my units|my devices)\b/i.test(textLower);
    if (matchedProfile) {
      newFilters.custodian = matchedProfile.full_name;
    } else if (isMyEquipment && currentUserName) {
      newFilters.custodian = currentUserName;
    }

    const matchedProject = knownProjects.find((proj) => new RegExp(`\\b${escapeRegex(proj)}\\b`, 'i').test(textLower));
    if (matchedProject) newFilters.project = matchedProject;

    // Dynamic model/brand/chipset token extraction (skip tokens already matched as location/project/custodian)
    const matchedModelKw = knownModelTokens.find((tok) => {
      if (locMatch && tok === locMatch.toLowerCase()) return false;
      if (matchedProject && tok === matchedProject.toLowerCase()) return false;
      if (matchedProfile && matchedProfile.full_name.toLowerCase().includes(tok)) return false;
      return new RegExp(`\\b${escapeRegex(tok)}\\b`, 'i').test(textLower);
    });
    if (matchedModelKw && !matchedItem) {
      newFilters.modelKeyword = matchedModelKw;
    }

    const hasNewFilter = Object.keys(newFilters).length > 0;
    const isFollowUpRefinement =
      Boolean(prevContext.filters && Object.keys(prevContext.filters).length > 0) &&
      (/\b(only|just|those|them|these|what about|how about|now show|filter by|narrow|same for|and in|also in|show them|list them)\b/i.test(textLower) ||
        (hasNewFilter && textLower.split(/\s+/).length <= 5 && !/\b(all)\b/i.test(textLower)));

    const isShowPrevious =
      Boolean(prevContext.filters && Object.keys(prevContext.filters).length > 0) &&
      /^(show them|list them|show all of them|display them|which ones\??)$/i.test(textLower);

    let effectiveFilters: ActiveFilters = newFilters;
    if (isShowPrevious) {
      effectiveFilters = { ...(prevContext.filters || {}) };
    } else if (isFollowUpRefinement) {
      effectiveFilters = {
        ...(prevContext.filters || {}),
        ...newFilters,
      };
    }

    const hasAnyFilter = Object.values(effectiveFilters).some(Boolean);
    const isCountOnly = /\b(how many|count|total number)\b/i.test(textLower) && !/\b(show|list|display|which)\b/i.test(textLower);

    if (hasAnyFilter) {
      const filtered = applyFilters(items, effectiveFilters);
      const desc = describeFilters(effectiveFilters);

      if (isCountOnly) {
        return respond(
          {
            text: `There ${filtered.length === 1 ? 'is' : 'are'} **${filtered.length}** ${desc}.`,
            query_results: [],
          },
          {
            filters: effectiveFilters,
            lastResultTags: filtered.map((f) => f.tag),
            lastMatchedTag: filtered.length === 1 ? filtered[0].tag : null,
            lastMatchedCustodian: effectiveFilters.custodian || prevContext.lastMatchedCustodian || null,
            lastIntent: 'count_query',
          }
        );
      }

      if (filtered.length > 0) {
        return respond(
          {
            text: `Found **${filtered.length}** ${desc}:`,
            query_results: filtered.map(formatResultItem),
          },
          {
            filters: effectiveFilters,
            lastResultTags: filtered.map((f) => f.tag),
            lastMatchedTag: filtered.length === 1 ? filtered[0].tag : null,
            lastMatchedCustodian: effectiveFilters.custodian || prevContext.lastMatchedCustodian || null,
            lastIntent: 'filter_query',
          }
        );
      }

      return respond(
        {
          text: `No ${desc} matched in the live inventory.`,
          query_results: [],
        },
        {
          filters: effectiveFilters,
          lastResultTags: [],
          lastMatchedTag: null,
          lastIntent: 'filter_query_empty',
        }
      );
    }

    // 14. Specific Tag Lookup (e.g., "DT-01" or "Check LF-OPEL-523C-01")
    if (matchedItem) {
      return respond(
        {
          text: `**${matchedItem.tag}** (${matchedItem.model}) — ${matchedItem.status}, located in ${matchedItem.location}${matchedItem.custodian && matchedItem.custodian !== 'Unassigned' ? `, assigned to ${matchedItem.custodian}` : ''}.`,
          query_results: [formatResultItem(matchedItem)],
        },
        {
          ...prevContext,
          lastMatchedTag: matchedItem.tag,
          lastResultTags: [matchedItem.tag],
          lastIntent: 'tag_lookup',
        }
      );
    }

    // 15. Clean clarification if query didn't match any filter or entity
    return respond(
      {
        text:
          'I could not match a specific filter, unit tag, or action from that message. Try asking about availability, a category (LANforges, Real Devices, Chambers), a lab location, a team member, or a unit tag.',
        query_results: [],
      },
      { ...prevContext, lastIntent: 'clarify' }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal assistant processing error.' }, { status: 500 });
  }
}
