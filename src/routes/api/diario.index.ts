import { createFileRoute } from "@tanstack/react-router";
import { borrarDiario, crearDiario, listDiario } from "@/lib/diario.server";

export const Route = createFileRoute("/api/diario/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const entradas = await listDiario();
          return Response.json({ entradas });
        } catch {
          return Response.json({ entradas: [] });
        }
      },
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
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
          const entrada = await crearDiario({ texto, archivos });
          return Response.json({ entrada });
        } catch (err) {
          console.error("[diario]", err);
          const msg = err instanceof Error ? err.message : "error";
          const status = msg === "vacio" ? 400 : 500;
          return Response.json({ ok: false }, { status });
        }
      },
      DELETE: async ({ request }) => {
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
