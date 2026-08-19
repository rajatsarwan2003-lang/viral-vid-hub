import { useEffect, useState } from "react";

import { getMyMessages, trackVisitor } from "@/lib/site.functions";
import type { PublicMessage } from "@/lib/site.server";

const KEY = "vv_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function useVisitorTracking(currentVideoTitle: string | null) {
  const [messages, setMessages] = useState<PublicMessage[]>([]);

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    let cancelled = false;

    const ping = () => {
      void trackVisitor({
        data: {
          sessionId,
          path: window.location.pathname,
          videoTitle: currentVideoTitle,
          userAgent: navigator.userAgent.slice(0, 400),
          referrer: document.referrer.slice(0, 400) || null,
          screen: `${window.screen.width}x${window.screen.height}`,
        },
      }).catch(() => undefined);
    };

    const pull = () => {
      void getMyMessages({ data: { sessionId } })
        .then((list) => {
          if (!cancelled) setMessages(list);
        })
        .catch(() => undefined);
    };

    ping();
    pull();
    const a = window.setInterval(ping, 20000);
    const b = window.setInterval(pull, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, [currentVideoTitle]);

  return messages;
}
