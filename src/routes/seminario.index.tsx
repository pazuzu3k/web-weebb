import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/seminario/")({
  component: () => <TerritorioHost pagina="seminario" />,
});
