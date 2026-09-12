import { createFileRoute } from "@tanstack/react-router";
import { TerritorioHost } from "@/components/territorio-host";

export const Route = createFileRoute("/cota/$n")({
  component: CotaPage,
});

function CotaPage() {
  const { n } = Route.useParams();
  return <TerritorioHost pagina="cota" cota={n} />;
}
