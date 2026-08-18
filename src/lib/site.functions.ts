import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  fetchMessagesForSession,
  fetchPublicVideos,
  incrementVideoViews,
  upsertVisitor,
} from "./site.server";

export const getPublicVideos = createServerFn({ method: "GET" }).handler(async () => {
  return fetchPublicVideos();
});

export const trackVisitor = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        sessionId: z.string().min(6).max(80),
        path: z.string().max(300),
        videoTitle: z.string().max(200).nullable().optional(),
        userAgent: z.string().max(400).nullable().optional(),
        referrer: z.string().max(400).nullable().optional(),
        screen: z.string().max(40).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => upsertVisitor(data));

export const getMyMessages = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ sessionId: z.string().min(6).max(80) }).parse(data))
  .handler(async ({ data }) => fetchMessagesForSession(data.sessionId));

export const registerView = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ videoId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => incrementVideoViews(data.videoId));
