import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Globe, Star, ClipboardPlus, Pencil, Ban, Copy, Trash2, CalendarPlus } from "lucide-react";
import { lojaQuery, categoriasQuery, useAtualizarLoja } from "@/lib/queries";
import { visitasQuery, resultadoLabel } from "@/lib/visitas";
import { linkInstagram, linkSite, linkWaze, STATUS } from "@/lib/crm";
import { fmtData, fmtDataHora, hojeISO } from "@/lib/datas";
import { supabase } from "@/integrations/supabase/client";
import { LojaCard } from "@/components/LojaCard";
import { LojaForm } from "@/components/LojaForm";
import { VisitaForm } from "@/components/VisitaForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/lojas/$id")({
  head: pageHead("Ficha da loja", "Ficha completa da loja e histórico de visitas."),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(lojaQuery(params.id)),
      context.queryClient.ensureQueryData(visitasQuery(params.id)),
      context.queryClient.ensureQueryData(categoriasQuery),
    ]),
  component: Ficha,
});

function Ficha() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: loja } = useSuspenseQuery(lojaQuery(id));
  const { data: visitas } = useSuspenseQuery(visitasQuery(id));
  const atualizar = useAtualizarLoja();
  const [visitaAberta, setVisitaAberta] = useState(false);
  const [editar, setEditar] = useState(false);

  const patch = async (p: Parameters<typeof atualizar.mutateAsync>[0], msg: string) => {
    try { await atualizar.mutateAsync(p); toast.success(msg); } catch { toast.error("Não foi possível atualizar"); }
  };
  async function adicionarRoteiro() {
    const { error } = await supabase.from("roteiro_dia").upsert(
      { loja_id: id, data: hojeISO(), ordem: 999 }, { onConflict: "user_id,data,loja_id", ignoreDuplicates: true },
    );
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["roteiro"] });
    toast.success("Adicionada ao roteiro de hoje");
  }
  async function excluir() {
    const { error } = await supabase.from("lojas").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["lojas"] });
    toast.success("Loja excluída");
    navigate({ to: "/lojas" });
  }

  const ig = linkInstagram(loja.instagram);
  const site = linkSite(loja.site);

  return (
    <div className="space-y-4 p-4">
      <LojaCard loja={loja} extra={loja.latitude != null ? <a href={linkWaze(loja)} target="_blank" rel="noreferrer" className="flex h-10 flex-1 items-center justify-center rounded-lg bg-muted text-sm font-medium">Waze</a> : null} />

      <div className="grid grid-cols-2 gap-2">
        <Button className="h-14 text-base" onClick={() => setVisitaAberta(true)}><ClipboardPlus /> Registrar visita</Button>
        <Button className="h-14 text-base" variant="secondary" onClick={adicionarRoteiro}><CalendarPlus /> Roteiro de hoje</Button>
      </div>

      <section className="space-y-1 rounded-2xl border bg-card p-4">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Status no funil</label>
        <select className="h-12 w-full rounded-md border bg-background px-3" value={loja.status} onChange={(e) => patch({ id, status: e.target.value }, "Status atualizado")}>
          {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </section>

      <section className="space-y-2 rounded-2xl border bg-card p-4 text-sm">
        <Info k="Endereço" v={loja.endereco} />
        <Info k="Responsável" v={loja.responsavel} />
        <Info k="Melhor horário" v={loja.melhor_horario} />
        <Info k="Telefone" v={loja.telefone} />
        {loja.google_nota != null && <p className="flex items-center gap-1"><Star className="size-4 fill-current text-primary" /> {loja.google_nota} · {loja.google_avaliacoes} avaliações no Google</p>}
        <div className="flex gap-2 pt-1">
          {ig && <a href={ig} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Instagram className="size-4" />Instagram</a>}
          {site && <a href={site} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Globe className="size-4" />Site</a>}
        </div>
        {loja.horario_funcionamento && <pre className="whitespace-pre-wrap font-sans text-xs text-muted-foreground">{loja.horario_funcionamento}</pre>}
        {loja.observacoes && <p className="text-muted-foreground">{loja.observacoes}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Histórico de visitas ({visitas.length})</h2>
        {visitas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma visita registrada.</p>}
        <ol className="space-y-3 border-l-2 border-primary/40 pl-4">
          {visitas.map((v) => (
            <li key={v.id} className="rounded-xl border bg-card p-3 text-sm">
              <div className="flex justify-between font-semibold"><span>{resultadoLabel(v.resultado)}</span><span className="text-muted-foreground">{fmtDataHora(v.data_hora)}</span></div>
              {v.com_quem && <p>Falei com: {v.com_quem}</p>}
              {v.notas && <p className="mt-1">{v.notas}</p>}
              {v.objecoes && <p className="mt-1 text-muted-foreground">Objeções: {v.objecoes}</p>}
              {v.proximo_passo && <p className="mt-1">Próximo passo: <b>{v.proximo_passo}</b></p>}
              {v.voltar_em && <p className="mt-1 text-primary">Voltar em {fmtData(v.voltar_em)}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12" onClick={() => setEditar(true)}><Pencil /> Editar</Button>
        <Button variant="outline" className="h-12" onClick={() => patch({ id, fechada: !loja.fechada }, loja.fechada ? "Marcada como aberta" : "Marcada como fechada")}><Ban /> {loja.fechada ? "Reabrir" : "Fechada"}</Button>
        <Button variant="outline" className="h-12" onClick={() => patch({ id, duplicada: true, status: "descartada" }, "Marcada como duplicada")}><Copy /> Duplicada</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline" className="h-12 text-destructive"><Trash2 /> Excluir</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {loja.nome}?</AlertDialogTitle>
              <AlertDialogDescription>A loja e todas as visitas dela serão apagadas. Não dá para desfazer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <Sheet open={visitaAberta} onOpenChange={setVisitaAberta}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>Visita · {loja.nome}</SheetTitle></SheetHeader>
          <div className="px-4 pb-6"><VisitaForm lojaId={id} onSalvo={() => setVisitaAberta(false)} /></div>
        </SheetContent>
      </Sheet>
      <Sheet open={editar} onOpenChange={setEditar}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>Editar loja</SheetTitle></SheetHeader>
          <div className="px-4 pb-6"><LojaForm inicial={loja} onSalvo={() => { setEditar(false); qc.invalidateQueries({ queryKey: ["lojas"] }); }} /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string | null }) {
  if (!v) return null;
  return <p><span className="text-muted-foreground">{k}: </span>{v}</p>;
}
