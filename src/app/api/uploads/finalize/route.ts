import { randomUUID } from "crypto";
import sharp from "sharp";
import { z } from "zod";
import { apiError, ApiException, noStoreJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { sanitizeImage } from "@/lib/media";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ sessionId: z.string().uuid() });
export async function POST(request: Request) {
  try {
    const { sessionId } = schema.parse(await request.json()); const { user } = await requireUser();
    const { data: session, error } = await supabaseAdmin.from("upload_sessions").select("*").eq("id", sessionId).eq("user_id", user.id).maybeSingle(); if (error) throw error;
    if (!session || new Date(session.expires_at) < new Date()) throw new ApiException(404, "NOT_FOUND", "Upload session not found or expired.");
    if (session.finalized_at) throw new ApiException(409, "CONFLICT", "This upload was already finalized.");
    const { data: raw, error: downloadError } = await supabaseAdmin.storage.from("quarantine").download(session.quarantine_path); if (downloadError || !raw) throw new ApiException(400, "BAD_REQUEST", "Upload was not completed.");
    const { bytes, extension, mimeType } = await sanitizeImage(Buffer.from(await raw.arrayBuffer()), session.purpose);
    const meta = await sharp(bytes).metadata(); const assetId = randomUUID(); const storagePath = `${user.id}/${assetId}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage.from("media").upload(storagePath, bytes, { contentType: mimeType, upsert: false }); if (uploadError) throw uploadError;
    const { data: asset, error: assetError } = await supabaseAdmin.from("media_assets").insert({ id: assetId, uploader_id: user.id, storage_path: storagePath, byte_size: bytes.byteLength, mime_type: mimeType, width: meta.width, height: meta.height, purpose: session.purpose }).select().single(); if (assetError) { await supabaseAdmin.storage.from("media").remove([storagePath]); throw assetError; }
    await supabaseAdmin.storage.from("quarantine").remove([session.quarantine_path]); await supabaseAdmin.from("upload_sessions").update({ finalized_at: new Date().toISOString() }).eq("id", sessionId);
    return noStoreJson({ assetId: asset.id, width: asset.width, height: asset.height, mimeType: asset.mime_type });
  } catch (error) { return apiError(error); }
}
