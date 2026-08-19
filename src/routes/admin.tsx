import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Trash2, Upload, Users, MessageSquare, ImageOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { claimAdminAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel — Viral Videos" },
      {
        name: "description",
        content:
          "Admin control room for Viral Videos: upload real videos, watch live visitors and send them direct messages.",
      },
      { property: "og:title", content: "Admin Panel — Viral Videos" },
      { property: "og:description", content: "Upload videos, track visitors, send messages." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type VideoRow = {
  id: string;
  title: string;
  category: string;
  creator: string | null;
  duration: string | null;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  video_url: string;
  thumbnail_url: string | null;
};

type VisitorRow = {
  id: string;
  session_id: string;
  label: string | null;
  current_path: string | null;
  current_video_title: string | null;
  page_views: number;
  last_seen: string;
};

type MessageRow = {
  id: string;
  sender_name: string;
  avatar_url: string | null;
  body: string;
  link_url: string | null;
  link_label: string | null;
  target_session_id: string | null;
  is_active: boolean;
  created_at: string;
};

const inputCls =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ember-gradient px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-ember-foreground disabled:opacity-50";
const cardCls = "rounded-2xl border border-border bg-card p-5";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
}

async function uploadTo(bucket: "videos" | "media", file: File) {
  const path = `${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

function AdminPage() {
  const claim = useServerFn(claimAdminAccess);

  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);

  const refresh = useCallback(async () => {
    const [v, vis, msg] = await Promise.all([
      supabase.from("videos").select("*").order("created_at", { ascending: false }),
      supabase.from("visitors").select("*").order("last_seen", { ascending: false }).limit(60),
      supabase.from("popup_messages").select("*").order("created_at", { ascending: false }),
    ]);
    setVideos((v.data ?? []) as VideoRow[]);
    setVisitors((vis.data ?? []) as VisitorRow[]);
    setMessages((msg.data ?? []) as MessageRow[]);
  }, []);

  const boot = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setSignedIn(false);
      setIsAdmin(false);
      setBooting(false);
      return;
    }
    setSignedIn(true);
    try {
      const res = await claim({ data: undefined });
      setIsAdmin(res.isAdmin);
      if (res.isAdmin) await refresh();
    } catch {
      setIsAdmin(false);
    }
    setBooting(false);
  }, [claim, refresh]);

  useEffect(() => {
    void boot();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void boot();
    });
    return () => sub.subscription.unsubscribe();
  }, [boot]);

  useEffect(() => {
    if (!isAdmin) return;
    const t = window.setInterval(() => void refresh(), 10000);
    return () => window.clearInterval(t);
  }, [isAdmin, refresh]);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) setStatus(error.message);
    else setSent(true);
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className={`w-full max-w-sm ${cardCls}`}>
          <h1 className="text-2xl">Admin login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Apna email daalo, magic link aa jayega. Link se seedha admin panel khulega.
          </p>
          {sent ? (
            <p className="mt-5 rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
              Link bhej diya <strong>{email}</strong> par. Inbox check karo.
            </p>
          ) : (
            <form onSubmit={sendMagicLink} className="mt-5 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputCls}
              />
              <button type="submit" className={`${btnCls} w-full`}>
                <Mail className="size-4" /> Send magic link
              </button>
            </form>
          )}
          {status && <p className="mt-3 text-sm text-destructive">{status}</p>}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className={`w-full max-w-sm text-center ${cardCls}`}>
          <h1 className="text-xl">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Is account ko admin access nahi hai.
          </p>
          <button
            onClick={() => void supabase.auth.signOut()}
            className="mt-5 text-sm text-primary underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="font-display text-lg tracking-wide">
            <span className="text-ember">ADMIN</span> PANEL
          </p>
          <button
            onClick={() => void supabase.auth.signOut()}
            className="text-xs text-muted-foreground underline"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <UploadVideo onDone={refresh} />
        <VideoList videos={videos} onDone={refresh} />
        <VisitorList visitors={visitors} />
        <MessageComposer visitors={visitors} messages={messages} onDone={refresh} />
      </main>
    </div>
  );
}

function UploadVideo({ onDone }: { onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const video = fd.get("video") as File | null;
    if (!video || video.size === 0) {
      setMsg("Video file choose karo.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const videoPath = await uploadTo("videos", video);
      const thumb = fd.get("thumbnail") as File | null;
      const thumbPath = thumb && thumb.size > 0 ? await uploadTo("media", thumb) : null;

      const { error } = await supabase.from("videos").insert({
        title: String(fd.get("title") ?? "").trim(),
        description: String(fd.get("description") ?? "").trim() || null,
        category: String(fd.get("category") ?? "Trending").trim() || "Trending",
        creator: String(fd.get("creator") ?? "").trim() || null,
        duration: String(fd.get("duration") ?? "").trim() || null,
        video_url: videoPath,
        thumbnail_url: thumbPath,
        is_featured: fd.get("is_featured") === "on",
        is_published: fd.get("is_published") === "on",
      });
      if (error) throw new Error(error.message);
      form.reset();
      setMsg("Video upload ho gaya ✅");
      await onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cardCls}>
      <h2 className="flex items-center gap-2 text-lg">
        <Upload className="size-4 text-primary" /> Upload video
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input name="title" required placeholder="Title" className={inputCls} />
        <textarea name="description" rows={2} placeholder="Description" className={inputCls} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="category" placeholder="Category (Trending)" className={inputCls} />
          <input name="creator" placeholder="Creator" className={inputCls} />
          <input name="duration" placeholder="Duration (0:48)" className={inputCls} />
        </div>
        <label className="block text-xs text-muted-foreground">
          Video file
          <input name="video" type="file" accept="video/*" className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Thumbnail (optional)
          <input name="thumbnail" type="file" accept="image/*" className={`${inputCls} mt-1`} />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_featured" /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_published" defaultChecked /> Published
          </label>
        </div>
        <button disabled={busy} className={btnCls}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Uploading" : "Upload"}
        </button>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </form>
    </section>
  );
}

function VideoList({ videos, onDone }: { videos: VideoRow[]; onDone: () => Promise<void> }) {
  const remove = async (v: VideoRow) => {
    await supabase.storage.from("videos").remove([v.video_url]);
    if (v.thumbnail_url) await supabase.storage.from("media").remove([v.thumbnail_url]);
    await supabase.from("videos").delete().eq("id", v.id);
    await onDone();
  };

  const toggle = async (v: VideoRow, field: "is_published" | "is_featured") => {
    await supabase
      .from("videos")
      .update({ [field]: !v[field] })
      .eq("id", v.id);
    await onDone();
  };

  return (
    <section className={cardCls}>
      <h2 className="text-lg">Videos ({videos.length})</h2>
      <ul className="mt-4 space-y-3">
        {videos.length === 0 && (
          <li className="text-sm text-muted-foreground">Abhi koi video nahi hai.</li>
        )}
        {videos.map((v) => (
          <li
            key={v.id}
            className="flex items-start justify-between gap-3 rounded-xl bg-secondary/30 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{v.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {v.category} · {v.view_count} views · {v.creator ?? "—"}
              </p>
              <div className="mt-2 flex gap-2 text-[11px]">
                <button
                  onClick={() => void toggle(v, "is_published")}
                  className="rounded-full border border-border px-2 py-0.5"
                >
                  {v.is_published ? "Published" : "Hidden"}
                </button>
                <button
                  onClick={() => void toggle(v, "is_featured")}
                  className="rounded-full border border-border px-2 py-0.5"
                >
                  {v.is_featured ? "Featured" : "Not featured"}
                </button>
              </div>
            </div>
            <button
              onClick={() => void remove(v)}
              aria-label="Delete video"
              className="rounded-full p-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VisitorList({ visitors }: { visitors: VisitorRow[] }) {
  const online = (iso: string) => Date.now() - new Date(iso).getTime() < 60000;
  return (
    <section className={cardCls}>
      <h2 className="flex items-center gap-2 text-lg">
        <Users className="size-4 text-primary" /> Live visitors ({visitors.filter((v) => online(v.last_seen)).length} online)
      </h2>
      <ul className="mt-4 space-y-2">
        {visitors.length === 0 && (
          <li className="text-sm text-muted-foreground">Koi visitor nahi mila.</li>
        )}
        {visitors.map((v) => (
          <li key={v.id} className="rounded-xl bg-secondary/30 p-3">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <span
                className={`size-2 rounded-full ${online(v.last_seen) ? "bg-green-500" : "bg-muted-foreground"}`}
              />
              {v.label ?? v.session_id.slice(0, 6)}
              <span className="text-xs text-muted-foreground">({v.session_id.slice(0, 8)})</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Page: {v.current_path ?? "—"}
              {v.current_video_title ? ` · Watching: ${v.current_video_title}` : ""} ·{" "}
              {v.page_views} views
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MessageComposer({
  visitors,
  messages,
  onDone,
}: {
  visitors: VisitorRow[];
  messages: MessageRow[];
  onDone: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setMsg(null);
    try {
      const avatar = fd.get("avatar") as File | null;
      const avatarPath = avatar && avatar.size > 0 ? await uploadTo("media", avatar) : null;
      const target = String(fd.get("target") ?? "");

      const { error } = await supabase.from("popup_messages").insert({
        sender_name: String(fd.get("sender_name") ?? "Admin").trim() || "Admin",
        body: String(fd.get("body") ?? "").trim(),
        link_url: String(fd.get("link_url") ?? "").trim() || null,
        link_label: String(fd.get("link_label") ?? "").trim() || null,
        avatar_url: avatarPath,
        target_session_id: target || null,
        is_active: true,
      });
      if (error) throw new Error(error.message);
      form.reset();
      setMsg("Message live ho gaya ✅");
      await onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const removeMessage = async (m: MessageRow) => {
    if (m.avatar_url) await supabase.storage.from("media").remove([m.avatar_url]);
    await supabase.from("popup_messages").delete().eq("id", m.id);
    await onDone();
  };

  const removeAvatar = async (m: MessageRow) => {
    if (m.avatar_url) await supabase.storage.from("media").remove([m.avatar_url]);
    await supabase.from("popup_messages").update({ avatar_url: null }).eq("id", m.id);
    await onDone();
  };

  const toggleActive = async (m: MessageRow) => {
    await supabase.from("popup_messages").update({ is_active: !m.is_active }).eq("id", m.id);
    await onDone();
  };

  return (
    <section className={cardCls}>
      <h2 className="flex items-center gap-2 text-lg">
        <MessageSquare className="size-4 text-primary" /> Send message
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input name="sender_name" placeholder="Sender name (Admin)" className={inputCls} />
        <textarea name="body" required rows={3} placeholder="Message text..." className={inputCls} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="link_url" type="url" placeholder="https://link.com" className={inputCls} />
          <input name="link_label" placeholder="Button text (Open)" className={inputCls} />
        </div>
        <label className="block text-xs text-muted-foreground">
          Profile photo (optional)
          <input name="avatar" type="file" accept="image/*" className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Kisko bhejna hai
          <select name="target" className={`${inputCls} mt-1`} defaultValue="">
            <option value="">Sabko (all visitors)</option>
            {visitors.map((v) => (
              <option key={v.id} value={v.session_id}>
                {v.label ?? v.session_id.slice(0, 8)} — {v.current_path ?? "—"}
              </option>
            ))}
          </select>
        </label>
        <button disabled={busy} className={btnCls}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
          {busy ? "Sending" : "Send"}
        </button>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </form>

      <ul className="mt-6 space-y-3 border-t border-border pt-4">
        {messages.map((m) => (
          <li key={m.id} className="flex items-start gap-3 rounded-xl bg-secondary/30 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                {m.sender_name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {m.target_session_id ? `→ ${m.target_session_id.slice(0, 8)}` : "→ all"}
                </span>
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.body}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <button
                  onClick={() => void toggleActive(m)}
                  className="rounded-full border border-border px-2 py-0.5"
                >
                  {m.is_active ? "Active" : "Paused"}
                </button>
                {m.avatar_url && (
                  <button
                    onClick={() => void removeAvatar(m)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5"
                  >
                    <ImageOff className="size-3" /> Delete photo
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => void removeMessage(m)}
              aria-label="Delete message"
              className="rounded-full p-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
