import { z } from "zod";
import { apiError, ApiException, noStoreJson } from "@/lib/api";
import { env } from "@/lib/env";
import { generateSyntheticEmail, normalizeRegistrationNumber } from "@/lib/identifiers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  regNumber: z.string(),
  password: z.string().min(10).max(128),
  confirmPassword: z.string(),
  isAgeConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"], message: "Passwords do not match.",
});

export async function POST(request: Request) {
  try {
    if (env.SIGNUPS_ENABLED !== "true") throw new ApiException(403, "FORBIDDEN", "Registration is not available right now.");
    const input = schema.parse(await request.json());
    const regNumber = normalizeRegistrationNumber(input.regNumber);
    const email = generateSyntheticEmail(regNumber);

    const { data: existing } = await supabaseAdmin.from("account_identifiers")
      .select("user_id").eq("normalized_reg_number", regNumber).maybeSingle();
    if (existing) throw new ApiException(409, "CONFLICT", "An account already exists for this registration number.");

    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email, password: input.password, email_confirm: true,
      user_metadata: { normalized_reg_number: regNumber },
    });
    if (createError) {
      if (createError.message.toLowerCase().includes("already")) throw new ApiException(409, "CONFLICT", "An account already exists for this registration number.");
      throw createError;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password: input.password });
    if (signInError || !data.user) throw new ApiException(500, "INTERNAL_SERVER_ERROR", "Account was created, but sign-in failed. Please log in.");

    const { data: profile } = await supabase.from("profiles").select("id, handle, display_name, avatar_url").eq("id", data.user.id).single();
    return noStoreJson({ user: profile });
  } catch (error) { return apiError(error); }
}
