# Candela Inventory Management Platform — Environment Variable Reference

This document catalogs every environment variable used in the Candela system, including its scope, requirement level, and security sensitivity.

---

## 1. Frontend & Client Variables (Vercel)

| Variable Name | Required | Scope | Security Sensitivity | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Client & Server | Public | Base HTTPS URL of your Supabase project (e.g. `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Client & Server | Public Safe | Supabase anonymous public key. Secured via PostgreSQL Row Level Security (RLS). |
| `NEXT_PUBLIC_AI_API_URL` | No | Client | Public Safe | Route path to assistant gateway. Defaults to internal Next.js proxy `/api/assistant/chat`. |
| `NEXT_PUBLIC_APP_URL` | No | Client & Server | Public Safe | Fully-qualified application base URL (e.g. `https://inventory.candelatech.com`). |

---

## 2. Server-Side Privileged Variables (Vercel Serverless Functions)

> [!CAUTION]
> NEVER prepend these variables with `NEXT_PUBLIC_`. Doing so exposes privileged secrets to the browser JavaScript bundle!

| Variable Name | Required | Scope | Security Sensitivity | Description |
| :--- | :--- | :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server Only | **HIGH / SECRET** | Full-privilege Supabase service role key for admin user management and seed scripts. |
| `SUPABASE_JWT_SECRET` | **Yes** | Server Only | **HIGH / SECRET** | Supabase JWT secret key used to verify user auth tokens and roles on incoming requests. |
| `AI_BACKEND_URL` | **Yes** | Server Only | Internal | HTTPS URL pointing to the Hugging Face Spaces AI backend container (or port 7860 locally). |
| `CONFIRMATION_SECRET` | **Yes** | Server Only | **HIGH / SECRET** | Cryptographic salt used for signing HMAC-SHA256 action preview tokens with 5-minute expiry. |

---

## 3. AI Backend Variables (Hugging Face Spaces / Docker)

| Variable Name | Required | Scope | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | **Yes** | Container | `7860` | ASGI listening port required by Hugging Face Spaces Docker SDK. |
| `AI_MODEL_ID` | No | Backend | `meta-llama/Llama-3.2-3B-Instruct` | Instruction-following AI model repository on Hugging Face. |
| `AI_MODEL_PROVIDER` | No | Backend | `huggingface` | Model inference provider (`huggingface` or `local`). |
| `HF_API_KEY` | No | Backend | `""` | User Access Token with read permissions for gated models on HF Hub. |
| `ALLOWED_ORIGINS` | **Yes** | Backend | Vercel domain | Comma-separated list of allowed CORS origins. Wildcards (`*`) forbidden in production. |
| `ENVIRONMENT` | **Yes** | Backend | `production` | Deployment mode (`development`, `staging`, `production`). |
| `LOG_LEVEL` | No | Backend | `info` | Python logging verbosity (`debug`, `info`, `warning`, `error`). |
| `CONFIRMATION_SECRET` | **Yes** | Backend | — | Must match the frontend salt to verify HMAC action tokens. |
| `CONFIRMATION_EXPIRY_SECONDS`| No | Backend | `300` | Expiration window in seconds for pending confirmation tokens (5 minutes). |

---

## 4. Secret Rotation Procedure
1. **Supabase Service Key Rotation:** In Supabase Dashboard -> **Settings** -> **API** -> Rotate Service Role Key. Update Vercel environment variables and trigger redeploy.
2. **Confirmation Salt Rotation:** Generate a new 64-character random string (`openssl rand -hex 32`). Update both Vercel and Hugging Face Spaces. Any actions in flight during rotation will prompt the user to re-confirm.
