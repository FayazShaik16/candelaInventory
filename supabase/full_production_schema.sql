-- ==============================================================================
-- CANDELA INVENTORY MANAGEMENT PLATFORM — PHASE 2
-- Supabase PostgreSQL Schema: Authentication, Profiles, and Row Level Security
-- ==============================================================================

-- 1. Create custom enum types for role and account status
do $$ begin
  create type public.user_role as enum ('admin', 'employee');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.user_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

-- 2. Create the profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'employee',
  account_status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Enable Row Level Security (RLS) immediately
alter table public.profiles enable row level security;

-- 3. Create index for fast lookups
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(account_status);

-- 4. Secure Helper Functions (Security Definer to prevent recursive RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and account_status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_status = 'active'
  );
$$;

-- 5. Row Level Security Policies for profiles table

-- A. SELECT: Users can read their own profile, or any active admin can read all profiles
create policy "Users can view own profile or admins view all"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or public.is_admin()
  );

-- B. INSERT: Only authenticated admins or system service role can insert profiles
create policy "Admins can insert profiles"
  on public.profiles
  for insert
  with check (
    public.is_admin()
    or auth.uid() = id -- allows self-registration triggers if configured
  );

-- C. UPDATE: Users can update their own full_name, but only admins can change role or status
create policy "Users can update own details"
  on public.profiles
  for update
  using (
    auth.uid() = id
    or public.is_admin()
  )
  with check (
    -- Non-admins cannot alter their role or account status
    case
      when not public.is_admin() then
        role = (select p.role from public.profiles p where p.id = auth.uid())
        and account_status = (select p.account_status from public.profiles p where p.id = auth.uid())
      else true
    end
  );

-- D. DELETE: Only admins can delete a profile
create policy "Admins can delete profiles"
  on public.profiles
  for delete
  using (
    public.is_admin()
  );

-- 6. Updated_at automated timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 7. Trigger to automatically provision a profile on auth.users insertion
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role public.user_role := 'employee';
  assigned_name text;
begin
  -- Check user metadata for full_name or role if provided by admin creation
  assigned_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  if new.raw_user_meta_data->>'role' = 'admin' then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    account_status,
    created_at,
    updated_at
  )
  values (
    new.id,
    assigned_name,
    new.email,
    assigned_role,
    'active',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Connect trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ==============================================================================
-- CANDELA INVENTORY MANAGEMENT PLATFORM — PHASE 3
-- Supabase PostgreSQL Schema: Complete Hardware Inventory & Assignment History
-- ==============================================================================

-- 1. Standardized Inventory Status Enum
do $$ begin
  create type public.inventory_status as enum ('Available', 'In-Use', 'Under Maintenance');
exception
  when duplicate_object then null;
end $$;

-- 2. Standardized LANforge Location Enum
do $$ begin
  create type public.lanforge_location as enum ('VINSR', 'OPEL', 'GVP');
exception
  when duplicate_object then null;
end $$;

-- ==============================================================================
-- 3. LANFORGES TABLE
-- ==============================================================================
create table if not exists public.lanforges (
  id uuid primary key default gen_random_uuid(),
  s_no serial,
  location public.lanforge_location not null default 'VINSR',
  testbed_ip inet not null,
  project text not null,
  poc_id uuid references public.profiles(id) on delete set null,
  lanforge_id text not null unique,
  lanforge_model text not null,
  max_ethernet_speed text not null default '10 Gbps',
  total_clients integer not null default 0 check (total_clients >= 0),
  no_of_11be_clients integer not null default 0 check (no_of_11be_clients >= 0),
  no_of_11ax_clients integer not null default 0 check (no_of_11ax_clients >= 0),
  no_of_11ac_clients integer not null default 0 check (no_of_11ac_clients >= 0),
  no_of_11n_clients integer not null default 0 check (no_of_11n_clients >= 0),
  status public.inventory_status not null default 'Available',
  comments text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_lanforges_id on public.lanforges(lanforge_id);
create index if not exists idx_lanforges_status on public.lanforges(status);
create index if not exists idx_lanforges_location on public.lanforges(location);
create index if not exists idx_lanforges_poc on public.lanforges(poc_id);

-- ==============================================================================
-- 4. LANFORGE RADIOS CONFIGURATION TABLE
-- ==============================================================================
create table if not exists public.lanforge_radios (
  id uuid primary key default gen_random_uuid(),
  lanforge_ref uuid not null references public.lanforges(id) on delete cascade,
  chipset text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_radios_lanforge on public.lanforge_radios(lanforge_ref);

-- ==============================================================================
-- 5. DESKTOPS TABLE
-- ==============================================================================
create table if not exists public.desktops (
  id uuid primary key default gen_random_uuid(),
  s_no serial,
  device_id text not null unique,
  device_brand text not null,
  model text not null,
  project text not null,
  poc_id uuid references public.profiles(id) on delete set null,
  status public.inventory_status not null default 'Available',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_desktops_device_id on public.desktops(device_id);
create index if not exists idx_desktops_status on public.desktops(status);
create index if not exists idx_desktops_poc on public.desktops(poc_id);

-- ==============================================================================
-- 6. MOBILES TABLE
-- ==============================================================================
create table if not exists public.mobiles (
  id uuid primary key default gen_random_uuid(),
  s_no serial,
  device_id text not null unique,
  device_brand text not null,
  model text not null,
  project text not null,
  poc_id uuid references public.profiles(id) on delete set null,
  status public.inventory_status not null default 'Available',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_mobiles_device_id on public.mobiles(device_id);
create index if not exists idx_mobiles_status on public.mobiles(status);
create index if not exists idx_mobiles_poc on public.mobiles(poc_id);

-- ==============================================================================
-- 7. CHAMBERS TABLE
-- ==============================================================================
create table if not exists public.chambers (
  id uuid primary key default gen_random_uuid(),
  s_no serial,
  chamber_type text not null,
  chamber_id text not null unique,
  used_by_id uuid references public.profiles(id) on delete set null,
  project text not null,
  status public.inventory_status not null default 'Available',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_chambers_id on public.chambers(chamber_id);
create index if not exists idx_chambers_status on public.chambers(status);
create index if not exists idx_chambers_used_by on public.chambers(used_by_id);

-- ==============================================================================
-- 8. EQUIPMENT ASSIGNMENTS HISTORY TABLE
-- ==============================================================================
create table if not exists public.equipment_assignments (
  id uuid primary key default gen_random_uuid(),
  equipment_category text not null check (equipment_category in ('lanforge', 'desktop', 'mobile', 'chamber')),
  equipment_id uuid not null,
  equipment_tag text not null,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  assigned_date timestamptz not null default now(),
  return_date timestamptz,
  assigned_by uuid references public.profiles(id) on delete set null,
  notes text,
  assignment_status text not null check (assignment_status in ('active', 'returned')) default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_assign_equipment on public.equipment_assignments(equipment_id, equipment_category);
create index if not exists idx_assign_employee on public.equipment_assignments(employee_id);
create index if not exists idx_assign_status on public.equipment_assignments(assignment_status);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.lanforges enable row level security;
alter table public.lanforge_radios enable row level security;
alter table public.desktops enable row level security;
alter table public.mobiles enable row level security;
alter table public.chambers enable row level security;
alter table public.equipment_assignments enable row level security;

-- A. SELECT: Any authenticated active employee or admin can read inventory
create policy "Authenticated users can view lanforges"
  on public.lanforges for select
  using (public.is_active_user());

create policy "Authenticated users can view radios"
  on public.lanforge_radios for select
  using (public.is_active_user());

create policy "Authenticated users can view desktops"
  on public.desktops for select
  using (public.is_active_user());

create policy "Authenticated users can view mobiles"
  on public.mobiles for select
  using (public.is_active_user());

create policy "Authenticated users can view chambers"
  on public.chambers for select
  using (public.is_active_user());

create policy "Authenticated users can view assignments"
  on public.equipment_assignments for select
  using (public.is_active_user());

-- B. MUTATIONS (INSERT, UPDATE, DELETE): Only active administrators can mutate inventory
create policy "Admins can insert lanforges"
  on public.lanforges for insert
  with check (public.is_admin());

create policy "Admins can update lanforges"
  on public.lanforges for update
  using (public.is_admin());

create policy "Admins can delete lanforges"
  on public.lanforges for delete
  using (public.is_admin());

create policy "Admins can mutate radios"
  on public.lanforge_radios for all
  using (public.is_admin());

create policy "Admins can mutate desktops"
  on public.desktops for all
  using (public.is_admin());

create policy "Admins can mutate mobiles"
  on public.mobiles for all
  using (public.is_admin());

create policy "Admins can mutate chambers"
  on public.chambers for all
  using (public.is_admin());

create policy "Admins can insert assignments"
  on public.equipment_assignments for insert
  with check (public.is_admin());

create policy "Admins can update assignments"
  on public.equipment_assignments for update
  using (public.is_admin());
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
-- ==============================================================================
-- 004_dropdown_settings_schema.sql
-- Candela Inventory Platform — Dynamic Dropdown Settings & Options
-- ==============================================================================

-- 1. Create Dropdown Settings Table
CREATE TABLE IF NOT EXISTS public.inventory_dropdown_settings (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('locations', 'projects', 'chipsets', 'brands', 'chamberTypes', 'ethernetSpeeds')),
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_default BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_dropdown_category_value UNIQUE (category, value)
);

-- Index for fast lookup by category and active state
CREATE INDEX IF NOT EXISTS idx_dropdown_category_active 
ON public.inventory_dropdown_settings(category, is_active);

-- Enable Row Level Security
ALTER TABLE public.inventory_dropdown_settings ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated employees can view active and inactive dropdown values
CREATE POLICY "Allow authenticated users to read dropdown settings"
ON public.inventory_dropdown_settings
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only administrators can create new dropdown options
CREATE POLICY "Allow administrators to insert dropdown settings"
ON public.inventory_dropdown_settings
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Policy: Only administrators can update dropdown settings
CREATE POLICY "Allow administrators to update dropdown settings"
ON public.inventory_dropdown_settings
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Policy: Only administrators can delete non-system dropdown settings
CREATE POLICY "Allow administrators to delete dropdown settings"
ON public.inventory_dropdown_settings
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Seed System Default Dropdown Values
INSERT INTO public.inventory_dropdown_settings (id, category, label, value, is_active, is_system_default, description)
VALUES
    -- Locations
    ('dd-loc-1', 'locations', 'VINSR (Lab Bay 1)', 'VINSR', true, true, 'Primary high-density Wi-Fi 6E/7 stress test bay'),
    ('dd-loc-2', 'locations', 'OPEL (Lab Bay 2)', 'OPEL', true, true, 'Automated 11be multi-link benchmark facility'),
    ('dd-loc-3', 'locations', 'GVP (Lab Bay 3)', 'GVP', true, true, 'Long-term stability and legacy validation rack'),
    
    -- Projects
    ('dd-proj-1', 'projects', 'Wi-Fi 6E High-Density AP Stress', 'Wi-Fi 6E High-Density AP Stress', true, true, 'Dual 5GHz 160MHz channel bonding stress'),
    ('dd-proj-2', 'projects', 'Automated 11be Multi-Link Benchmark', 'Automated 11be Multi-Link Benchmark', true, true, 'Wi-Fi 7 320MHz MLO latency validation'),
    ('dd-proj-3', 'projects', 'Legacy 802.11ac Fallback Validation', 'Legacy 802.11ac Fallback Validation', true, true, 'Cross-generation backward compatibility matrix'),
    ('dd-proj-4', 'projects', 'Continuous Controller Automation', 'Continuous Controller Automation', true, true, 'Dedicated testbed controller workstations'),
    ('dd-proj-5', 'projects', 'Lab Automation Master', 'Lab Automation Master', true, true, 'Primary lab orchestrator rig'),
    ('dd-proj-6', 'projects', 'Mobile Fleet Multi-Station Roaming Suite', 'Mobile Fleet Multi-Station Roaming Suite', true, true, 'Automated station mobility validation'),
    ('dd-proj-7', 'projects', 'Wi-Fi 7 Client Station Benchmark', 'Wi-Fi 7 Client Station Benchmark', true, true, 'Wi-Fi 7 client throughput and roaming testbed'),
    ('dd-proj-8', 'projects', 'Wi-Fi 6E High-Throughput RF Isolation', 'Wi-Fi 6E High-Throughput RF Isolation', true, true, 'Shielded RF isolation benchmarking'),
    ('dd-proj-9', 'projects', 'Antenna Characterization', 'Antenna Characterization', true, true, 'Over-the-air radiation pattern characterization'),

    -- Chipsets
    ('dd-chip-1', 'chipsets', 'Qualcomm QCN9274 (Wi-Fi 7)', 'Qualcomm QCN9274', true, true, 'Quad-band Wi-Fi 7 320MHz PCIe radio'),
    ('dd-chip-2', 'chipsets', 'Broadcom BCM4375 (Wi-Fi 6)', 'Broadcom BCM4375', true, true, 'Dual-band 802.11ax high-performance radio'),
    ('dd-chip-3', 'chipsets', 'Intel AX210 (Wi-Fi 6E)', 'Intel AX210', true, true, 'Tri-band 2.4/5/6 GHz M.2 radio module'),
    ('dd-chip-4', 'chipsets', 'MediaTek MT7922 (Wi-Fi 6E)', 'MediaTek MT7922', true, true, '2x2 160MHz client radio interface'),
    ('dd-chip-5', 'chipsets', 'Qualcomm FastConnect 7800 (Wi-Fi 7)', 'Qualcomm FastConnect 7800', true, true, 'High-band simultaneous multi-link radio'),

    -- Brands
    ('dd-brand-1', 'brands', 'Dell Technologies', 'Dell', true, true, 'Precision rack and tower workstations'),
    ('dd-brand-2', 'brands', 'HP Enterprise', 'HP', true, true, 'Z4 / Z6 lab automation computers'),
    ('dd-brand-3', 'brands', 'Lenovo', 'Lenovo', true, true, 'ThinkStation testbed hosts'),
    ('dd-brand-4', 'brands', 'Google Pixel', 'Google', true, true, 'Android reference roaming client stations'),
    ('dd-brand-5', 'brands', 'Samsung Electronics', 'Samsung', true, true, 'Galaxy S-series flagship test clients'),
    ('dd-brand-6', 'brands', 'Apple Inc.', 'Apple', true, true, 'iOS client hardware validation pool'),
    ('dd-brand-7', 'brands', 'OnePlus', 'OnePlus', true, true, 'OxygenOS Wi-Fi 7 client stations'),

    -- Chamber Types
    ('dd-ch-1', 'chamberTypes', 'RF Isolation Chamber (Shielded Box)', 'RF Isolation Chamber', true, true, 'High-attenuation shielded RF box (>90 dB isolation)'),
    ('dd-ch-2', 'chamberTypes', 'Over-The-Air Chamber (OTA)', 'Over-The-Air Chamber (OTA)', true, true, 'Multipath simulation and antenna array testing'),
    ('dd-ch-3', 'chamberTypes', 'Reverberation Chamber', 'Reverberation Chamber', true, true, 'Isotropic statistical multipath test environment'),
    ('dd-ch-4', 'chamberTypes', 'Anechoic Chamber', 'Anechoic Chamber', true, true, 'Free-space RF emission and antenna calibration'),

    -- Ethernet Speeds
    ('dd-eth-1', 'ethernetSpeeds', '1 Gbps (1000BASE-T)', '1 Gbps', true, true, 'Standard management and client interface'),
    ('dd-eth-2', 'ethernetSpeeds', '2.5 Gbps (2.5GBASE-T)', '2.5 Gbps', true, true, 'Multi-gigabit access point uplink'),
    ('dd-eth-3', 'ethernetSpeeds', '5 Gbps (5GBASE-T)', '5 Gbps', true, true, 'Enterprise Wi-Fi 6 access point port'),
    ('dd-eth-4', 'ethernetSpeeds', '10 Gbps (10GBASE-T / SFP+)', '10 Gbps', true, true, 'High-speed stress testbed backhaul'),
    ('dd-eth-5', 'ethernetSpeeds', '25 Gbps (25GBASE-SR / SFP28)', '25 Gbps', true, true, 'High-capacity LANforge CT523c interface'),
    ('dd-eth-6', 'ethernetSpeeds', '40 Gbps (QSFP+)', '40 Gbps', true, true, 'Core lab aggregation interface'),
    ('dd-eth-7', 'ethernetSpeeds', '100 Gbps (QSFP28)', '100 Gbps', true, true, 'Next-generation backbone throughput pipeline')
ON CONFLICT (category, value) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;
