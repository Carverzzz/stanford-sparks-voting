import { createClient } from '@supabase/supabase-js';

// Support both Vite (VITE_) and Create React App (REACT_APP_) environment variable prefixes
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                     import.meta.env.REACT_APP_SUPABASE_URL || 
                     'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.REACT_APP_SUPABASE_ANON_KEY || 
                          'your-anon-key';

if (!SUPABASE_URL.includes('supabase.co') || SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn('⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);