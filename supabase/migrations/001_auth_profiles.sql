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
