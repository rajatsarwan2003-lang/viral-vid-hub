import { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";

const links = ["Home", "Trending", "Shorts", "Categories", "New & Hot"];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md border-b" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <a href="/" className="font-display text-xl tracking-wide sm:text-2xl">
          <span className="text-ember">VIRAL</span>{" "}
          <span className="tracking-[0.3em] text-foreground">VIDEOS</span>
        </a>

        <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {links.map((l, i) => (
            <li key={l}>
              <a
                href="#feed"
                className={`transition-colors hover:text-foreground ${
                  i === 0 ? "text-foreground" : ""
                }`}
              >
                {l}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Search"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="size-5" />
          </button>
          <button
            aria-label="Notifications"
            className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:block"
          >
            <Bell className="size-5" />
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>

      {open && (
        <ul className="space-y-1 border-t bg-background/95 px-4 py-3 text-sm backdrop-blur-md md:hidden">
          {links.map((l) => (
            <li key={l}>
              <a
                href="#feed"
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
