import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { categoriasQuery, useSalvarLoja } from "@/lib/queries";
import { PRIORIDADES, STATUS, type Loja, type LojaInsert } from "@/lib/crm";

type Campo = { k: keyof LojaInsert; label: string; type?: string };
const CAMPOS: Campo[] = [
  { k: "nome", label: "Nome *" }, { k: "nome_fantasia", label: "Nome fantasia" },
  { k: "endereco", label: "Endereço" }, { k: "bairro", label: "Bairro" }, { k: "cidade", label: "Cidade" },
  { k: "telefone", label: "Telefone", type: "tel" }, { k: "whatsapp", label: "WhatsApp", type: "tel" },
  { k: "site", label: "Site" }, { k: "instagram", label: "Instagram" },
  { k: "responsavel", label: "Dono / responsável" }, { k: "melhor_horario", label: "Melhor horário para contato" },
  { k: "latitude", label: "Latitude", type: "number" }, { k: "longitude", label: "Longitude", type: "number" },
];

export function LojaForm({ inicial, onSalvo }: { inicial?: Loja; onSalvo: (l: Loja) => void }) {
  const { data: cats } = useSuspenseQuery(categoriasQuery);
  const salvar = useSalvarLoja();
  const [v, setV] = useState<LojaInsert>(
    inicial ?? { nome: "", cidade: "Caxias do Sul", status: "nao_visitada", prioridade: "media", categoria: cats[0]?.nome ?? null },
  );
  const set = (k: keyof LojaInsert, val: unknown) => setV((p) => ({ ...p, [k]: val }));

  async function usarGPS() {
    navigator.geolocation?.getCurrentPosition(
      (p) => setV((o) => ({ ...o, latitude: p.coords.latitude, longitude: p.coords.longitude })),
      () => toast.error("Não consegui pegar sua localização"),
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!v.nome?.trim()) return void toast.error("Informe o nome");
    try {
      const { user_id: _u, criada_em: _c, ...resto } = v as Loja;
      const l = await salvar.mutateAsync(resto);
      toast.success("Loja salva");
      onSalvo(l);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  const sel = "h-12 w-full rounded-md border bg-card px-3";
  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Categoria</Label>
          <select className={sel} value={v.categoria ?? ""} onChange={(e) => set("categoria", e.target.value)}>
            {cats.map((c) => <option key={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <select className={sel} value={v.status} onChange={(e) => set("status", e.target.value)}>
            {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Prioridade</Label>
          <select className={sel} value={v.prioridade} onChange={(e) => set("prioridade", e.target.value)}>
            {PRIORIDADES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        {CAMPOS.map((c) => (
          <div key={c.k} className={`space-y-1 ${c.type === "number" ? "" : "col-span-2"}`}>
            <Label>{c.label}</Label>
            <Input
              className="h-12" type={c.type ?? "text"} step="any"
              value={(v[c.k] as string | number | null | undefined) ?? ""}
              onChange={(e) => set(c.k, c.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
            />
          </div>
        ))}
        <Button type="button" variant="outline" className="col-span-2 h-11" onClick={usarGPS}>Usar minha localização atual</Button>
        <div className="col-span-2 space-y-1">
          <Label>Observações</Label>
          <Textarea rows={3} value={v.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={salvar.isPending} className="h-14 w-full text-base">
        {salvar.isPending ? "Salvando…" : "Salvar loja"}
      </Button>
    </form>
  );
}
