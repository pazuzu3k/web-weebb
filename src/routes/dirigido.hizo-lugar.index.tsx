import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/dirigido/hizo-lugar/")({
  component: () => <TerritorioHost pagina="hizo-lugar" />,
});
