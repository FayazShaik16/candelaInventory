import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_REQUESTS } from '@/data/mockRequests';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ requests: INITIAL_REQUESTS });
    }

    const { data, error } = await supabase
      .from('inventory_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to initial requests if table is not yet migrated in Supabase
      return NextResponse.json({ requests: INITIAL_REQUESTS });
    }

    // Map database snake_case to frontend camelCase
    const formatted = data.map((r: any) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeEmail: r.employee_email,
      resourceCategory: r.resource_category,
      resourceLabel: r.resource_label,
      targetSpecs: r.target_specs,
      preferredAssetId: r.preferred_asset_id,
      preferredAssetTag: r.preferred_asset_tag,
      project: r.project,
      purpose: r.purpose,
      priority: r.priority || 'Standard',
      duration: r.duration || '2 Weeks',
      status: r.status || 'pending',
      assignedAssetId: r.assigned_asset_id,
      assignedAssetTag: r.assigned_asset_tag,
      assignedCategory: r.assigned_category,
      adminNotes: r.admin_notes,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ requests: formatted });
  } catch (err: any) {
    return NextResponse.json({ requests: INITIAL_REQUESTS, error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, request, requestId, status, adminNotes, assignedAssetId, assignedAssetTag, assignedCategory, reviewedBy } = body;

    const supabase = createAdminClient();

    if (supabase) {
      if (action === 'create' && request) {
        // Try insert into Supabase if table exists
        try {
          await supabase.from('inventory_requests').insert({
            id: request.id,
            employee_id: request.employeeId,
            employee_name: request.employeeName,
            employee_email: request.employeeEmail,
            resource_category: request.resourceCategory,
            resource_label: request.resourceLabel,
            target_specs: request.targetSpecs || null,
            preferred_asset_id: request.preferredAssetId || null,
            preferred_asset_tag: request.preferredAssetTag || null,
            project: request.project,
            purpose: request.purpose,
            priority: request.priority || 'Standard',
            duration: request.duration || '2 Weeks',
            status: 'pending',
            admin_notes: request.adminNotes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch {}
      } else if (action === 'updateStatus' && requestId) {
        try {
          await supabase.from('inventory_requests').update({
            status,
            admin_notes: adminNotes || null,
            assigned_asset_id: assignedAssetId || null,
            assigned_asset_tag: assignedAssetTag || null,
            assigned_category: assignedCategory || null,
            reviewed_by: reviewedBy || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', requestId);
        } catch {}
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
