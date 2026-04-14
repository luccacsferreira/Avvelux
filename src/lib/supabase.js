import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase URL or Anon Key is missing!');
  console.error('If you are seeing "placeholder.supabase.co" in your network logs, it means you need to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your GitHub Repository Secrets.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
