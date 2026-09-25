import { createFileRoute } from "@tanstack/react-router";
import { sesionActiva } from "@/lib/diario-auth.server";
import { borrarDiario, crearDiario, editarDiario, hayPreliminar, listDiario, lugarDe } from "@/lib/diario.server";

function negar() {
  return Response.json({ ok: false }, { status: 401 });
}

export const Route = createFileRoute("/api/diario/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const lugar = lugarDe(new URL(request.url).searchParams.get("lugar"));
          const entradas = await listDiario(lugar);
          const preliminar = lugar === "peldano-55" ? await hayPreliminar() : false;
          return Response.json({ entradas, preliminar });
        } catch {
          return Response.json({ entradas: [] });
        }
      },
      POST: async ({ request }) => {
        if (!sesionActiva(request)) return negar();
        try {
          const form = await request.formData();
          const titulo = String(form.get("titulo") || "");
          const texto = String(form.get("texto") || "");
          const files = form.getAll("archivos");
          const archivos: { mime: string; nombre: string; bytes: Uint8Array }[] =
            [];
          for (const f of files) {
            if (!(f instanceof File)) continue;
            const buf = new Uint8Array(await f.arrayBuffer());
            archivos.push({
              mime: f.type || "application/octet-stream",
              nombre: f.name || "adjunto",
              bytes: buf,
            });
          }
          const entrada = await crearDiario({
            titulo,
            texto,
            lugar: String(form.get("lugar") || ""),
            archivos,
          });
          return Response.json({ entrada });
        } catch (err) {
          console.error("[diario]", err);
          const msg = err instanceof Error ? err.message : "error";
          const status = msg === "vacio" ? 400 : 500;
          return Response.json({ ok: false }, { status });
        }
      },
      PATCH: async ({ request }) => {
        if (!sesionActiva(request)) return negar();
        try {
          const body = await request.json();
          const id = Number(body?.id);
          if (!id) return Response.json({ ok: false }, { status: 400 });
          const entrada = await editarDiario(id, {
            titulo: body?.titulo,
            texto: body?.texto,
          });
          if (!entrada) return Response.json({ ok: false }, { status: 404 });
          return Response.json({ entrada });
        } catch (err) {
          console.error("[diario]", err);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
      DELETE: async ({ request }) => {
        if (!sesionActiva(request)) return negar();
        const url = new URL(request.url);
        const id = Number(url.searchParams.get("id"));
        if (!id) return Response.json({ ok: false }, { status: 400 });
        try {
          const ok = await borrarDiario(id);
          return Response.json({ ok }, { status: ok ? 200 : 404 });
        } catch (err) {
          console.error("[diario]", err);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
