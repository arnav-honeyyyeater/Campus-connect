import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Server-only client. Never import this module from a Client Component. */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
