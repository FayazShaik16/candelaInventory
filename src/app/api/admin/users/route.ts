import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { CreateUserDTO, UserProfile } from '@/types/auth';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('candela_session')?.value;
    const sessionRole = cookieStore.get('candela_role')?.value;
    const sessionStatus = cookieStore.get('candela_status')?.value;

    // 1. Verify caller has admin privileges
    let isAdmin = false;
    let creatorId: string | null = null;

    // Verify via Supabase server client if active
    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, account_status')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin' && profile?.account_status === 'active') {
          isAdmin = true;
          creatorId = user.id;
        }
      }
    } else {
      // Fallback session verification
      if (sessionRole === 'admin' && sessionStatus === 'active') {
        isAdmin = true;
        creatorId = sessionToken || 'usr-admin-01';
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only active administrators can create accounts.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body: CreateUserDTO = await req.json();
    const { full_name, email, role, account_status, temporaryPassword } = body;

    if (!full_name || !email || !role) {
      return NextResponse.json(
        { error: 'Bad Request: full_name, email and role are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. If Supabase Admin Client is configured:
    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient()!;

      // Check duplicate
      const { data: existingUser } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: `Account with email ${normalizedEmail} already exists.` },
          { status: 409 }
        );
      }

      // Generate secure temporary password or invite
      const securePassword = temporaryPassword || `Candela#${Math.random().toString(36).slice(2, 10)}!`;

      // Create Supabase Auth User
      const { data: newAuth, error: authError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          role,
        },
      });

      if (authError || !newAuth.user) {
        return NextResponse.json(
          { error: authError?.message || 'Failed to create authentication credentials.' },
          { status: 500 }
        );
      }

      // Upsert profile record
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: newAuth.user.id,
          full_name: full_name.trim(),
          email: normalizedEmail,
          role,
          account_status: account_status || 'active',
          created_by: creatorId,
        })
        .select()
        .single();

      if (profileError) {
        // Compensating transaction: remove created auth user to avoid orphaned records
        await adminClient.auth.admin.deleteUser(newAuth.user.id);
        return NextResponse.json(
          { error: 'Failed to create employee profile. Auth user creation rolled back.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: profileData,
        message: 'Account successfully provisioned in Supabase.',
      });
    }

    // 4. Fallback response for mock runtime
    const mockUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: full_name.trim(),
      email: normalizedEmail,
      role,
      account_status: account_status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: creatorId,
      last_sign_in_at: null,
    };

    return NextResponse.json({
      success: true,
      user: mockUser,
      message: 'Account successfully registered.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('candela_session')?.value;
    const sessionRole = cookieStore.get('candela_role')?.value;
    const sessionStatus = cookieStore.get('candela_status')?.value;

    // 1. Verify caller has admin privileges
    let isAdmin = false;
    let callerAdminId: string | null = null;

    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, account_status')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin' && profile?.account_status === 'active') {
          isAdmin = true;
          callerAdminId = user.id;
        }
      }
    } else {
      if (sessionRole === 'admin' && sessionStatus === 'active') {
        isAdmin = true;
        callerAdminId = sessionToken || 'usr-admin-01';
      }
    }

    // Fallback: If session cookie candela_role is admin, permit caller
    if (!isAdmin && sessionRole === 'admin') {
      isAdmin = true;
      callerAdminId = sessionToken || 'usr-admin-01';
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only active administrators can delete user accounts.' },
        { status: 403 }
      );
    }

    // 2. Extract target user ID
    let targetUserId = req.nextUrl.searchParams.get('id');
    if (!targetUserId) {
      try {
        const body = await req.json();
        targetUserId = body?.id;
      } catch {}
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Bad Request: Target user ID (id) is required.' },
        { status: 400 }
      );
    }

    // 3. Security check: Admin cannot delete themselves
    if (targetUserId === callerAdminId) {
      return NextResponse.json(
        { error: 'Protection: You cannot delete your own administrative account.' },
        { status: 400 }
      );
    }

    // 4. Supabase DB & Auth deletion if configured
    if (isSupabaseAdminConfigured()) {
      const adminClient = createAdminClient()!;

      // Check for active equipment assignments
      try {
        const { data: activeAssignments } = await adminClient
          .from('inventory_assignments')
          .select('id, inventory_tag')
          .eq('employee_id', targetUserId)
          .eq('assignment_status', 'active');

        if (activeAssignments && activeAssignments.length > 0) {
          const tags = activeAssignments.map((a: { inventory_tag: string }) => a.inventory_tag).join(', ');
          return NextResponse.json(
            {
              error: `Cannot delete user: Active equipment assignment(s) found (${tags}). Please check in or reassign equipment first.`,
            },
            { status: 400 }
          );
        }
      } catch (checkErr) {
        console.warn('Could not check assignments before deletion:', checkErr);
      }

      // Clean up audit logs & historical relations to prevent foreign key errors
      try {
        await adminClient
          .from('inventory_activity_logs')
          .update({ employee_id: null })
          .eq('employee_id', targetUserId);

        if (callerAdminId) {
          await adminClient
            .from('inventory_activity_logs')
            .update({ performed_by: callerAdminId })
            .eq('performed_by', targetUserId);
        }

        await adminClient
          .from('inventory_assignments')
          .delete()
          .eq('employee_id', targetUserId);

        await adminClient
          .from('equipment_requests')
          .delete()
          .eq('employee_id', targetUserId);

        // Nullify POC or used_by references on hardware assets
        await adminClient.from('chambers').update({ poc_id: null }).eq('poc_id', targetUserId);
        await adminClient.from('desktops').update({ poc_id: null }).eq('poc_id', targetUserId);
        await adminClient.from('lanforges').update({ poc_id: null }).eq('poc_id', targetUserId);
        await adminClient.from('mobiles').update({ used_by_id: null }).eq('used_by_id', targetUserId);
      } catch (cleanupErr) {
        console.warn('Reference cleanup error before user deletion:', cleanupErr);
      }

      // Delete from profiles table
      const { error: profileDeleteError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', targetUserId);

      if (profileDeleteError) {
        return NextResponse.json(
          { error: profileDeleteError.message || 'Failed to delete user profile from database.' },
          { status: 500 }
        );
      }

      // Delete from Supabase Auth service
      try {
        await adminClient.auth.admin.deleteUser(targetUserId);
      } catch (authDeleteErr) {
        console.warn('Auth user deletion warning (profile deleted):', authDeleteErr);
      }

      return NextResponse.json({
        success: true,
        message: 'User account and profile permanently deleted.',
      });
    }

    // 5. Fallback response for mock runtime
    return NextResponse.json({
      success: true,
      message: 'User account successfully deleted.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
