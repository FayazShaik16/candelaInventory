# Candela Inventory Management Platform — Production Troubleshooting Guide

This guide provides diagnostics and remediation steps for issues in production.

---

## 1. Authentication & Session Issues

### Symptom: User logs in successfully, but gets immediately redirected back to `/login`
- **Cause:** Cookies blocked or Supabase SSR middleware cookie domain mismatch.
- **Remediation:**
  1. Verify `NEXT_PUBLIC_APP_URL` matches the current browser domain.
  2. In Supabase Dashboard -> **Authentication** -> **URL Configuration**, ensure the current domain is present in **Site URL** and **Redirect URLs**.
  3. Ensure cookies are sent with `SameSite=Lax` and `Secure=true` (enforced automatically over HTTPS).

### Symptom: `403 Forbidden: Administrator privilege required`
- **Cause:** User account has `role = 'employee'` instead of `'admin'`.
- **Remediation:**
  1. An existing admin must navigate to **Admin Users View** (`/users`) and change the employee's role to Administrator.
  2. Or in Supabase SQL Editor:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'operator@candelatech.com';
     ```

---

## 2. AI Assistant & Backend Connectivity

### Symptom: Assistant badge displays `Local Engine` instead of `AI Engine Connected`
- **Cause:** Hugging Face Space is sleeping (cold start) or `AI_BACKEND_URL` is misconfigured in Vercel.
- **Remediation:**
  1. Check `AI_BACKEND_URL` in Vercel project environment variables.
  2. Open `https://<username>-candela-inventory-ai.hf.space/health` in a browser. If the Space is sleeping, Hugging Face will wake it up (takes ~30–45 seconds on free tier).
  3. The Next.js frontend continues to operate via local rule parsing while waking up.

### Symptom: `400 Bad Request: Invalid or expired confirmation token`
- **Cause:** User clicked "Confirm & Execute" more than 5 minutes after the action preview was generated, or clicked it twice.
- **Remediation:**
  1. HMAC tokens expire after 300 seconds for security.
  2. Simply repeat the instruction in the chat to generate a fresh confirmation card.

---

## 3. Database & Assignment Mutations

### Symptom: `Equipment already has an active assignment` error
- **Cause:** Attempting to assign equipment that is currently in custody without transferring or returning it first.
- **Remediation:**
  1. The database strictly enforces single-custody via a PostgreSQL partial unique index.
  2. Use the **Transfer** workflow or instruct the AI assistant: `"Transfer <unit-id> to <new-employee>"`.

### Symptom: `Cannot assign equipment marked Under Maintenance` error
- **Cause:** Hardware is flagged as `Under Maintenance` for diagnostics or repair.
- **Remediation:**
  1. First update the equipment status to `Available` via the inventory table or AI command: `"Mark <unit-id> as Available"`.
  2. Then proceed with the assignment.
