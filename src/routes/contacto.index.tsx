import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/contacto/")({
  component: () => <TerritorioHost pagina="contacto" />,
});
