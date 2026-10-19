import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoriasQuery, pesosQuery, recalcularPotenciais } from "@/lib/queries";
import { LOJAS_EXEMPLO } from "@/lib/exemplos";
import { calcularPotencial, type Pesos } from "@/lib/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/config")({
  head: pageHead("Ajustes", "Pesos do potencial, categorias e dados de exemplo."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(categoriasQuery), context.queryClient.ensureQueryData(pesosQuery)]),
  component: Config,
});

const ROTULOS: Record<keyof Pesos, string> = {
  nota: "Nota no Google", avaliacoes: "Nº de avaliações", instagram: "Tem Instagram", site: "Tem site", categoria: "Categoria",
};

function Config() {
  const qc = useQueryClient();
  const { data: cats } = useSuspenseQuery(categoriasQuery);
  const { data: pesosIni } = useSuspenseQuery(pesosQuery);
  const [pesos, setPesos] = useState(pesosIni);
  const [nova, setNova] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarPesos() {
    setSalvando(true);
    const { error } = await supabase.from("configuracoes").upsert({ pesos, atualizada_em: new Date().toISOString() });
    if (error) { setSalvando(false); return void toast.error(error.message); }
    await recalcularPotenciais(pesos);
    qc.invalidateQueries();
    setSalvando(false);
    toast.success("Pesos salvos e potenciais recalculados");
  }
  async function salvarCat(id: string, campo: "nome" | "peso", valor: string) {
    const { error } = await supabase.from("categorias").update(campo === "peso" ? { peso: Number(valor) } : { nome: valor }).eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["categorias"] });
  }
  async function addCat() {
    if (!nova.trim()) return;
    const { error } = await supabase.from("categorias").insert({ nome: nova.trim() });
    if (error) return void toast.error(error.message);
    setNova(""); qc.invalidateQueries({ queryKey: ["categorias"] });
  }
  async function delCat(id: string) {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["categorias"] });
  }
  async function carregarExemplos() {
    const rows = LOJAS_EXEMPLO.map((l) => ({
      ...l, potencial: calcularPotencial(l, Number(cats.find((c) => c.nome === l.categoria)?.peso ?? 5), pesos),
    }));
    const { error } = await supabase.from("lojas").insert(rows);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["lojas"] });
    toast.success("10 lojas de exemplo criadas");
  }
  async function removerExemplos() {
    const { error } = await supabase.from("lojas").delete().eq("exemplo", true);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries();
    toast.success("Dados de exemplo removidos");
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-extrabold">Ajustes</h1>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Pesos da pontuação de potencial</h2>
        {(Object.keys(ROTULOS) as (keyof Pesos)[]).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <span className="flex-1 text-sm">{ROTULOS[k]}</span>
            <input type="range" min={0} max={50} value={pesos[k]} onChange={(e) => setPesos({ ...pesos, [k]: Number(e.target.value) })} className="w-32 accent-[var(--primary)]" />
            <span className="w-8 text-right font-bold">{pesos[k]}</span>
          </div>
        ))}
        <Button onClick={salvarPesos} disabled={salvando} className="h-12 w-full">{salvando ? "Recalculando…" : "Salvar e recalcular"}</Button>
      </section>

      <section className="space-y-2 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Categorias <span className="text-sm font-normal text-muted-foreground">(peso 0–10)</span></h2>
        {cats.map((c) => (
          <div key={c.id} className="flex gap-2">
            <Input defaultValue={c.nome} onBlur={(e) => e.target.value !== c.nome && salvarCat(c.id, "nome", e.target.value)} className="h-11" />
            <Input type="number" min={0} max={10} defaultValue={Number(c.peso)} onBlur={(e) => salvarCat(c.id, "peso", e.target.value)} className="h-11 w-20" />
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-11"><Trash2 /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Excluir "{c.nome}"?</AlertDialogTitle><AlertDialogDescription>As lojas continuam com o nome da categoria.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => delCat(c.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Input placeholder="Nova categoria" value={nova} onChange={(e) => setNova(e.target.value)} className="h-11" />
          <Button onClick={addCat} className="h-11"><Plus /></Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Dados de exemplo</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-12" onClick={carregarExemplos}>Criar 10 lojas</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" className="h-12">Remover exemplos</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Remover dados de exemplo?</AlertDialogTitle><AlertDialogDescription>As lojas fictícias e suas visitas serão apagadas.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={removerExemplos}>Remover</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
