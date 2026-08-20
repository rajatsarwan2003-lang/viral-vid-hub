import { Play, Eye } from "lucide-react";

export type VideoItem = {
  id: string;
  title: string;
  creator: string;
  views: string;
  duration: string;
  image: string;
  tag?: string;
};

function VideoCard({ item, onSelect }: { item: VideoItem; onSelect?: () => void }) {
  return (
    <article
      onClick={onSelect}
      className={`group w-[46vw] shrink-0 sm:w-52 md:w-56 ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card ring-1 ring-border transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-primary/60 group-hover:glow-shadow">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          width={640}
          height={960}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent opacity-90" />

        {item.tag && (
          <span className="absolute left-2 top-2 rounded-full bg-ember-gradient px-2 py-0.5 text-[10px] font-bold tracking-wider text-ember-foreground uppercase">
            {item.tag}
          </span>
        )}

        <span className="absolute right-2 top-2 rounded-md bg-background/70 px-1.5 py-0.5 text-[11px] text-foreground backdrop-blur-sm">
          {item.duration}
        </span>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-ember-gradient glow-shadow">
            <Play className="size-5 fill-current text-ember-foreground" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm leading-tight text-foreground">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Eye className="size-3" /> {item.views} · {item.creator}
          </p>
        </div>
      </div>
    </article>
  );
}

export function VideoRow({ title, items }: { title: string; items: VideoItem[] }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 px-4 text-lg sm:px-6 sm:text-xl">{title}</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6">
        {items.map((item) => (
          <div key={item.title} className="snap-start">
            <VideoCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
