// Supabase Client Configured for Direct Web / Production Deployment
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yqlwfxxvgoivioddmtgr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbHdmeHh2Z29pdmlvZGRtdGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTAzNjgsImV4cCI6MjA5MjQ2NjM2OH0.zWRThUzd8mAf--xkZ-ksoWDSUlyHlCM7FxUncPsL6-c";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});