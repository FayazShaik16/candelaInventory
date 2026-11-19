import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const [
      { data: lfList, error: lfErr },
      { data: dtList, error: dtErr },
      { data: mbList, error: mbErr },
      { data: chList, error: chErr },
      { data: asgnList, error: asgnErr },
      { data: logList, error: logErr },
    ] = await Promise.all([
      supabase.from('lanforges').select('*, lanforge_radios(*)').order('s_no', { ascending: true }),
      supabase.from('desktops').select('*').order('s_no', { ascending: true }),
      supabase.from('mobiles').select('*').order('s_no', { ascending: true }),
      supabase.from('chambers').select('*').order('s_no', { ascending: true }),
      supabase.from('inventory_assignments').select('*, profiles:employee_id(full_name, email), assigner:assigned_by(full_name)').order('assigned_at', { ascending: false }),
      supabase.from('inventory_activity_logs').select('*, profiles:performed_by(full_name, role)').order('created_at', { ascending: false }),
    ]);

    if (lfErr || dtErr || mbErr || chErr) {
      const err = lfErr || dtErr || mbErr || chErr;
      return NextResponse.json({ error: err?.message }, { status: 500 });
    }

    const lanforges = (lfList || []).map((l: any) => {
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
        radios: (l.lanforge_radios || []).map((r: any) => ({
          id: r.id,
          lanforgeRef: r.lanforge_ref,
          chipset: r.chipset,
          quantity: r.quantity,
        })),
        isArchived: l.is_archived,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      };
    });

    const desktops = (dtList || []).map((d: any) => ({
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
      updatedAt: d.updated_at,
    }));

    const mobiles = (mbList || []).map((m: any) => ({
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
      updatedAt: m.updated_at,
    }));

    const chambers = (chList || []).map((c: any) => ({
      id: c.id,
      sNo: c.s_no,
      chamberType: c.chamber_type,
      chamberId: c.chamber_id,
      usedById: c.used_by_id,
      project: c.project,
      status: c.status,
      isArchived: c.is_archived,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    const assignments = (asgnList || []).map((a: any) => ({
      id: a.id,
      equipmentCategory: a.inventory_type,
      equipmentId: a.inventory_id,
      equipmentTag: a.inventory_tag,
      employeeId: a.employee_id,
      employeeName: a.profiles?.full_name || 'Assigned Custodian',
      employeeEmail: a.profiles?.email || '',
      assignedDate: a.assigned_at,
      returnDate: a.returned_at,
      assignedBy: a.assigner?.full_name || 'Admin Supervisor',
      notes: a.notes || '',
      status: a.assignment_status,
    }));

    const activityLogs = (logList || []).map((l: any) => ({
      id: l.id,
      timestamp: l.created_at,
      unitAssetTag: l.inventory_tag || 'DATABASE',
      inventoryCategory: l.inventory_type || 'lanforge',
      inventoryId: l.inventory_id,
      action: l.action_type,
      title: `Inventory Event: ${l.action_type}`,
      description: l.description,
      performedBy: l.profiles?.full_name || 'Admin Supervisor',
      user: {
        name: l.profiles?.full_name || 'Admin Supervisor',
        role: l.profiles?.role === 'admin' ? 'Operations Lead' : 'Engineer',
      },
    }));

    return NextResponse.json({
      lanforges,
      desktops,
      mobiles,
      chambers,
      assignments,
      activityLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'addLANforge': {
        const { radios, location, testbedIp, comments, ...rest } = payload;
        const dbLoc = location === 'PRIMA' ? 'VINSR' : location;
        const dbComments = location === 'PRIMA'
          ? `[Location: PRIMA] ${comments || ''}`.trim()
          : (comments || null);

        const { data: lf, error } = await supabase
          .from('lanforges')
          .insert({
            ...rest,
            location: dbLoc,
            testbed_ip: testbedIp?.trim() || '0.0.0.0',
            comments: dbComments,
            lanforge_id: rest.lanforgeId,
            lanforge_model: rest.lanforgeModel,
            max_ethernet_speed: rest.maxEthernetSpeed,
            total_clients: rest.totalClients || 0,
            no_of_11be_clients: rest.noOf11beClients || 0,
            no_of_11ax_clients: rest.noOf11axClients || 0,
            no_of_11ac_clients: rest.noOf11acClients || 0,
            no_of_11n_clients: rest.noOf11nClients || 0,
            poc_id: rest.pocId || null,
          })
          .select()
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (Array.isArray(radios) && radios.length > 0) {
          const radioRows = radios.map((r: any) => ({
            lanforge_ref: lf.id,
            chipset: r.chipset,
            quantity: r.quantity || 1,
          }));
          await supabase.from('lanforge_radios').insert(radioRows);
        }

        return NextResponse.json({ success: true, item: lf });
      }

      case 'updateLANforge': {
        const { id, updates, radios } = payload;
        const updateData: any = {};
        if (updates.location) {
          updateData.location = updates.location === 'PRIMA' ? 'VINSR' : updates.location;
          if (updates.location === 'PRIMA') {
            updateData.comments = `[Location: PRIMA] ${updates.comments || ''}`.trim();
          }
        }
        if (updates.testbedIp !== undefined) updateData.testbed_ip = updates.testbedIp || '0.0.0.0';
        if (updates.project !== undefined) updateData.project = updates.project;
        if (updates.pocId !== undefined) updateData.poc_id = updates.pocId || null;
        if (updates.lanforgeId !== undefined) updateData.lanforge_id = updates.lanforgeId;
        if (updates.lanforgeModel !== undefined) updateData.lanforge_model = updates.lanforgeModel;
        if (updates.maxEthernetSpeed !== undefined) updateData.max_ethernet_speed = updates.maxEthernetSpeed;
        if (updates.totalClients !== undefined) updateData.total_clients = updates.totalClients;
        if (updates.noOf11beClients !== undefined) updateData.no_of_11be_clients = updates.noOf11beClients;
        if (updates.noOf11axClients !== undefined) updateData.no_of_11ax_clients = updates.noOf11axClients;
        if (updates.noOf11acClients !== undefined) updateData.no_of_11ac_clients = updates.noOf11acClients;
        if (updates.noOf11nClients !== undefined) updateData.no_of_11n_clients = updates.noOf11nClients;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.comments !== undefined && !updates.comments.includes('[Location: PRIMA]')) {
          updateData.comments = updates.comments;
        }

        const { error } = await supabase.from('lanforges').update(updateData).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        if (radios) {
          await supabase.from('lanforge_radios').delete().eq('lanforge_ref', id);
          if (radios.length > 0) {
            const radioRows = radios.map((r: any) => ({
              lanforge_ref: id,
              chipset: r.chipset,
              quantity: r.quantity || 1,
            }));
            await supabase.from('lanforge_radios').insert(radioRows);
          }
        }
        return NextResponse.json({ success: true });
      }

      case 'archiveLANforge': {
        const { id } = payload;
        const { error } = await supabase.from('lanforges').update({ is_archived: true }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'addDesktop': {
        const { deviceId, deviceBrand, model, project, pocId, status } = payload;
        const { data, error } = await supabase.from('desktops').insert({
          device_id: deviceId,
          device_brand: deviceBrand,
          model,
          project,
          poc_id: pocId || null,
          status: status || 'Available',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, item: data });
      }

      case 'updateDesktop': {
        const { id, updates } = payload;
        const mapUpdates: any = {};
        if (updates.deviceId !== undefined) mapUpdates.device_id = updates.deviceId;
        if (updates.deviceBrand !== undefined) mapUpdates.device_brand = updates.deviceBrand;
        if (updates.model !== undefined) mapUpdates.model = updates.model;
        if (updates.project !== undefined) mapUpdates.project = updates.project;
        if (updates.pocId !== undefined) mapUpdates.poc_id = updates.pocId || null;
        if (updates.status !== undefined) mapUpdates.status = updates.status;
        const { error } = await supabase.from('desktops').update(mapUpdates).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'archiveDesktop': {
        const { id } = payload;
        const { error } = await supabase.from('desktops').update({ is_archived: true }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'addMobile': {
        const { deviceId, deviceBrand, model, project, pocId, status } = payload;
        const { data, error } = await supabase.from('mobiles').insert({
          device_id: deviceId,
          device_brand: deviceBrand,
          model,
          project,
          poc_id: pocId || null,
          status: status || 'Available',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, item: data });
      }

      case 'updateMobile': {
        const { id, updates } = payload;
        const mapUpdates: any = {};
        if (updates.deviceId !== undefined) mapUpdates.device_id = updates.deviceId;
        if (updates.deviceBrand !== undefined) mapUpdates.device_brand = updates.deviceBrand;
        if (updates.model !== undefined) mapUpdates.model = updates.model;
        if (updates.project !== undefined) mapUpdates.project = updates.project;
        if (updates.pocId !== undefined) mapUpdates.poc_id = updates.pocId || null;
        if (updates.status !== undefined) mapUpdates.status = updates.status;
        const { error } = await supabase.from('mobiles').update(mapUpdates).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'archiveMobile': {
        const { id } = payload;
        const { error } = await supabase.from('mobiles').update({ is_archived: true }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'addChamber': {
        const { chamberType, chamberId, usedById, project, status } = payload;
        const { data, error } = await supabase.from('chambers').insert({
          chamber_type: chamberType,
          chamber_id: chamberId,
          used_by_id: usedById || null,
          project,
          status: status || 'Available',
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, item: data });
      }

      case 'updateChamber': {
        const { id, updates } = payload;
        const mapUpdates: any = {};
        if (updates.chamberType !== undefined) mapUpdates.chamber_type = updates.chamberType;
        if (updates.chamberId !== undefined) mapUpdates.chamber_id = updates.chamberId;
        if (updates.usedById !== undefined) mapUpdates.used_by_id = updates.usedById || null;
        if (updates.project !== undefined) mapUpdates.project = updates.project;
        if (updates.status !== undefined) mapUpdates.status = updates.status;
        const { error } = await supabase.from('chambers').update(mapUpdates).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'archiveChamber': {
        const { id } = payload;
        const { error } = await supabase.from('chambers').update({ is_archived: true }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'assignEquipment': {
        const { category, equipmentId, employeeId, notes, tag } = payload;
        // Update asset
        const table = category === 'lanforge' ? 'lanforges' : category === 'desktop' ? 'desktops' : category === 'mobile' ? 'mobiles' : 'chambers';
        const col = category === 'chamber' ? 'used_by_id' : 'poc_id';
        await supabase.from(table).update({ status: 'In-Use', [col]: employeeId }).eq('id', equipmentId);

        // Insert assignment
        await supabase.from('inventory_assignments').insert({
          inventory_type: category,
          inventory_id: equipmentId,
          inventory_tag: tag || equipmentId,
          employee_id: employeeId,
          assignment_status: 'active',
          notes: notes || null,
        });

        // Insert activity log
        await supabase.from('inventory_activity_logs').insert({
          inventory_type: category,
          inventory_id: equipmentId,
          inventory_tag: tag,
          action_type: 'assigned',
          performed_by: employeeId,
          description: `Assigned ${category} ${tag || equipmentId} to custodian.`,
        });

        return NextResponse.json({ success: true });
      }

      case 'returnEquipment': {
        const { category, equipmentId, returnDate, notes, markUnderMaintenance } = payload;
        const table = category === 'lanforge' ? 'lanforges' : category === 'desktop' ? 'desktops' : category === 'mobile' ? 'mobiles' : 'chambers';
        const col = category === 'chamber' ? 'used_by_id' : 'poc_id';
        const targetStatus = markUnderMaintenance ? 'Under Maintenance' : 'Available';

        await supabase.from(table).update({ status: targetStatus, [col]: null }).eq('id', equipmentId);

        // Close assignment
        await supabase.from('inventory_assignments')
          .update({
            assignment_status: 'returned',
            returned_at: returnDate || new Date().toISOString(),
            notes: notes ? `Return notes: ${notes}` : null,
          })
          .eq('inventory_id', equipmentId)
          .eq('assignment_status', 'active');

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
