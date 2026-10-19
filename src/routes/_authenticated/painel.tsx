import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LocateFixed, Plus, Download, Route as RouteIcon } from "lucide-react";
import { lojasQuery, roteiroQuery } from "@/lib/queries";
import { distanciaKm, STATUS } from "@/lib/crm";
import { useGeo } from "@/hooks/useGeo";
import { LojaCard } from "@/components/LojaCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/head";
import { hojeISO } from "@/lib/datas";

export const Route = createFileRoute("/_authenticated/painel")({
  head: pageHead("Início", "Resumo do dia, lojas perto de você e atalhos."),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(lojasQuery), context.queryClient.ensureQueryData(roteiroQuery(hojeISO()))]),
  component: Painel,
});

function Painel() {
  const { data: lojas } = useSuspenseQuery(lojasQuery);
  const { data: roteiro } = useSuspenseQuery(roteiroQuery(hojeISO()));
  const { pos, localizar, carregando } = useGeo();

  const perto = useMemo(() => {
    if (!pos) return [];
    return lojas
      .filter((l) => l.status === "nao_visitada" && !l.fechada && !l.duplicada && l.latitude != null)
      .map((l) => ({ l, d: distanciaKm(pos, { lat: l.latitude!, lng: l.longitude! }) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 10);
  }, [lojas, pos]);

  const pendentes = roteiro.filter((r) => !r.concluida).length;

  return (
    <div className="space-y-6 p-4">
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="text-sm opacity-90">Hoje</p>
        <h1 className="text-3xl font-extrabold">
          {pendentes ? `${pendentes} lojas no seu roteiro` : "Roteiro do dia vazio"}
        </h1>
        <Link to="/roteiro" className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-4 py-2 text-sm font-bold text-primary">
          <RouteIcon className="size-4" /> {pendentes ? "Abrir roteiro" : "Montar roteiro"}
        </Link>
      </section>

      <section className="grid grid-cols-4 gap-2">
        {STATUS.slice(0, 8).map((s) => (
          <Link key={s.id} to="/lojas" search={{ status: s.id }} className="rounded-xl border bg-card p-2 text-center">
            <div className="text-xl font-extrabold">{lojas.filter((l) => l.status === s.id).length}</div>
            <div className="truncate text-[11px] text-muted-foreground">{s.label}</div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Button asChild size="lg" className="h-14"><Link to="/lojas/nova"><Plus /> Nova loja</Link></Button>
        <Button asChild size="lg" variant="secondary" className="h-14"><Link to="/importar"><Download /> Importar</Link></Button>
      </section>

      <section className="space-y-3">
        <Button onClick={localizar} disabled={carregando} size="lg" variant="outline" className="h-14 w-full text-base">
          <LocateFixed /> {carregando ? "Localizando…" : "Perto de mim (não visitadas)"}
        </Button>
        {pos && perto.length === 0 && <p className="text-center text-sm text-muted-foreground">Nenhuma loja não visitada com localização.</p>}
        {perto.map(({ l, d }) => <LojaCard key={l.id} loja={l} distancia={d} />)}
      </section>

      {lojas.length === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          Você ainda não tem lojas. Importe do Google, cadastre manualmente ou carregue dados de exemplo em Ajustes.
        </p>
      )}
    </div>
  );
}
