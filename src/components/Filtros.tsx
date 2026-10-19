import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { STATUS, PRIORIDADES, type Loja } from "@/lib/crm";
import { Search } from "lucide-react";

export type FiltroState = { busca: string; categoria: string; bairro: string; status: string; prioridade: string };
export const FILTRO_VAZIO: FiltroState = { busca: "", categoria: "", bairro: "", status: "", prioridade: "" };

export function aplicarFiltros(lojas: Loja[], f: FiltroState) {
  const b = f.busca.trim().toLowerCase();
  return lojas.filter(
    (l) =>
      !l.duplicada &&
      (!b || l.nome.toLowerCase().includes(b) || (l.nome_fantasia ?? "").toLowerCase().includes(b)) &&
      (!f.categoria || l.categoria === f.categoria) &&
      (!f.bairro || l.bairro === f.bairro) &&
      (!f.status || l.status === f.status) &&
      (!f.prioridade || l.prioridade === f.prioridade),
  );
}

const sel = "h-11 rounded-lg border bg-card px-2 text-sm min-w-0";

export function Filtros({ lojas, value, onChange }: { lojas: Loja[]; value: FiltroState; onChange: (f: FiltroState) => void }) {
  const categorias = useMemo(() => [...new Set(lojas.map((l) => l.categoria).filter(Boolean))].sort() as string[], [lojas]);
  const bairros = useMemo(() => [...new Set(lojas.map((l) => l.bairro).filter(Boolean))].sort() as string[], [lojas]);
  const set = (k: keyof FiltroState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome" value={value.busca} onChange={set("busca")} className="h-11 pl-9" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select className={sel} value={value.categoria} onChange={set("categoria")}>
          <option value="">Todas categorias</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={value.bairro} onChange={set("bairro")}>
          <option value="">Todos bairros</option>
          {bairros.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={value.status} onChange={set("status")}>
          <option value="">Todos status</option>
          {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className={sel} value={value.prioridade} onChange={set("prioridade")}>
          <option value="">Toda prioridade</option>
          {PRIORIDADES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
