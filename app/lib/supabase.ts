import { createClient } from '@supabase/supabase-js';

// These environment variables are critical.
// In your .env.local file, you must add:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Now you can use `supabase` to interact with your Supabase backend.