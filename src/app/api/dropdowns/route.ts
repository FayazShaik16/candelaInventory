import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('inventory_dropdown_settings')
      .select('*')
      .order('category')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format for frontend
    const formatted = (data || []).map((item) => ({
      id: item.id,
      category: item.category,
      label: item.label,
      value: item.value,
      isActive: item.is_active,
      isSystemDefault: item.is_system_default,
      description: item.description,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({ items: formatted });
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
    const { id, category, label, value, isActive, description, isSystemDefault } = body;

    if (!category || !label || !value) {
      return NextResponse.json({ error: 'category, label and value are required' }, { status: 400 });
    }

    // If updating an existing item by id
    if (id) {
      const { data: existing } = await supabase
        .from('inventory_dropdown_settings')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateError } = await supabase
          .from('inventory_dropdown_settings')
          .update({
            category,
            label: label.trim(),
            value: value.trim(),
            is_active: isActive !== undefined ? isActive : true,
            is_system_default: isSystemDefault !== undefined ? isSystemDefault : false,
            description: description?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, item: updated });
      }
    }

    // Insert new dropdown option
    const itemId = id || `dd-${category}-${Date.now()}`;
    const { data, error } = await supabase
      .from('inventory_dropdown_settings')
      .insert({
        id: itemId,
        category,
        label: label.trim(),
        value: value.trim(),
        is_active: isActive !== undefined ? isActive : true,
        is_system_default: isSystemDefault !== undefined ? isSystemDefault : false,
        description: description?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('inventory_dropdown_settings')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
