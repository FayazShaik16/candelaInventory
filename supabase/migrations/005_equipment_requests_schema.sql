-- ==============================================================================
-- CANDELA INVENTORY MANAGEMENT PLATFORM — PHASE 5
-- Supabase PostgreSQL Schema: Equipment & Resource Requests Management
-- ==============================================================================

-- 1. Standardized Request Status Enum
do $$ begin
  create type public.request_status_enum as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

-- 2. Standardized Request Priority Enum
do $$ begin
  create type public.request_priority_enum as enum ('Standard', 'High Priority', 'Urgent');
exception
  when duplicate_object then null;
end $$;

-- ==============================================================================
-- 3. INVENTORY REQUESTS TABLE
-- ==============================================================================
create table if not exists public.inventory_requests (
  id text primary key,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  employee_name text not null,
  employee_email text not null,
  resource_category text not null,
  resource_label text not null,
  target_specs text,
  preferred_asset_id text,
  preferred_asset_tag text,
  project text not null,
  purpose text not null,
  priority text not null default 'Standard',
  duration text not null default '2 Weeks',
  status text not null default 'pending',
  assigned_asset_id text,
  assigned_asset_tag text,
  assigned_category text,
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for rapid querying & filtration
create index if not exists idx_inventory_requests_employee on public.inventory_requests(employee_id);
create index if not exists idx_inventory_requests_status on public.inventory_requests(status);
create index if not exists idx_inventory_requests_created_at on public.inventory_requests(created_at desc);

-- Enable RLS
alter table public.inventory_requests enable row level security;

-- RLS Policies
-- Employees can view their own requests; Admins can view all requests
create policy "Allow read on inventory_requests"
  on public.inventory_requests for select
  using (
    auth.uid() = employee_id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Any authenticated user can submit a request
create policy "Allow insert on inventory_requests"
  on public.inventory_requests for insert
  with check (auth.uid() = employee_id);

-- Admins can update any request; Employees can update their own pending requests
create policy "Allow update on inventory_requests"
  on public.inventory_requests for update
  using (
    (auth.uid() = employee_id and status = 'pending') or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
