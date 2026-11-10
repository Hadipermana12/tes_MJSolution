import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let rawUrl = (process.env.SUPABASE_URL || '').trim();
// Bersihkan jika user menyalin URL beserta /rest/v1
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const SUPABASE_URL = rawUrl;
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

let supabaseClient = null;
let isSupabaseConfigured = false;

if (
  SUPABASE_URL &&
  SUPABASE_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_KEY.includes('your-anon')
) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false
      }
    });
    isSupabaseConfigured = true;
    console.log(`[Supabase] Terhubung ke Supabase Project: ${SUPABASE_URL}`);
  } catch (err) {
    console.error(`[Supabase Init Error]:`, err.message);
  }
} else {
  console.log('[Supabase Info] SUPABASE_URL dan SUPABASE_ANON_KEY belum diisi di .env. Menggunakan fallback lokal/memori.');
}

export const supabase = supabaseClient;
export const isConfigured = () => isSupabaseConfigured;

