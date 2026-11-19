-- ==============================================================================
-- CANDELA INVENTORY MANAGEMENT PLATFORM — PHASE 4
-- Supabase PostgreSQL Schema: Equipment Assignment, Employee Tracking & Activity History
-- ==============================================================================

-- 1. Standardized Assignment Status Enum
do $$ begin
  create type public.assignment_status_enum as enum ('active', 'returned', 'transferred');
exception
  when duplicate_object then null;
end $$;

-- 2. Standardized Inventory Type Enum
do $$ begin
  create type public.inventory_type_enum as enum ('lanforge', 'desktop', 'mobile', 'chamber');
exception
  when duplicate_object then null;
end $$;

-- 3. Standardized Audit Action Type Enum
do $$ begin
  create type public.audit_action_enum as enum (
    'created',
    'modified',
    'assigned',
    'returned',
    'transferred',
    'status_change',
    'archived',
    'account_created',
    'account_modified',
    'account_status_change'
  );
exception
  when duplicate_object then null;
end $$;

-- ==============================================================================
-- 4. INVENTORY ASSIGNMENTS TABLE
-- ==============================================================================
create table if not exists public.inventory_assignments (
  id uuid primary key default gen_random_uuid(),
  inventory_type public.inventory_type_enum not null,
  inventory_id uuid not null,
  inventory_tag text not null,
  employee_id uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  assigned_by uuid references public.profiles(id) on delete set null,
  returned_by uuid references public.profiles(id) on delete set null,
  assignment_status public.assignment_status_enum not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraint: If returned or transferred, returned_at must be populated
  constraint check_returned_at check (
    (assignment_status = 'active' and returned_at is null) or
    (assignment_status in ('returned', 'transferred') and returned_at is not null)
  )
);

-- Crucial Database-Level Constraint: Prevent Duplicate Active Assignments for same asset!
create unique index if not exists idx_unique_active_assignment 
  on public.inventory_assignments(inventory_type, inventory_id) 
  where assignment_status = 'active';

-- Performance Indexes
create index if not exists idx_inv_assign_emp on public.inventory_assignments(employee_id);
create index if not exists idx_inv_assign_type_id on public.inventory_assignments(inventory_type, inventory_id);
create index if not exists idx_inv_assign_status on public.inventory_assignments(assignment_status);
create index if not exists idx_inv_assign_date on public.inventory_assignments(assigned_at desc);

-- ==============================================================================
-- 5. INVENTORY ACTIVITY LOGS TABLE (Append-Only Audit Trail)
-- ==============================================================================
create table if not exists public.inventory_activity_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_type public.inventory_type_enum,
  inventory_id uuid,
  inventory_tag text,
  action_type public.audit_action_enum not null,
  performed_by uuid not null references public.profiles(id) on delete restrict,
  employee_id uuid references public.profiles(id) on delete set null,
  previous_values jsonb default '{}'::jsonb,
  new_values jsonb default '{}'::jsonb,
  description text not null,
  created_at timestamptz not null default now()
);

-- Indexes for Fast Filtering on Activity History Page
create index if not exists idx_audit_created_at on public.inventory_activity_logs(created_at desc);
create index if not exists idx_audit_action_type on public.inventory_activity_logs(action_type);
create index if not exists idx_audit_inv_type on public.inventory_activity_logs(inventory_type);
create index if not exists idx_audit_employee on public.inventory_activity_logs(employee_id);
create index if not exists idx_audit_performed_by on public.inventory_activity_logs(performed_by);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.inventory_assignments enable row level security;
alter table public.inventory_activity_logs enable row level security;

-- Assignments RLS:
-- Any active authenticated user can view assignments
create policy "Active users can view inventory assignments"
  on public.inventory_assignments for select
  using (public.is_active_user());

-- Only administrators can insert assignments
create policy "Admins can insert inventory assignments"
  on public.inventory_assignments for insert
  with check (public.is_admin());

-- Only administrators can update assignments (e.g. closing or transferring)
create policy "Admins can update inventory assignments"
  on public.inventory_assignments for update
  using (public.is_admin());

-- Activity Logs RLS:
-- Any active authenticated user can view audit history
create policy "Active users can view activity logs"
  on public.inventory_activity_logs for select
  using (public.is_active_user());

-- Active users / system can insert audit logs
create policy "Active users can insert activity logs"
  on public.inventory_activity_logs for insert
  with check (public.is_active_user());

-- STRICT APPEND-ONLY: NO UPDATE OR DELETE POLICIES CREATED FOR ACTIVITY LOGS!
-- This guarantees audit records cannot be tampered with or deleted by application users.

-- ==============================================================================
-- 7. ATOMIC TRANSACTION FUNCTIONS
-- ==============================================================================

-- A. Assign Equipment Function
create or replace function public.fn_assign_equipment(
  p_inventory_type public.inventory_type_enum,
  p_inventory_id uuid,
  p_inventory_tag text,
  p_employee_id uuid,
  p_assigned_by uuid,
  p_notes text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_assign_id uuid;
  v_emp_status text;
begin
  -- 1. Verify employee account is active
  select account_status into v_emp_status from public.profiles where id = p_employee_id;
  if v_emp_status is null or v_emp_status != 'active' then
    raise exception 'Cannot assign equipment to inactive or non-existent employee.';
  end if;

  -- 2. Verify equipment is not under maintenance
  if p_inventory_type = 'lanforge' then
    if exists (select 1 from public.lanforges where id = p_inventory_id and status = 'Under Maintenance') then
      raise exception 'Cannot assign equipment currently marked Under Maintenance.';
    end if;
    update public.lanforges set status = 'In-Use', poc_id = p_employee_id, updated_at = now() where id = p_inventory_id;
  elsif p_inventory_type = 'desktop' then
    if exists (select 1 from public.desktops where id = p_inventory_id and status = 'Under Maintenance') then
      raise exception 'Cannot assign equipment currently marked Under Maintenance.';
    end if;
    update public.desktops set status = 'In-Use', poc_id = p_employee_id, updated_at = now() where id = p_inventory_id;
  elsif p_inventory_type = 'mobile' then
    if exists (select 1 from public.mobiles where id = p_inventory_id and status = 'Under Maintenance') then
      raise exception 'Cannot assign equipment currently marked Under Maintenance.';
    end if;
    update public.mobiles set status = 'In-Use', poc_id = p_employee_id, updated_at = now() where id = p_inventory_id;
  elsif p_inventory_type = 'chamber' then
    if exists (select 1 from public.chambers where id = p_inventory_id and status = 'Under Maintenance') then
      raise exception 'Cannot assign equipment currently marked Under Maintenance.';
    end if;
    update public.chambers set status = 'In-Use', used_by_id = p_employee_id, updated_at = now() where id = p_inventory_id;
  end if;

  -- 3. Insert active assignment
  insert into public.inventory_assignments (
    inventory_type,
    inventory_id,
    inventory_tag,
    employee_id,
    assigned_by,
    assignment_status,
    notes
  ) values (
    p_inventory_type,
    p_inventory_id,
    p_inventory_tag,
    p_employee_id,
    p_assigned_by,
    'active',
    p_notes
  ) returning id into v_assign_id;

  -- 4. Record append-only audit entry
  insert into public.inventory_activity_logs (
    inventory_type,
    inventory_id,
    inventory_tag,
    action_type,
    performed_by,
    employee_id,
    description
  ) values (
    p_inventory_type,
    p_inventory_id,
    p_inventory_tag,
    'assigned',
    p_assigned_by,
    p_employee_id,
    'Equipment ' || p_inventory_tag || ' assigned to employee.'
  );

  return v_assign_id;
end;
$$;

-- B. Return Equipment Function
create or replace function public.fn_return_equipment(
  p_assignment_id uuid,
  p_returned_by uuid,
  p_notes text default null,
  p_return_date timestamptz default now(),
  p_mark_maintenance boolean default false
) returns boolean
language plpgsql
security definer
as $$
declare
  v_rec record;
  v_target_status public.inventory_status;
begin
  select * into v_rec from public.inventory_assignments where id = p_assignment_id for update;
  if not found or v_rec.assignment_status != 'active' then
    raise exception 'No active assignment found with given ID.';
  end if;

  -- Determine target inventory status
  if p_mark_maintenance then
    v_target_status := 'Under Maintenance';
  else
    v_target_status := 'Available';
  end if;

  -- Close assignment
  update public.inventory_assignments set
    assignment_status = 'returned',
    returned_at = p_return_date,
    returned_by = p_returned_by,
    notes = coalesce(notes || ' | Return: ' || p_notes, notes, p_notes),
    updated_at = now()
  where id = p_assignment_id;

  -- Update equipment record
  if v_rec.inventory_type = 'lanforge' then
    update public.lanforges set status = v_target_status, poc_id = null, updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'desktop' then
    update public.desktops set status = v_target_status, poc_id = null, updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'mobile' then
    update public.mobiles set status = v_target_status, poc_id = null, updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'chamber' then
    update public.chambers set status = v_target_status, used_by_id = null, updated_at = now() where id = v_rec.inventory_id;
  end if;

  -- Record audit entry
  insert into public.inventory_activity_logs (
    inventory_type,
    inventory_id,
    inventory_tag,
    action_type,
    performed_by,
    employee_id,
    description
  ) values (
    v_rec.inventory_type,
    v_rec.inventory_id,
    v_rec.inventory_tag,
    'returned',
    p_returned_by,
    v_rec.employee_id,
    'Equipment ' || v_rec.inventory_tag || ' returned to inventory (' || v_target_status || ').'
  );

  return true;
end;
$$;

-- C. Atomic Transfer Equipment Function
create or replace function public.fn_transfer_equipment(
  p_assignment_id uuid,
  p_to_employee_id uuid,
  p_transferred_by uuid,
  p_transfer_notes text default null,
  p_transfer_date timestamptz default now()
) returns uuid
language plpgsql
security definer
as $$
declare
  v_rec record;
  v_new_assign_id uuid;
  v_emp_status text;
begin
  -- 1. Check target employee
  select account_status into v_emp_status from public.profiles where id = p_to_employee_id;
  if v_emp_status is null or v_emp_status != 'active' then
    raise exception 'Cannot transfer equipment to inactive or non-existent employee.';
  end if;

  -- 2. Lock active assignment
  select * into v_rec from public.inventory_assignments where id = p_assignment_id for update;
  if not found or v_rec.assignment_status != 'active' then
    raise exception 'No active assignment found for this equipment.';
  end if;

  if v_rec.employee_id = p_to_employee_id then
    raise exception 'Cannot transfer equipment to the current custodian.';
  end if;

  -- 3. Close previous assignment as 'transferred'
  update public.inventory_assignments set
    assignment_status = 'transferred',
    returned_at = p_transfer_date,
    returned_by = p_transferred_by,
    notes = coalesce(notes || ' | Transferred to new employee: ' || p_transfer_notes, notes, p_transfer_notes),
    updated_at = now()
  where id = p_assignment_id;

  -- 4. Create new active assignment for target employee
  insert into public.inventory_assignments (
    inventory_type,
    inventory_id,
    inventory_tag,
    employee_id,
    assigned_at,
    assigned_by,
    assignment_status,
    notes
  ) values (
    v_rec.inventory_type,
    v_rec.inventory_id,
    v_rec.inventory_tag,
    p_to_employee_id,
    p_transfer_date,
    p_transferred_by,
    'active',
    'Transferred from previous custodian: ' || coalesce(p_transfer_notes, '')
  ) returning id into v_new_assign_id;

  -- 5. Update equipment current PoC / Used By reference
  if v_rec.inventory_type = 'lanforge' then
    update public.lanforges set poc_id = p_to_employee_id, status = 'In-Use', updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'desktop' then
    update public.desktops set poc_id = p_to_employee_id, status = 'In-Use', updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'mobile' then
    update public.mobiles set poc_id = p_to_employee_id, status = 'In-Use', updated_at = now() where id = v_rec.inventory_id;
  elsif v_rec.inventory_type = 'chamber' then
    update public.chambers set used_by_id = p_to_employee_id, status = 'In-Use', updated_at = now() where id = v_rec.inventory_id;
  end if;

  -- 6. Record transfer in activity log
  insert into public.inventory_activity_logs (
    inventory_type,
    inventory_id,
    inventory_tag,
    action_type,
    performed_by,
    employee_id,
    description
  ) values (
    v_rec.inventory_type,
    v_rec.inventory_id,
    v_rec.inventory_tag,
    'transferred',
    p_transferred_by,
    p_to_employee_id,
    'Equipment ' || v_rec.inventory_tag || ' transferred to new custodian.'
  );

  return v_new_assign_id;
end;
$$;
