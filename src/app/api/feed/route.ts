import { z } from "zod";
import { apiError, noStoreJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const querySchema = z.object({ tab: z.enum(["campus", "friends", "clubs"]).default("campus"), cursor: z.string().datetime().optional(), limit: z.coerce.number().int().min(1).max(50).default(20) });

export async function GET(request: Request) {
  try {
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams)); const { supabase, user, membership } = await requireUser();
    let query = supabase.from("posts").select("id,content,club_id,is_pinned,created_at,updated_at,profiles!posts_author_id_fkey(id,handle,display_name,avatar_url),post_attachments(id,kind,media_asset_id,creation_id,giphy_id,giphy_kind,display_order),post_reactions(reaction,user_id),comments(count)").eq("campus_id", membership.campus_id).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(input.limit + 1);
    if (input.cursor) query = query.lt("created_at", input.cursor);
    if (input.tab === "friends") { const { data: rows, error } = await supabase.from("friendships").select("requester_id,addressee_id").eq("status", "accepted").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`); if (error) throw error; const ids = (rows ?? []).map((x) => x.requester_id === user.id ? x.addressee_id : x.requester_id); if (!ids.length) return noStoreJson({ items: [], nextCursor: null }); query = query.in("author_id", ids); }
    if (input.tab === "clubs") { const { data: rows, error } = await supabase.from("club_memberships").select("club_id").eq("user_id", user.id); if (error) throw error; const ids = (rows ?? []).map((x) => x.club_id); if (!ids.length) return noStoreJson({ items: [], nextCursor: null }); query = query.in("club_id", ids); }
    const { data, error } = await query; if (error) throw error;
    const items = data ?? []; const hasNext = items.length > input.limit; if (hasNext) items.pop(); return noStoreJson({ items, nextCursor: hasNext ? items.at(-1)?.created_at ?? null : null });
  } catch (error) { return apiError(error); }
}
