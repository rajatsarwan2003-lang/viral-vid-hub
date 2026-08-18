import { createFileRoute } from "@tanstack/react-router";
import { Play, Plus, Flame, TrendingUp } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { VideoRow, type VideoItem } from "@/components/video-row";
import hero from "@/assets/hero.jpg";
import thumb1 from "@/assets/thumb-1.jpg";
import thumb2 from "@/assets/thumb-2.jpg";
import thumb3 from "@/assets/thumb-3.jpg";
import thumb4 from "@/assets/thumb-4.jpg";
import thumb5 from "@/assets/thumb-5.jpg";
import thumb6 from "@/assets/thumb-6.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Viral Videos — Trending Shorts, Dance & Comedy Streaming" },
      {
        name: "description",
        content:
          "Watch the internet's most viral videos in one place — trending dance, comedy, stunts, music and sports shorts, updated daily.",
      },
      { property: "og:title", content: "Viral Videos — Trending Shorts Streaming" },
      {
        property: "og:description",
        content:
          "Trending dance, comedy, stunts, music and sports shorts — streaming free, updated daily.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const trending: VideoItem[] = [
  { title: "Bollywood Song Dance Video", creator: "Rajat Sarwan", views: "2.4M", duration: "0:48", image: thumb1, tag: "#1 Trending" },
  { title: "Street Comedy Gone Wrong", creator: "DesiHasi", views: "1.8M", duration: "1:12", image: thumb2, tag: "Hot" },
  { title: "Midnight Bike Stunt Reel", creator: "RiderRaj", views: "3.1M", duration: "0:36", image: thumb3 },
  { title: "Flame Fried Noodles ASMR", creator: "StreetBites", views: "980K", duration: "2:05", image: thumb4 },
  { title: "Live Concert Crowd Goes Wild", creator: "SoundStage", views: "1.2M", duration: "1:44", image: thumb5 },
  { title: "Last Ball Six — Full Clip", creator: "CricDaily", views: "4.6M", duration: "0:29", image: thumb6, tag: "Viral" },
];

const shorts: VideoItem[] = [
  { title: "Last Ball Six — Full Clip", creator: "CricDaily", views: "4.6M", duration: "0:29", image: thumb6 },
  { title: "Midnight Bike Stunt Reel", creator: "RiderRaj", views: "3.1M", duration: "0:36", image: thumb3 },
  { title: "Bollywood Song Dance Video", creator: "Rajat Sarwan", views: "2.4M", duration: "0:48", image: thumb1 },
  { title: "Live Concert Crowd Goes Wild", creator: "SoundStage", views: "1.2M", duration: "1:44", image: thumb5 },
  { title: "Street Comedy Gone Wrong", creator: "DesiHasi", views: "1.8M", duration: "1:12", image: thumb2 },
  { title: "Flame Fried Noodles ASMR", creator: "StreetBites", views: "980K", duration: "2:05", image: thumb4 },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="relative flex min-h-[78vh] items-end overflow-hidden sm:min-h-[86vh]">
          <img
            src={hero}
            alt="Dancer performing under neon stage lights in the featured viral video"
            width={1920}
            height={1088}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 stage-glow" />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-gradient px-3 py-1 text-[11px] font-bold tracking-widest text-ember-foreground uppercase">
              <Flame className="size-3.5" /> Live
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[0.95] sm:text-6xl md:text-7xl">
              Dance Ka Jung
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              The clip everyone is sharing right now. 2.4 million views in 48 hours — watch the
              full performance before it disappears from your feed.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#feed"
                className="inline-flex items-center gap-2 rounded-full bg-ember-gradient px-6 py-3 text-sm font-bold text-ember-foreground uppercase glow-shadow transition-transform hover:scale-[1.03]"
              >
                <Play className="size-4 fill-current" /> Play now
              </a>
              <a
                href="#feed"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-secondary"
              >
                <Plus className="size-4" /> My list
              </a>
            </div>
          </div>
        </section>

        {/* Rows */}
        <div id="feed" className="mx-auto max-w-7xl pb-8">
          <VideoRow title="Trending Now" items={trending} />
          <VideoRow title="Viral Shorts" items={shorts} />
        </div>

        {/* Stats strip */}
        <section className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-10 sm:grid-cols-4 sm:px-6">
          {[
            { k: "18M+", v: "Monthly views" },
            { k: "4.2K", v: "Viral clips" },
            { k: "600+", v: "Creators" },
            { k: "Daily", v: "New uploads" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border bg-card p-4">
              <p className="font-display text-2xl text-ember">{s.k}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center sm:p-12">
            <div className="absolute inset-0 stage-glow" />
            <div className="relative">
              <TrendingUp className="mx-auto size-8 text-primary" />
              <h2 className="mt-4 text-2xl sm:text-3xl">Got a clip that deserves to blow up?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Upload your video and get featured on the Trending Now row seen by millions.
              </p>
              <a
                href="#feed"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember-gradient px-6 py-3 text-sm font-bold text-ember-foreground uppercase glow-shadow transition-transform hover:scale-[1.03]"
              >
                Upload a video
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-base tracking-wide">
            <span className="text-ember">VIRAL</span> VIDEOS
          </p>
          <p>© {new Date().getFullYear()} Viral Videos. All clips belong to their creators.</p>
        </div>
      </footer>
    </div>
  );
}
