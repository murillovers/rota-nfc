import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { lojasQuery } from "@/lib/queries";
import { distanciaKm, PRIORIDADES } from "@/lib/crm";
import { Filtros, FILTRO_VAZIO, aplicarFiltros } from "@/components/Filtros";
import { LojaCard } from "@/components/LojaCard";
import { useGeo } from "@/hooks/useGeo";
import { pageHead } from "@/lib/head";

type Ordem = "prioridade" | "potencial" | "distancia";

export const Route = createFileRoute("/_authenticated/lojas/")({
  head: pageHead("Lojas", "Lista de lojas com filtros e ordenação."),
  validateSearch: (s: Record<string, unknown>) => ({ status: typeof s.status === "string" ? s.status : undefined }),
  loader: ({ context }) => context.queryClient.ensureQueryData(lojasQuery),
  component: Lista,
});

function Lista() {
  const { status } = Route.useSearch();
  const { data: lojas } = useSuspenseQuery(lojasQuery);
  const [f, setF] = useState({ ...FILTRO_VAZIO, status: status ?? "" });
  const [ordem, setOrdem] = useState<Ordem>("prioridade");
  const { pos, localizar } = useGeo();

  const lista = useMemo(() => {
    const base = aplicarFiltros(lojas, f).map((l) => ({
      l, d: pos && l.latitude != null ? distanciaKm(pos, { lat: l.latitude, lng: l.longitude! }) : undefined,
    }));
    const pr = (id: string) => PRIORIDADES.find((p) => p.id === id)?.ordem ?? 9;
    return base.sort((a, b) =>
      ordem === "potencial" ? Number(b.l.potencial) - Number(a.l.potencial)
      : ordem === "distancia" ? (a.d ?? 1e9) - (b.d ?? 1e9)
      : pr(a.l.prioridade) - pr(b.l.prioridade) || Number(b.l.potencial) - Number(a.l.potencial),
    );
  }, [lojas, f, ordem, pos]);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Lojas <span className="text-muted-foreground">({lista.length})</span></h1>
        <Link to="/lojas/nova" className="flex h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"><Plus className="size-4" />Nova</Link>
      </div>
      <Filtros lojas={lojas} value={f} onChange={setF} />
      <div className="flex gap-2">
        {(["prioridade", "potencial", "distancia"] as Ordem[]).map((o) => (
          <button
            key={o}
            onClick={() => { setOrdem(o); if (o === "distancia" && !pos) localizar(); }}
            className={`h-9 flex-1 rounded-full border text-sm font-medium capitalize ${ordem === o ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {o === "distancia" ? "Distância" : o}
          </button>
        ))}
      </div>
      {lista.map(({ l, d }) => <LojaCard key={l.id} loja={l} distancia={d} />)}
      {lista.length === 0 && <p className="py-10 text-center text-muted-foreground">Nenhuma loja encontrada.</p>}
    </div>
  );
}
