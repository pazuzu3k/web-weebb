import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/antipodas/")({
  component: () => <TerritorioHost pagina="antipodas" />,
});
