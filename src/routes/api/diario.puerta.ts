import { createFileRoute } from "@tanstack/react-router";
import { clavePuerta, esHttps } from "@/lib/diario-auth.server";

const COOKIE = "smioochy_puerta";

function abierta(request: Request) {
  const raw = request.headers.get("cookie") || "";
  return /(?:^|;\s*)smioochy_puerta=1(?:;|$)/.test(raw);
}

function cookiePuerta(secure: boolean) {
  const parts = [`${COOKIE}=1`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=43200"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export const Route = createFileRoute("/api/diario/puerta")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ ok: abierta(request) });
      },
      POST: async ({ request }) => {
        let clave = "";
        try {
          const body = (await request.json()) as { clave?: string };
          clave = String(body.clave || "");
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        if (!clavePuerta(clave)) return Response.json({ ok: false }, { status: 401 });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": cookiePuerta(esHttps(request)),
          },
        });
      },
    },
  },
});
