import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Wand2, Navigation, X, Check, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lojasQuery, roteiroQuery } from "@/lib/queries";
import { CAXIAS, distanciaKm, linkWaze, ordenarPorProximidade } from "@/lib/crm";
import { hojeISO } from "@/lib/datas";
import { useGeo } from "@/hooks/useGeo";
import { LazyMap } from "@/components/LazyMap";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/roteiro")({
  head: pageHead("Roteiro do dia", "Monte a agenda de prospecção do dia ordenada por proximidade."),
  loader: ({ context }) => context.queryClient.ensureQueryData(lojasQuery),
  component: Roteiro,
});

function Roteiro() {
  const qc = useQueryClient();
  const [data, setData] = useState(hojeISO());
  const { data: lojas } = useSuspenseQuery(lojasQuery);
  const { data: itens = [], isLoading } = useQuery(roteiroQuery(data));
  const { pos, localizar, carregando } = useGeo();
  const [busca, setBusca] = useState("");

  const recarregar = () => qc.invalidateQueries({ queryKey: ["roteiro", data] });
  const idsNoRoteiro = new Set(itens.map((i) => i.loja_id));
  const sugestoes = useMemo(() => {
    const b = busca.trim().toLowerCase();
    if (!b) return [];
    return lojas.filter((l) => !idsNoRoteiro.has(l.id) && l.nome.toLowerCase().includes(b)).slice(0, 6);
  }, [busca, lojas, itens]);

  async function adicionar(lojaId: string) {
    const { error } = await supabase.from("roteiro_dia").insert({ loja_id: lojaId, data, ordem: itens.length });
    if (error) return toast.error(error.message);
    setBusca(""); recarregar();
  }
  async function adicionarProximas() {
    const origem = pos ?? (await localizar()) ?? CAXIAS;
    const candidatas = lojas
      .filter((l) => !idsNoRoteiro.has(l.id) && !l.fechada && !l.duplicada && l.latitude != null && ["nao_visitada", "retornar", "interessada"].includes(l.status))
      .sort((a, b) => distanciaKm(origem, { lat: a.latitude!, lng: a.longitude! }) - distanciaKm(origem, { lat: b.latitude!, lng: b.longitude! }))
      .slice(0, 8);
    if (!candidatas.length) return toast.info("Nenhuma loja próxima disponível");
    const { error } = await supabase.from("roteiro_dia").insert(candidatas.map((l, i) => ({ loja_id: l.id, data, ordem: itens.length + i })));
    if (error) return toast.error(error.message);
    toast.success(`${candidatas.length} lojas próximas adicionadas`);
    recarregar();
  }
  async function salvarOrdem(ids: string[]) {
    await Promise.all(ids.map((id, i) => supabase.from("roteiro_dia").update({ ordem: i }).eq("id", id)));
    recarregar();
  }
  async function otimizar() {
    const origem = pos ?? (await localizar()) ?? CAXIAS;
    const ordenado = ordenarPorProximidade(origem, itens.map((i) => ({ ...i, latitude: i.loja.latitude, longitude: i.loja.longitude })));
    await salvarOrdem(ordenado.map((i) => i.id));
    toast.success("Roteiro ordenado por proximidade");
  }
  async function mover(idx: number, dir: -1 | 1) {
    const ids = itens.map((i) => i.id);
    const j = idx + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    await salvarOrdem(ids);
  }
  async function remover(id: string) {
    await supabase.from("roteiro_dia").delete().eq("id", id); recarregar();
  }
  async function concluir(id: string, v: boolean) {
    await supabase.from("roteiro_dia").update({ concluida: v }).eq("id", id); recarregar();
  }

  const pendentes = itens.filter((i) => !i.concluida && i.loja.latitude != null);
  const totalKm = useMemo(() => {
    let km = 0; let p = pos;
    for (const i of pendentes) {
      const q = { lat: i.loja.latitude!, lng: i.loja.longitude! };
      if (p) km += distanciaKm(p, q);
      p = q;
    }
    return km;
  }, [pendentes, pos]);
  const linkGoogle = useMemo(() => {
    if (!pendentes.length) return null;
    const pts = pendentes.map((i) => `${i.loja.latitude},${i.loja.longitude}`);
    const destino = pts[pts.length - 1];
    const meio = pts.slice(0, -1).slice(0, 9).join("|");
    return `https://www.google.com/maps/dir/?api=1&destination=${destino}${meio ? `&waypoints=${encodeURIComponent(meio)}` : ""}&travelmode=driving`;
  }, [pendentes]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Roteiro</h1>
        <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-11 w-auto" />
      </div>

      <div className="h-64 overflow-hidden rounded-2xl border">
        <LazyMap
          lojas={pendentes.map((i) => i.loja)} numerar minhaPos={pos}
          rota={[...(pos ? [pos] : []), ...pendentes.map((i) => ({ lat: i.loja.latitude!, lng: i.loja.longitude! }))]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button className="h-12" onClick={otimizar} disabled={itens.length < 2 || carregando}><Wand2 /> Ordenar por proximidade</Button>
        <Button className="h-12" variant="secondary" onClick={adicionarProximas} disabled={carregando}><Plus /> Lojas perto de mim</Button>
        {linkGoogle && <Button asChild className="h-12" variant="outline"><a href={linkGoogle} target="_blank" rel="noreferrer"><Navigation /> Google Maps</a></Button>}
        {pendentes[0] && <Button asChild className="h-12" variant="outline"><a href={linkWaze(pendentes[0].loja)} target="_blank" rel="noreferrer"><Navigation /> Waze (próxima)</a></Button>}
      </div>
      {pendentes.length > 0 && (
        <p className="text-sm text-muted-foreground">{pendentes.length} paradas · ~{totalKm.toFixed(1)} km em linha reta{pendentes.length > 10 && " · Google Maps abre as 10 primeiras"}</p>
      )}

      <div className="relative">
        <Input placeholder="Adicionar loja ao roteiro…" className="h-12" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {sugestoes.length > 0 && (
          <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border bg-popover shadow-lg">
            {sugestoes.map((l) => (
              <button key={l.id} onClick={() => adicionar(l.id)} className="block w-full px-4 py-3 text-left text-sm hover:bg-muted">
                <b>{l.nome}</b> <span className="text-muted-foreground">· {l.bairro}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && <p className="text-center text-muted-foreground">Carregando…</p>}
      {!isLoading && itens.length === 0 && <p className="py-6 text-center text-muted-foreground">Nenhuma loja neste dia. Adicione acima ou toque em "Lojas perto de mim".</p>}
      <ol className="space-y-2">
        {itens.map((i, idx) => (
          <li key={i.id} className={`flex items-center gap-3 rounded-2xl border bg-card p-3 ${i.concluida ? "opacity-50" : ""}`}>
            <button onClick={() => concluir(i.id, !i.concluida)} aria-label="Concluir" className={`grid size-10 shrink-0 place-items-center rounded-full border-2 font-bold ${i.concluida ? "border-success bg-success text-success-foreground" : "border-primary text-primary"}`}>
              {i.concluida ? <Check className="size-5" /> : idx + 1}
            </button>
            <Link to="/lojas/$id" params={{ id: i.loja_id }} className="min-w-0 flex-1">
              <p className="truncate font-bold">{i.loja.nome}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><StatusBadge status={i.loja.status} />{i.loja.bairro}</div>
            </Link>
            <div className="flex flex-col">
              <button onClick={() => mover(idx, -1)} aria-label="Subir"><ChevronUp className="size-5" /></button>
              <button onClick={() => mover(idx, 1)} aria-label="Descer"><ChevronDown className="size-5" /></button>
            </div>
            <button onClick={() => remover(i.id)} aria-label="Remover" className="text-muted-foreground"><X className="size-5" /></button>
          </li>
        ))}
      </ol>
    </div>
  );
}
