import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://xsoifeyivoybqzruaguu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzb2lmZXlpdm95YnF6cnVhZ3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTU0NTYsImV4cCI6MjA3OTgzMTQ1Nn0.3-PlfTBwKpo2wgoOEfXLHrGGZ6St8X7tcbLgKJfQ2vY';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
