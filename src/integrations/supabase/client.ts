// Supabase Client Configured for Direct Web / Production Deployment
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jmutelijbrocmprsucjk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXRlbGlqYnJvY21wcnN1Y2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzODE3MjAsImV4cCI6MjEwMzk1NzcyMH0.dzO5S8BPTF6oyWSZrs7hXsjEdayPOuUn4ilZe2w6Rgk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});