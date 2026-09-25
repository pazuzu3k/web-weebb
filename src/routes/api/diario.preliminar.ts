import { createFileRoute } from "@tanstack/react-router";
import { sesionActiva } from "@/lib/diario-auth.server";
import { getPreliminar, guardarPreliminar } from "@/lib/diario.server";

export const Route = createFileRoute("/api/diario/preliminar")({
  server: {
    handlers: {
      GET: async () => {
        const file = await getPreliminar();
        if (!file || !file.bytes.byteLength) return new Response("", { status: 404 });
        return new Response(file.bytes, {
          headers: {
            "content-type": "application/pdf",
            "content-length": String(file.bytes.byteLength),
            "cache-control": "private, max-age=0",
            "content-disposition": `inline; filename="${file.nombre.replace(/"/g, "")}"`,
          },
        });
      },
      POST: async ({ request }) => {
        if (!sesionActiva(request)) return Response.json({ ok: false }, { status: 401 });
        try {
          const form = await request.formData();
          const f = form.get("pdf");
          if (!(f instanceof File)) return Response.json({ ok: false }, { status: 400 });
          const ok = await guardarPreliminar({
            mime: f.type || "application/pdf",
            nombre: f.name || "exceso.pdf",
            bytes: new Uint8Array(await f.arrayBuffer()),
          });
          return Response.json({ ok }, { status: ok ? 200 : 400 });
        } catch (err) {
          console.error("[preliminar]", err);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
