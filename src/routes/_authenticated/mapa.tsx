import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { X, Phone, MessageCircle, Navigation, FileText, SlidersHorizontal } from "lucide-react";
import { lojasQuery } from "@/lib/queries";
import { linkRotaGoogle, linkWaze, linkWhatsApp, STATUS, type Loja } from "@/lib/crm";
import { Filtros, FILTRO_VAZIO, aplicarFiltros } from "@/components/Filtros";
import { LazyMap } from "@/components/LazyMap";
import { StatusBadge } from "@/components/StatusBadge";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/mapa")({
  head: pageHead("Mapa", "Mapa das lojas com pinos coloridos por status."),
  loader: ({ context }) => context.queryClient.ensureQueryData(lojasQuery),
  component: Mapa,
});

function Mapa() {
  const { data: lojas } = useSuspenseQuery(lojasQuery);
  const [f, setF] = useState(FILTRO_VAZIO);
  const [abrirFiltro, setAbrirFiltro] = useState(false);
  const [sel, setSel] = useState<Loja | null>(null);
  const visiveis = useMemo(() => aplicarFiltros(lojas, f), [lojas, f]);

  return (
    <div className="relative h-[calc(100vh-8.5rem)]">
      <LazyMap lojas={visiveis} onSelect={setSel} />
      <div className="absolute inset-x-3 top-3 space-y-2">
        <button onClick={() => setAbrirFiltro(!abrirFiltro)} className="flex h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold shadow-lg">
          <SlidersHorizontal className="size-4" /> Filtros · {visiveis.length} lojas
        </button>
        {abrirFiltro && <div className="rounded-2xl bg-card p-3 shadow-lg"><Filtros lojas={lojas} value={f} onChange={setF} /></div>}
      </div>
      <div className="absolute bottom-3 left-3 flex max-w-[60%] flex-wrap gap-1 rounded-xl bg-card/90 p-2 text-[10px] shadow">
        {STATUS.map((s) => (
          <span key={s.id} className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ backgroundColor: s.cor }} />{s.label}</span>
        ))}
      </div>
      {sel && <ResumoLoja loja={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ResumoLoja({ loja, onClose }: { loja: Loja; onClose: () => void }) {
  const wa = linkWhatsApp(loja.whatsapp || loja.telefone);
  const btn = "flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-muted text-xs font-semibold";
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-card p-5 shadow-2xl">
      <button onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4"><X /></button>
      <h2 className="pr-8 text-xl font-bold">{loja.nome}</h2>
      <p className="text-sm text-muted-foreground">{loja.categoria} · {loja.endereco}</p>
      <div className="mt-2"><StatusBadge status={loja.status} /></div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {loja.telefone ? <a className={btn} href={`tel:${loja.telefone}`}><Phone className="size-5" />Ligar</a> : <span className={`${btn} opacity-40`}><Phone className="size-5" />Ligar</span>}
        {wa ? <a className={btn} href={wa} target="_blank" rel="noreferrer"><MessageCircle className="size-5" />Whats</a> : <span className={`${btn} opacity-40`}><MessageCircle className="size-5" />Whats</span>}
        <a className={btn} href={linkRotaGoogle(loja)} target="_blank" rel="noreferrer"><Navigation className="size-5" />Maps</a>
        <a className={btn} href={linkWaze(loja)} target="_blank" rel="noreferrer"><Navigation className="size-5" />Waze</a>
        <Link className={`${btn} bg-primary text-primary-foreground`} to="/lojas/$id" params={{ id: loja.id }}><FileText className="size-5" />Ficha</Link>
      </div>
    </div>
  );
}
