import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

export function isSupabaseAdminConfigured(): boolean {
  return (
    isSupabaseConfigured() &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('your-supabase-service-role-key')
  );
}

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
