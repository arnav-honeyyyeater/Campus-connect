import { z } from "zod";
import { apiError, ApiException, noStoreJson } from "@/lib/api";
import { normalizeRegistrationNumber } from "@/lib/identifiers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ regNumber: z.string(), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const regNumber = normalizeRegistrationNumber(input.regNumber);
    const { data: identifier } = await supabaseAdmin.from("account_identifiers")
      .select("user_id").eq("normalized_reg_number", regNumber).maybeSingle();
    if (!identifier) throw new ApiException(401, "UNAUTHORIZED", "Invalid registration number or password.");

    const { data: lookup, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(identifier.user_id);
    if (lookupError || !lookup.user?.email) throw new ApiException(401, "UNAUTHORIZED", "Invalid registration number or password.");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: lookup.user.email, password: input.password });
    if (error || !data.user) throw new ApiException(401, "UNAUTHORIZED", "Invalid registration number or password.");

    const { data: membership } = await supabase.from("campus_memberships").select("status").eq("user_id", data.user.id).maybeSingle();
    if (membership?.status !== "active") {
      await supabase.auth.signOut();
      throw new ApiException(403, "FORBIDDEN", "This account is not active.");
    }
    const { data: profile } = await supabase.from("profiles").select("id, handle, display_name, avatar_url").eq("id", data.user.id).single();
    return noStoreJson({ user: profile });
  } catch (error) { return apiError(error); }
}
