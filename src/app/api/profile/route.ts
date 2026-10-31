import { z } from "zod";
import { apiError, noStoreJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const updateSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(), avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().max(160).nullable().optional(), course: z.string().max(120).nullable().optional(),
  year: z.number().int().min(1).max(5).nullable().optional(), interests: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
}).strict();

export async function GET() {
  try { const { supabase, user } = await requireUser(); const { data, error } = await supabase.from("profiles").select("id,handle,display_name,avatar_url,bio,course,year_of_study,interests,created_at").eq("id", user.id).single(); if (error) throw error; return noStoreJson({ profile: data }); } catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  try {
    const input = updateSchema.parse(await request.json()); const { supabase, user } = await requireUser();
    const payload = { ...(input.displayName !== undefined ? { display_name: input.displayName } : {}), ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}), ...(input.bio !== undefined ? { bio: input.bio } : {}), ...(input.course !== undefined ? { course: input.course } : {}), ...(input.year !== undefined ? { year_of_study: input.year } : {}), ...(input.interests !== undefined ? { interests: input.interests } : {}) };
    const { data, error } = await supabase.from("profiles").update(payload).eq("id", user.id).select("id,handle,display_name,avatar_url,bio,course,year_of_study,interests").single(); if (error) throw error;
    return noStoreJson({ profile: data });
  } catch (error) { return apiError(error); }
}
