import { createFileRoute } from "@tanstack/react-router";
import { bumpPageview, getPageview } from "@/lib/visitas.server";

export const Route = createFileRoute("/api/visitas")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path") || "/";
        const n = await getPageview(path);
        return Response.json({ path, n });
      },
      POST: async ({ request }) => {
        let path = "/";
        try {
          const body = (await request.json()) as { path?: string };
          if (typeof body.path === "string") path = body.path;
        } catch {
          /* empty body */
        }
        const n = await bumpPageview(path);
        return Response.json({ path, n });
      },
    },
  },
});
