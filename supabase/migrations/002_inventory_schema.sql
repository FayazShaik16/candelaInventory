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
