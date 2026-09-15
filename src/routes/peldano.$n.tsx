import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/peldano/$n")({
  component: PeldanoPage,
});

function PeldanoPage() {
  const { n } = Route.useParams();
  return <TerritorioHost pagina="peldano" peldano={n} />;
}