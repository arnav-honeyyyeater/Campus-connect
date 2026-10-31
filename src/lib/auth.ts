import { ApiException } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiException(401, "UNAUTHORIZED", "Sign in is required.");

  const { data: membership } = await supabase
    .from("campus_memberships")
    .select("status, role, campus_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership || membership.status !== "active") {
    throw new ApiException(403, "FORBIDDEN", "This account is not active.");
  }
  return { supabase, user, membership };
}
