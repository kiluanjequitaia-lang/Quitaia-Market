import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT_REF') && !anonKey.includes('YOUR_SUPABASE'));
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;
