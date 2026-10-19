import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Navigation, Star } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { linkRotaGoogle, linkWhatsApp, prioridadeLabel, type Loja } from "@/lib/crm";

export function LojaCard({ loja, distancia, extra }: { loja: Loja; distancia?: number | undefined; extra?: React.ReactNode }) {
  const wa = linkWhatsApp(loja.whatsapp || loja.telefone);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Link to="/lojas/$id" params={{ id: loja.id }} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">{loja.nome}</h3>
            <p className="truncate text-sm text-muted-foreground">
              {loja.categoria} · {loja.bairro ?? loja.cidade}
              {distancia != null && ` · ${distancia.toFixed(1)} km`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>{Math.round(Number(loja.potencial))}</div>
            <div className="text-[10px] uppercase text-muted-foreground">potencial</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <StatusBadge status={loja.status} />
          <span className="rounded-full bg-muted px-2 py-0.5">Prioridade {prioridadeLabel(loja.prioridade)}</span>
          {loja.google_nota != null && (
            <span className="flex items-center gap-1"><Star className="size-3 fill-current text-primary" />{loja.google_nota} ({loja.google_avaliacoes ?? 0})</span>
          )}
          {loja.fechada && <span className="rounded-full bg-destructive px-2 py-0.5 text-destructive-foreground">Fechada</span>}
        </div>
      </Link>
      <div className="mt-3 flex gap-2">
        {loja.telefone && <a href={`tel:${loja.telefone}`} className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"><Phone className="size-4" />Ligar</a>}
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"><MessageCircle className="size-4" />WhatsApp</a>}
        <a href={linkRotaGoogle(loja)} target="_blank" rel="noreferrer" className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"><Navigation className="size-4" />Rota</a>
        {extra}
      </div>
    </div>
  );
}
