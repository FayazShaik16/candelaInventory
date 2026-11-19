# Candela Inventory Management Platform — Backup & Disaster Recovery Guide

## 1. Automated Supabase Backups
On Supabase Pro or Team tiers:
- **Daily Backups:** Captured automatically every 24 hours and retained for 7 to 30 days.
- **Point-in-Time Recovery (PITR):** Allows restoring the database to any individual second in the past up to 7 days, critical for recovering from accidental bulk mutations.

---

## 2. Manual Backup via pg_dump CLI

To take an immediate offsite database snapshot before major migrations:

```bash
# Set your Supabase connection parameters
export DB_HOST="db.your-project.supabase.co"
export DB_USER="postgres"
export DB_NAME="postgres"
export BACKUP_FILE="candela_backup_$(date +%Y%m%d_%H%M%S).sql"

# Dump entire schema and data (excluding system schemas)
pg_dump -h $DB_HOST -p 5432 -U $DB_USER -d $DB_NAME \
  --format=custom \
  --schema=public \
  --file=$BACKUP_FILE

echo "Backup saved to $BACKUP_FILE"
```

---

## 3. Restoration Procedure

To restore a custom-format dump into a fresh database:

```bash
# 1. Terminate existing connections (if restoring over existing database)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

# 2. Restore using pg_restore
pg_restore -h $DB_HOST -p 5432 -U $DB_USER -d $DB_NAME \
  --clean --if-exists \
  --no-owner --no-privileges \
  $BACKUP_FILE

echo "Database restored successfully from $BACKUP_FILE"
```

---

## 4. Disaster Recovery Runbook

| Severity Level | Event | Target Recovery Time (RTO) | Target Recovery Point (RPO) | Action |
| :--- | :--- | :--- | :--- | :--- |
| **P1 — Critical** | Supabase region outage | < 30 minutes | < 1 hour | Deploy standby database in alternate region using latest dump; update Vercel `NEXT_PUBLIC_SUPABASE_URL`. |
| **P2 — High** | Accidental bulk deletion or corruption | < 15 minutes | < 5 minutes | Initiate Supabase Point-in-Time Recovery (PITR) to timestamp immediately preceding incident. |
| **P3 — Moderate** | AI Backend container failure | < 5 minutes | 0 minutes | Next.js fallback engine activates automatically; restart Space container via Hugging Face dashboard. |
