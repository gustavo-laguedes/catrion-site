import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Cliente único do Supabase pro Portal.
// Persistência de sessão fica por conta do SDK (localStorage).

export const SUPABASE_READY = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = SUPABASE_READY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;