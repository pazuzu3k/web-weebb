import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/letra/$id")({
  component: LetraPage,
});

function LetraPage() {
  const { id } = Route.useParams();
  return <TerritorioHost pagina="letra" letra={id} />;
}