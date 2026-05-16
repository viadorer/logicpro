import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client = null;
let _initError = null;

if (!supabaseUrl || !supabaseKey) {
  _initError =
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
    "Configure them in Vercel project settings.";
} else {
  _client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Vraci Supabase klient, nebo null pokud nejsou env vars.
 * API handlery by mely volat `requireSupabase(res)` pro
 * konzistentni 503 odpoved misto cold-start crash.
 */
export const supabase = _client;
export const supabaseInitError = _initError;

export function requireSupabase(res) {
  if (_client) return _client;
  res.status(503).json({
    error: "Service unavailable",
    detail: _initError,
  });
  return null;
}
