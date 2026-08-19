import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SIGN_SECONDS = 60 * 60 * 24 * 7;

export type PublicVideo = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  creator: string | null;
  duration: string | null;
  viewCount: number;
  isFeatured: boolean;
  videoUrl: string | null;
  thumbnailUrl: string | null;
};

export type PublicMessage = {
  id: string;
  senderName: string;
  body: string;
  linkUrl: string | null;
  linkLabel: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

async function sign(bucket: "videos" | "media", path: string | null) {
  if (!path) return null;
  const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, SIGN_SECONDS);
  return data?.signedUrl ?? null;
}

export async function fetchPublicVideos(): Promise<PublicVideo[]> {
  const { data, error } = await supabaseAdmin
    .from("videos")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      creator: v.creator,
      duration: v.duration,
      viewCount: v.view_count,
      isFeatured: v.is_featured,
      videoUrl: await sign("videos", v.video_url),
      thumbnailUrl: await sign("media", v.thumbnail_url),
    })),
  );
}

export async function upsertVisitor(input: {
  sessionId: string;
  path: string;
  videoTitle?: string | null | undefined;
  userAgent?: string | null | undefined;
  referrer?: string | null | undefined;
  screen?: string | null | undefined;
}) {
  const { data: existing } = await supabaseAdmin
    .from("visitors")
    .select("id, page_views")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("visitors")
      .update({
        current_path: input.path,
        current_video_title: input.videoTitle ?? null,
        last_seen: new Date().toISOString(),
        page_views: (existing.page_views ?? 0) + 1,
      })
      .eq("id", existing.id);
    return { ok: true };
  }

  await supabaseAdmin.from("visitors").insert({
    session_id: input.sessionId,
    label: `Visitor ${input.sessionId.slice(0, 5).toUpperCase()}`,
    current_path: input.path,
    current_video_title: input.videoTitle ?? null,
    user_agent: input.userAgent ?? null,
    referrer: input.referrer ?? null,
    screen: input.screen ?? null,
  });

  return { ok: true };
}

export async function fetchMessagesForSession(sessionId: string): Promise<PublicMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("popup_messages")
    .select("*")
    .eq("is_active", true)
    .or(`target_session_id.is.null,target_session_id.eq.${sessionId}`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (m) => ({
      id: m.id,
      senderName: m.sender_name,
      body: m.body,
      linkUrl: m.link_url,
      linkLabel: m.link_label,
      avatarUrl: await sign("media", m.avatar_url),
      createdAt: m.created_at,
    })),
  );
}

export async function incrementVideoViews(videoId: string) {
  const { data } = await supabaseAdmin
    .from("videos")
    .select("view_count")
    .eq("id", videoId)
    .maybeSingle();
  if (!data) return { ok: false };
  await supabaseAdmin
    .from("videos")
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq("id", videoId);
  return { ok: true };
}
