import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { PublicMessage } from "@/lib/site.server";

const DISMISS_KEY = "vv_dismissed_messages";

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function MessagePopup({ messages }: { messages: PublicMessage[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(readDismissed());
  }, []);

  const message = messages.find((m) => !dismissed.includes(m.id));
  if (!message) return null;

  const dismiss = () => {
    const next = [...dismissed, message.id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next.slice(-50)));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-4 sm:left-auto sm:right-6 sm:w-96">
      <div className="animate-in relative rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-md">
        <button
          onClick={dismiss}
          aria-label="Close message"
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex gap-3">
          {message.avatarUrl ? (
            <img
              src={message.avatarUrl}
              alt={message.senderName}
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-gradient text-sm font-bold text-ember-foreground">
              {message.senderName.slice(0, 1).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 pr-5">
            <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {message.body}
            </p>

            {message.linkUrl && (
              <a
                href={message.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ember-gradient px-4 py-2 text-xs font-bold uppercase tracking-wide text-ember-foreground"
              >
                {message.linkLabel || "Open link"} <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
