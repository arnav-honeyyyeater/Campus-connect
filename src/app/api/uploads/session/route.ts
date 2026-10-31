import { randomUUID } from "crypto";
import { z } from "zod";
import { apiError, ApiException, noStoreJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ purpose: z.enum(["avatar", "post_image", "sticker", "meme", "club_cover", "event_cover"]), filename: z.string().min(1).max(180), byteSize: z.number().int().positive().max(15 * 1024 * 1024) });
const allowed = new Set(["jpg", "jpeg", "png", "webp"]);

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json()); const { user } = await requireUser();
    const ext = input.filename.split(".").pop()?.toLowerCase(); if (!ext || !allowed.has(ext)) throw new ApiException(400, "BAD_REQUEST", "Only JPG, PNG, and WebP images are supported.");
    const { count, error: countError } = await supabaseAdmin.from("upload_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", new Date(Date.now() - 86_400_000).toISOString()); if (countError) throw countError;
    if ((count ?? 0) >= 50) throw new ApiException(429, "RATE_LIMITED", "Daily upload limit reached.");
    const sessionId = randomUUID(); const path = `${user.id}/${sessionId}.${ext}`;
    const { error: insertError } = await supabaseAdmin.from("upload_sessions").insert({ id: sessionId, user_id: user.id, purpose: input.purpose, quarantine_path: path, filename: input.filename, declared_byte_size: input.byteSize }); if (insertError) throw insertError;
    const { data, error } = await supabaseAdmin.storage.from("quarantine").createSignedUploadUrl(path); if (error) throw error;
    return noStoreJson({ sessionId, uploadPath: path, uploadUrl: data.signedUrl, uploadToken: data.token });
  } catch (error) { return apiError(error); }
}
