import type { Database } from "@/integrations/supabase/types";

export type Loja = Database["public"]["Tables"]["lojas"]["Row"];
export type LojaInsert = Database["public"]["Tables"]["lojas"]["Insert"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];

export const STATUS = [
  { id: "nao_visitada", label: "Não visitada", cor: "#94a3b8" },
  { id: "visitada", label: "Visitada", cor: "#3b82f6" },
  { id: "retornar", label: "Retornar", cor: "#f59e0b" },
  { id: "interessada", label: "Interessada", cor: "#8b5cf6" },
  { id: "negociando", label: "Negociando", cor: "#ec4899" },
  { id: "cliente", label: "Cliente", cor: "#16a34a" },
  { id: "perdida", label: "Perdida", cor: "#dc2626" },
  { id: "descartada", label: "Descartada", cor: "#334155" },
] as const;
export type StatusId = (typeof STATUS)[number]["id"];
export const statusInfo = (id: string) => STATUS.find((s) => s.id === id) ?? STATUS[0];

export const PRIORIDADES = [
  { id: "alta", label: "Alta", ordem: 0 },
  { id: "media", label: "Média", ordem: 1 },
  { id: "baixa", label: "Baixa", ordem: 2 },
] as const;
export const prioridadeLabel = (id: string) => PRIORIDADES.find((p) => p.id === id)?.label ?? id;

export const CATEGORIAS_INICIAIS: { nome: string; peso: number }[] = [
  ["Barbearia", 9], ["Salão de beleza", 9], ["Manicure e nail designer", 8],
  ["Loja de celular e acessórios", 6], ["Restaurante", 9], ["Lanchonete e cafeteria", 8],
  ["Padaria", 6], ["Pet shop", 7], ["Academia", 8], ["Clínica de estética", 9],
  ["Loja de roupas", 7], ["Ótica", 6], ["Floricultura", 5], ["Oficina mecânica", 6],
  ["Imobiliária", 5], ["Consultório (dentista, psicólogo)", 7], ["Hotel e pousada", 8],
  ["Loja de móveis", 4], ["Mercado pequeno", 4], ["Tabacaria", 6], ["Tatuador", 8],
].map(([nome, peso]) => ({ nome: nome as string, peso: peso as number }));

export type Pesos = { nota: number; avaliacoes: number; instagram: number; site: number; categoria: number };
export const PESOS_PADRAO: Pesos = { nota: 30, avaliacoes: 25, instagram: 15, site: 10, categoria: 20 };

/** Potencial 0–100. pesoCategoria vai de 0 a 10. */
export function calcularPotencial(
  l: Pick<Loja, "google_nota" | "google_avaliacoes" | "instagram" | "site">,
  pesoCategoria: number,
  pesos: Pesos,
): number {
  const total = pesos.nota + pesos.avaliacoes + pesos.instagram + pesos.site + pesos.categoria;
  if (total <= 0) return 0;
  const nota = Math.max(0, Math.min(1, Number(l.google_nota ?? 0) / 5));
  const aval = Math.min(1, Math.log10(Number(l.google_avaliacoes ?? 0) + 1) / 3);
  const pts =
    nota * pesos.nota +
    aval * pesos.avaliacoes +
    (l.instagram ? 1 : 0) * pesos.instagram +
    (l.site ? 1 : 0) * pesos.site +
    Math.max(0, Math.min(1, pesoCategoria / 10)) * pesos.categoria;
  return Math.round((pts / total) * 100);
}

export function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Ordena pontos pelo vizinho mais próximo a partir da origem. */
export function ordenarPorProximidade<T extends { latitude: number | null; longitude: number | null }>(
  origem: { lat: number; lng: number },
  itens: T[],
): T[] {
  const restantes = itens.filter((i) => i.latitude != null && i.longitude != null);
  const semCoord = itens.filter((i) => i.latitude == null || i.longitude == null);
  const out: T[] = [];
  let atual = origem;
  while (restantes.length) {
    let melhor = 0;
    let melhorD = Infinity;
    restantes.forEach((r, i) => {
      const d = distanciaKm(atual, { lat: r.latitude!, lng: r.longitude! });
      if (d < melhorD) { melhorD = d; melhor = i; }
    });
    const [p] = restantes.splice(melhor, 1);
    out.push(p);
    atual = { lat: p.latitude!, lng: p.longitude! };
  }
  return [...out, ...semCoord];
}

export const soDigitos = (s?: string | null) => (s ?? "").replace(/\D/g, "");
export const linkWhatsApp = (n?: string | null) => {
  const d = soDigitos(n);
  if (!d) return null;
  return `https://wa.me/${d.startsWith("55") ? d : "55" + d}`;
};
export const linkRotaGoogle = (l: Pick<Loja, "latitude" | "longitude" | "endereco">) =>
  l.latitude != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${l.latitude},${l.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(l.endereco ?? "")}`;
export const linkWaze = (l: Pick<Loja, "latitude" | "longitude">) =>
  `https://waze.com/ul?ll=${l.latitude},${l.longitude}&navigate=yes`;
export const linkInstagram = (s?: string | null) =>
  !s ? null : s.startsWith("http") ? s : `https://instagram.com/${s.replace(/^@/, "")}`;
export const linkSite = (s?: string | null) => (!s ? null : s.startsWith("http") ? s : `https://${s}`);

export const CAXIAS = { lat: -29.1678, lng: -51.1794 };
