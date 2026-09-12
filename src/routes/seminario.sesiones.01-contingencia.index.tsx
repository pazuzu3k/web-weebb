import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/seminario/sesiones/01-contingencia/")({
  component: () => (
    <TerritorioHost pagina="minuta" sesion="01-contingencia" />
  ),
});
