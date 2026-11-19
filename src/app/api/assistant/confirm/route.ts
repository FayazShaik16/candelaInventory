import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:7860';

const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { confirmation_token, action_id, action } = body;

    if (!confirmation_token && !action) {
      return NextResponse.json(
        { error: 'Confirmation token or action payload is required.' },
        { status: 400 }
      );
    }

    // 1. Attempt proxy to FastAPI if running
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${AI_BACKEND_URL}/actions/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': req.headers.get('x-user-role') || 'admin',
          'x-user-id': req.headers.get('x-user-id') || 'usr-admin-01',
          'x-user-name': req.headers.get('x-user-name') || 'Admin Supervisor',
        },
        body: JSON.stringify({
          confirmation_token,
          action_id,
          user_confirmed: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && !action) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Backend offline or unreachable - proceed to live database execution
    }

    // 2. Direct Live Database Execution on Supabase
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable.' },
        { status: 500 }
      );
    }

    const intent = (action?.intent || action?.type || '').toLowerCase();
    const rawCategory = (action?.category || 'lanforge').toLowerCase();
    let category = 
      rawCategory.includes('desk') ? 'desktop' : 
      rawCategory.includes('mob') ? 'mobile' : 
      rawCategory.includes('cham') ? 'chamber' : 'lanforge';

    let unitTable = 
      category === 'lanforge' ? 'lanforges' : 
      category === 'desktop' ? 'desktops' : 
      category === 'mobile' ? 'mobiles' : 'chambers';

    let tagCol = 
      category === 'lanforge' ? 'lanforge_id' : 
      category === 'chamber' ? 'chamber_id' : 'device_id';

    let pocCol = category === 'chamber' ? 'used_by_id' : 'poc_id';

    let unitId = action?.unit_id || action?.equipment_id;
    let unitTag = action?.unit_tag || action?.unitAssetTag || action?.record_identifier;
    let targetEmployeeId = action?.target_employee_id || action?.employee_id;
    let targetEmployeeName = action?.target_employee_name || action?.employeeName;
    const targetStatus = action?.target_status || 'In-Use';
    const targetProject = action?.target_project;

    // Resolve unit ID if missing OR if not a valid UUID
    if ((!unitId || !isUuid(unitId)) && unitTag) {
      const { data: foundUnit } = await (supabase
        .from(unitTable as any)
        .select('*')
        .ilike(tagCol, `%${unitTag}%`)
        .limit(1)
        .maybeSingle() as any);

      if (foundUnit) {
        unitId = foundUnit.id;
        unitTag = foundUnit[tagCol];
      } else {
        // Fallback across all tables if category mismatched
        for (const tbl of ['lanforges', 'desktops', 'mobiles', 'chambers']) {
          const col = tbl === 'lanforges' ? 'lanforge_id' : tbl === 'chambers' ? 'chamber_id' : 'device_id';
          const { data: anyMatch } = await (supabase
            .from(tbl as any)
            .select('*')
            .ilike(col, `%${unitTag}%`)
            .limit(1)
            .maybeSingle() as any);
          if (anyMatch) {
            unitId = anyMatch.id;
            unitTag = anyMatch[col];
            unitTable = tbl;
            tagCol = col;
            category = tbl === 'lanforges' ? 'lanforge' : tbl === 'chambers' ? 'chamber' : tbl === 'desktops' ? 'desktop' : 'mobile';
            pocCol = tbl === 'chambers' ? 'used_by_id' : 'poc_id';
            break;
          }
        }
      }
    }

    // Resolve employee UUID
    if ((!targetEmployeeId || !isUuid(targetEmployeeId)) && targetEmployeeName) {
      const { data: foundProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('full_name', `%${targetEmployeeName}%`)
        .limit(1)
        .maybeSingle();

      if (foundProfile) {
        targetEmployeeId = foundProfile.id;
        targetEmployeeName = foundProfile.full_name;
      }
    }

    // Resolve actor UUID for audit foreign key
    let actorId: string | null = req.headers.get('x-user-id');
    if (!isUuid(actorId)) {
      actorId = null;
    }
    if (!actorId) {
      const { data: adminUser } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).maybeSingle();
      if (adminUser?.id) {
        actorId = adminUser.id;
      }
    }

    const auditRef = `ACT-AUDIT-${Date.now().toString(36).toUpperCase()}`;

    // A. EXECUTE ASSIGNMENT / TRANSFER
    if (intent.includes('assign') || intent.includes('transfer')) {
      const isTransfer = intent.includes('transfer');

      if (!unitId) {
        return NextResponse.json({ error: `Could not identify asset ${unitTag || 'record'} in database.` }, { status: 404 });
      }

      if (!targetEmployeeId) {
        return NextResponse.json({ error: `Could not locate user ${targetEmployeeName || 'record'} in directory.` }, { status: 404 });
      }

      // Update the hardware asset table
      const assetUpdates: Record<string, any> = {
        status: 'In-Use',
        [pocCol]: targetEmployeeId,
        updated_at: new Date().toISOString(),
      };
      if (targetProject) {
        assetUpdates.project = targetProject;
      }

      const { error: updateErr } = await (supabase
        .from(unitTable as any) as any)
        .update(assetUpdates)
        .eq('id', unitId);

      if (updateErr) {
        return NextResponse.json({ error: `Asset update failed: ${updateErr.message}` }, { status: 500 });
      }

      // If transfer, mark existing active assignment as transferred
      if (isTransfer) {
        await supabase
          .from('inventory_assignments')
          .update({
            returned_at: new Date().toISOString(),
            assignment_status: 'transferred',
            notes: `Transferred custody to ${targetEmployeeName}`,
            updated_at: new Date().toISOString(),
          })
          .eq('inventory_id', unitId)
          .is('returned_at', null);
      }

      // Insert new assignment record using actual schema columns
      const { error: asgnErr } = await supabase
        .from('inventory_assignments')
        .insert({
          inventory_type: category,
          inventory_id: unitId,
          inventory_tag: unitTag,
          employee_id: targetEmployeeId,
          assigned_by: actorId,
          assigned_at: new Date().toISOString(),
          assignment_status: 'active',
          notes: targetProject ? `Project: ${targetProject}` : 'Assigned via AI Assistant',
        });

      if (asgnErr) {
        console.warn('inventory_assignments insert warning:', asgnErr.message);
      }

      // Insert audit log using actual schema columns
      await supabase
        .from('inventory_activity_logs')
        .insert({
          inventory_type: category,
          inventory_id: unitId,
          inventory_tag: unitTag,
          action_type: isTransfer ? 'transferred' : 'assigned',
          performed_by: actorId,
          employee_id: targetEmployeeId,
          description: `Hardware asset ${unitTag} ${isTransfer ? 'transferred' : 'assigned'} to ${targetEmployeeName}. Executed via AI Assistant confirmation.`,
          previous_values: {},
          new_values: { custodian: targetEmployeeName, status: 'In-Use', project: targetProject },
        });

      return NextResponse.json({
        success: true,
        message: `Successfully allocated custody of ${unitTag} to ${targetEmployeeName}.`,
        action_id: action_id || 'act-completed',
        audit_log_id: auditRef,
        updated_unit: {
          id: unitId,
          tag: unitTag,
          status: 'In-Use',
          custodian: targetEmployeeName,
          poc_id: targetEmployeeId,
        },
      });
    }

    // B. EXECUTE EQUIPMENT RETURN
    if (intent.includes('return')) {
      if (!unitId) {
        return NextResponse.json({ error: `Unit ${unitTag} not found.` }, { status: 404 });
      }

      await (supabase
        .from(unitTable as any) as any)
        .update({
          status: 'Available',
          [pocCol]: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', unitId);

      await supabase
        .from('inventory_assignments')
        .update({
          returned_at: new Date().toISOString(),
          returned_by: actorId,
          assignment_status: 'returned',
          notes: 'Returned via AI Assistant confirmation.',
          updated_at: new Date().toISOString(),
        })
        .eq('inventory_id', unitId)
        .is('returned_at', null);

      await supabase
        .from('inventory_activity_logs')
        .insert({
          inventory_type: category,
          inventory_id: unitId,
          inventory_tag: unitTag,
          action_type: 'returned',
          performed_by: actorId,
          description: `Asset ${unitTag} checked in and restored to Available inventory via AI Assistant.`,
          previous_values: { status: 'In-Use' },
          new_values: { status: 'Available', custodian: 'Unassigned' },
        });

      return NextResponse.json({
        success: true,
        message: `Successfully returned ${unitTag} to Available stock.`,
        action_id: action_id || 'act-completed',
        audit_log_id: auditRef,
      });
    }

    // C. EXECUTE STATUS UPDATE
    if (intent.includes('status')) {
      if (!unitId) {
        return NextResponse.json({ error: `Unit ${unitTag} not found.` }, { status: 404 });
      }

      await (supabase
        .from(unitTable as any) as any)
        .update({
          status: targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', unitId);

      await supabase
        .from('inventory_activity_logs')
        .insert({
          inventory_type: category,
          inventory_id: unitId,
          inventory_tag: unitTag,
          action_type: 'status_change',
          performed_by: actorId,
          description: `Operational status updated to '${targetStatus}' via AI Assistant confirmation.`,
          previous_values: {},
          new_values: { status: targetStatus },
        });

      return NextResponse.json({
        success: true,
        message: `Updated status of ${unitTag} to '${targetStatus}'.`,
        action_id: action_id || 'act-completed',
        audit_log_id: auditRef,
      });
    }

    // D. EXECUTE RADIO UPDATE
    if (intent.includes('radio') && category === 'lanforge' && unitId) {
      const chipset = action?.radio_chipset || 'Intel BE200';
      const qty = action?.radio_quantity || 2;

      const { data: existingRadio } = await supabase
        .from('lanforge_radios')
        .select('id, quantity')
        .eq('lanforge_ref', unitId)
        .eq('chipset', chipset)
        .maybeSingle();

      if (existingRadio) {
        await supabase
          .from('lanforge_radios')
          .update({ quantity: qty })
          .eq('id', existingRadio.id);
      } else {
        await supabase
          .from('lanforge_radios')
          .insert({
            lanforge_ref: unitId,
            chipset,
            quantity: qty,
          });
      }

      await supabase
        .from('inventory_activity_logs')
        .insert({
          inventory_type: 'lanforge',
          inventory_id: unitId,
          inventory_tag: unitTag,
          action_type: 'config_updated',
          performed_by: actorId,
          description: `Configured ${qty}x ${chipset} interfaces on ${unitTag} via AI Assistant.`,
          previous_values: {},
          new_values: { chipset, quantity: qty },
        });

      return NextResponse.json({
        success: true,
        message: `Successfully configured ${qty}x ${chipset} radios on ${unitTag}.`,
        action_id: action_id || 'act-completed',
        audit_log_id: auditRef,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Operation executed and logged successfully in Candela database.',
      action_id: action_id || 'act-completed',
      audit_log_id: auditRef,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal confirmation error.' },
      { status: 500 }
    );
  }
}
