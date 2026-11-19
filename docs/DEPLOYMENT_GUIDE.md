# Candela Inventory Management Platform — Production Deployment Guide

## 1. Architecture Overview

The Candela platform operates across a three-tier decoupled cloud architecture:

```
                      ┌──────────────────────────────────────┐
                      │            Vercel Frontend           │
                      │  Next.js 16 App Router + Turbopack   │
                      │  https://candela-inventory.vercel.app│
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     Hugging Face Spaces AI      │             │        Supabase Cloud DB        │
│   FastAPI + Pydantic v2 (Docker)│             │     PostgreSQL 15 + SSR Auth    │
│  Port 7860 (Structured Actions) │             │     Row Level Security (RLS)    │
│https://hf.space/.../candela-ai  │             │https://your-project.supabase.co │
└────────────────┬────────────────┘             └────────────────┬────────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Audited Hardware Inventory DB     │
                      │ LANforges • Desktops • Mobiles • Racks│
                      └──────────────────────────────────────┘
```

---

## 2. Prerequisites
1. **GitHub Repository:** Clean, committed branch with Phases 1–6.
2. **Vercel Account:** Team or hobby account connected to GitHub.
3. **Hugging Face Account:** With Docker Spaces access.
4. **Supabase Cloud Account:** PostgreSQL project created.

---

## 3. Step-by-Step Deployment Procedure

### Step 3.1: Supabase Database Migration
1. Navigate to your Supabase project dashboard -> **SQL Editor**.
2. Run the migration scripts in numerical sequence:
   - `supabase/migrations/001_auth_profiles.sql` (User profiles & RBAC)
   - `supabase/migrations/002_inventory_schema.sql` (4 categories & Repeatable Radios)
   - `supabase/migrations/003_assignments_and_activity_schema.sql` (Custody & Atomic Transfer Procedures)
   - `supabase/migrations/004_dropdown_settings_schema.sql` (Configurable dropdown values)
3. Under **Authentication** -> **URL Configuration**:
   - Set **Site URL** to `https://candela-inventory.vercel.app` (or your domain).
   - Add **Redirect URLs**:
     - `https://candela-inventory.vercel.app/**`
     - `https://candela-inventory.vercel.app/reset-password`
     - `http://localhost:3000/**` (for local development)

### Step 3.2: Hugging Face Spaces AI Backend Deployment
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) -> **Create new Space**.
2. Name: `candela-inventory-ai`.
3. Space SDK: Select **Docker** (Blank).
4. Public/Private: **Private** or **Public** depending on enterprise requirement.
5. Clone or sync the contents of the `backend/` directory:
   - `Dockerfile` (Binds port 7860)
   - `README.md` (YAML frontmatter with `app_port: 7860`)
   - `requirements.txt`
   - `app/`
6. In **Settings** -> **Variables and Secrets**:
   - `HF_API_KEY`: Hugging Face user access token.
   - `CONFIRMATION_SECRET`: Secure cryptographic salt for HMAC tokens.
   - `ALLOWED_ORIGINS`: Comma-separated Vercel frontend URLs (`https://candela-inventory.vercel.app`).
   - `ENVIRONMENT`: `production`.
   - `LOG_LEVEL`: `info`.
7. Wait for container build and verify `/health` returns HTTP 200:
   `https://<username>-candela-inventory-ai.hf.space/health`

### Step 3.3: Vercel Frontend Deployment
1. Go to [Vercel Dashboard](https://vercel.com) -> **Add New Project**.
2. Import the Candela GitHub repository.
3. Root Directory: `./` (Repository root).
4. Framework Preset: **Next.js**.
5. Build Command: `next build`.
6. Output Directory: `.next`.
7. Configure Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (Never exposed to client).
   - `SUPABASE_JWT_SECRET`: JWT secret for session signature verification.
   - `AI_BACKEND_URL`: URL to your Hugging Face Space (`https://<username>-candela-inventory-ai.hf.space`).
   - `CONFIRMATION_SECRET`: Identical salt string as backend.
8. Click **Deploy**. Vercel will build and publish the application.

---

## 4. Custom Domain & DNS Setup
To link a custom enterprise domain (e.g., `inventory.candelatech.com`):
1. In Vercel Project Settings -> **Domains** -> Add `inventory.candelatech.com`.
2. Configure DNS records at your domain registrar:
   - Type: `CNAME`
   - Name: `inventory`
   - Value: `cname.vercel-dns.com`
3. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt.
4. Update Supabase **Site URL** and **Redirect URLs** with the custom domain.
