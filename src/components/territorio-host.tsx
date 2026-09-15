import { useEffect, useRef } from "react";

type Props = {
  pagina: string;
  cota?: string;
  sesion?: string;
  letra?: string;
  peldano?: string;
};

export function TerritorioHost({ pagina, cota, sesion, letra, peldano }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    let stop: undefined | (() => void);
    void import("@/territorio/territorio.js").then((mod) => {
      if (!alive || !ref.current) return;
      const maybe = mod.boot(ref.current);
      if (typeof maybe === "function") stop = maybe;
    });
    return () => {
      alive = false;
      stop?.();
    };
  }, [pagina, cota, sesion, letra, peldano]);

  return (
    <div
      id="territorio"
      ref={ref}
      data-pagina={pagina}
      data-cota={cota ?? ""}
      data-sesion={sesion ?? ""}
      data-letra={letra ?? ""}
      data-peldano={peldano ?? ""}
      data-strato={pagina === "cota" ? "vacio" : ""}
    />
  );
}