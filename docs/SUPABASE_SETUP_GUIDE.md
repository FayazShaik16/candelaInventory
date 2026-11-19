# Candela Inventory Management Platform — Supabase Production Setup Guide

## 1. Project Creation
1. Sign in to [Supabase Console](https://supabase.com).
2. Click **New Project**.
3. Organization: Select your enterprise org.
4. Name: `candela-inventory-production`.
5. Database Password: Generate a strong 32+ character password and store in your company password vault.
6. Region: Choose the region nearest to your testbeds and Vercel edge deployment (e.g., `us-west-1` or `ap-south-1`).
7. Pricing Plan: Pro or Team (recommended for daily backups, PITR, and increased connection limits).

---

## 2. Executing Schema Migrations
Navigate to **SQL Editor** in the Supabase Dashboard and run the migration scripts in sequence:

### Migration 1: Auth & Profiles (`001_auth_profiles.sql`)
- Creates `public.profiles` table linked to `auth.users(id)`.
- Defines `user_role` enum (`admin`, `employee`).
- Sets up automatic trigger `handle_new_user()` to populate profile on invitation or sign-up.
- Configures RLS policies for role-based view and management.

### Migration 2: Inventory Schema (`002_inventory_schema.sql`)
- Creates tables for all 4 hardware categories:
  - `public.lanforges`
  - `public.lanforge_radios` (Repeatable radio chipset configurations)
  - `public.desktops`
  - `public.mobiles`
  - `public.chambers`
- Enforces unique tag constraints (`lanforge_id`, `device_id`, `chamber_id`).
- Creates foreign key relationships to `profiles(id)` for PoC and custodianship.

### Migration 3: Assignments & Activity History (`003_assignments_and_activity_schema.sql`)
- Creates `public.inventory_assignments` with partial unique index enforcing only **one active assignment per equipment unit**.
- Creates `public.inventory_activity_logs` as an immutable append-only audit trail.
- Defines PostgreSQL atomic stored procedures:
  - `fn_assign_equipment(p_inventory_type, p_inventory_id, p_employee_id, ...)`
  - `fn_return_equipment(p_inventory_type, p_inventory_id, ...)`
  - `fn_transfer_equipment(p_inventory_type, p_inventory_id, p_to_employee_id, ...)`

### Migration 4: Dropdown Settings Schema (`004_dropdown_settings_schema.sql`)
- Creates `public.inventory_dropdown_settings` table.
- Grants read permissions to all authenticated staff.
- Grants write permissions exclusively to administrators for dynamic dropdown option management.

---

## 3. Authentication & Security Configuration

### Email Auth & Invitations
- Under **Authentication** -> **Providers** -> **Email**:
  - Enable Email provider.
  - Disable "Confirm email" if employee accounts are pre-created by administrators.
  - Enable "Secure email change".

### URL Redirects
Under **Authentication** -> **URL Configuration**:
- **Site URL:** `https://candela-inventory.vercel.app`
- **Redirect URLs:**
  - `https://candela-inventory.vercel.app/reset-password`
  - `https://candela-inventory.vercel.app/login`
  - `https://candela-inventory.vercel.app/**`

### Connection Pooling
For production workloads with serverless Vercel functions:
- Under **Project Settings** -> **Database** -> **Connection string**:
  - Use the **Transaction Pooler** (Port 6543) with PgBouncer to prevent connection exhaustion.
