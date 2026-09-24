import { createFileRoute } from "@tanstack/react-router";
import {
  cookieCerrar,
  cookieSesion,
  credencialesValidas,
  esHttps,
  sesionActiva,
} from "@/lib/diario-auth.server";

export const Route = createFileRoute("/api/diario/sesion")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ ok: sesionActiva(request) });
      },
      POST: async ({ request }) => {
        let user = "";
        let pass = "";
        try {
          const body = (await request.json()) as { user?: string; pass?: string };
          user = String(body.user || "").trim();
          pass = String(body.pass || "");
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        if (!credencialesValidas(user, pass)) {
          return Response.json({ ok: false }, { status: 401 });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": cookieSesion(esHttps(request)),
          },
        });
      },
      DELETE: async ({ request }) => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": cookieCerrar(esHttps(request)),
          },
        });
      },
    },
  },
});
