# Candela Inventory Management Platform — Vercel Deployment Guide

## 1. Vercel Configuration Reference

The project root contains `vercel.json`, configured specifically for enterprise Next.js App Router:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "headers": [ ... ]
}
```

### Security Headers Configured
- `Content-Security-Policy`: Restricts scripts, styles, and API connections to self, Supabase, and Hugging Face Spaces.
- `X-Frame-Options: DENY`: Prevents clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing vulnerabilities.
- `Strict-Transport-Security`: Forces HTTPS for 2 years with preloading.
- `Referrer-Policy: strict-origin-when-cross-origin`: Protects internal query strings.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables unused hardware APIs.

---

## 2. Deploying via Vercel CLI or Web Console

### Method A: Web Console (Recommended)
1. Import the Git repository in Vercel.
2. Select Root Directory: `./` (Root).
3. Ensure Environment Variables are populated:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `AI_BACKEND_URL`
   - `CONFIRMATION_SECRET`
4. Click **Deploy**.

### Method B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Authenticate
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Deploy to production
vercel --prod
```

---

## 3. Node.js Version & Build Optimization
- **Node.js Runtime:** Node.js 20.x or 22.x LTS.
- **Next.js Turbopack:** Enabled for rapid bundle compilation.
- **Edge Middleware:** Handles authentication redirects and route protection before any page renders.
- **Static Asset Caching:** 1-year immutable caching for static chunks (`/_next/static/(.*)`).
