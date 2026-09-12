import { createFileRoute } from "@tanstack/react-router";
import { countPresence, heartbeat } from "@/lib/visitas.server";

export const Route = createFileRoute("/api/presencia")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path") || "/";
        const n = await countPresence(path);
        return Response.json({ path, n });
      },
      POST: async ({ request }) => {
        let sessionKey = "";
        let path = "/";
        try {
          const body = (await request.json()) as {
            sessionKey?: string;
            path?: string;
          };
          if (typeof body.sessionKey === "string") sessionKey = body.sessionKey;
          if (typeof body.path === "string") path = body.path;
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        await heartbeat(sessionKey, path);
        const n = await countPresence(path);
        return Response.json({ ok: true, n });
      },
    },
  },
});
