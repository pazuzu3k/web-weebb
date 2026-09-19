import { createFileRoute } from "@tanstack/react-router";
import { getArchivo } from "@/lib/diario.server";

export const Route = createFileRoute("/api/diario/archivo/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        const file = await getArchivo(id);
        if (!file || !file.bytes.byteLength) {
          return new Response("", { status: 404 });
        }
        const headers = new Headers({
          "content-type": file.mime,
          "content-length": String(file.bytes.byteLength),
          "cache-control": "public, max-age=3600",
          "content-disposition":
            file.mime === "application/pdf"
              ? `inline; filename="${file.nombre.replace(/"/g, "")}"`
              : "inline",
        });
        return new Response(file.bytes, { headers });
      },
    },
  },
});
