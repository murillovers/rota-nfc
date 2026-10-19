import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { categoriasQuery } from "@/lib/queries";
import { importarLojasGoogle } from "@/lib/places.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHead } from "@/lib/head";

const VIZINHAS = ["Caxias do Sul", "Farroupilha", "Bento Gonçalves", "Flores da Cunha", "São Marcos", "Nova Petrópolis", "Garibaldi", "Carlos Barbosa"];

export const Route = createFileRoute("/_authenticated/importar")({
  head: pageHead("Importar do Google", "Buscar lojas no Google por categoria e região."),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriasQuery),
  component: Importar,
});

function Importar() {
  const { data: cats } = useSuspenseQuery(categoriasQuery);
  const qc = useQueryClient();
  const importar = useServerFn(importarLojasGoogle);
  const [categoria, setCategoria] = useState(cats[0]?.nome ?? "");
  const [cidade, setCidade] = useState("Caxias do Sul");
  const [bairro, setBairro] = useState("");
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<{ encontradas: number; importadas: number } | null>(null);

  async function rodar() {
    setRodando(true); setResultado(null);
    try {
      const r = await importar({ data: { categoria, regiao: bairro ? `${bairro}, ${cidade}` : cidade } });
      setResultado(r);
      qc.invalidateQueries({ queryKey: ["lojas"] });
      toast.success(`${r.importadas} lojas novas importadas`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na importação");
    } finally { setRodando(false); }
  }

  const sel = "h-12 w-full rounded-md border bg-card px-3";
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold">Importar do Google</h1>
      <p className="text-sm text-muted-foreground">Busca até 60 lojas por vez. Lojas já cadastradas não são duplicadas.</p>
      <div className="space-y-1"><Label>Categoria</Label>
        <select className={sel} value={categoria} onChange={(e) => setCategoria(e.target.value)}>{cats.map((c) => <option key={c.id}>{c.nome}</option>)}</select>
      </div>
      <div className="space-y-1"><Label>Cidade</Label>
        <select className={sel} value={cidade} onChange={(e) => setCidade(e.target.value)}>{VIZINHAS.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="space-y-1"><Label>Bairro (opcional)</Label><Input className="h-12" placeholder="Ex.: Centro, São Pelegrino" value={bairro} onChange={(e) => setBairro(e.target.value)} /></div>
      <Button onClick={rodar} disabled={rodando || !categoria} className="h-14 w-full text-base"><Download /> {rodando ? "Buscando no Google…" : "Importar lojas"}</Button>
      {resultado && (
        <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
          <p className="text-3xl font-extrabold">{resultado.importadas} novas</p>
          <p className="text-sm">{resultado.encontradas} encontradas · {resultado.encontradas - resultado.importadas} já existiam</p>
        </div>
      )}
    </div>
  );
}
