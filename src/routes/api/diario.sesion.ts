import { createFileRoute } from "@tanstack/react-router";
import {
  cookieCerrar,
  cookieSesion,
  credencialesValidas,
  esHttps,
  sesionUsuario,
} from "@/lib/diario-auth.server";
import {
  hayOtraSesionDiario,
  marcarSesionDiario,
  soltarSesionDiario,
} from "@/lib/visitas.server";

async function estado(request: Request) {
  const user = sesionUsuario(request);
  if (!user) return { ok: false, otro: false };
  await marcarSesionDiario(user);
  const otro = await hayOtraSesionDiario(user);
  return { ok: true, otro };
}

export const Route = createFileRoute("/api/diario/sesion")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json(await estado(request));
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
        await marcarSesionDiario(user);
        const otro = await hayOtraSesionDiario(user);
        return new Response(JSON.stringify({ ok: true, otro }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": cookieSesion(user, esHttps(request)),
          },
        });
      },
      DELETE: async ({ request }) => {
        const user = sesionUsuario(request);
        if (user) await soltarSesionDiario(user);
        return new Response(JSON.stringify({ ok: true, otro: false }), {
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