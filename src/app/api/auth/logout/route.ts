import { apiError, noStoreJson } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return noStoreJson({ ok: true });
  } catch (error) { return apiError(error); }
}
