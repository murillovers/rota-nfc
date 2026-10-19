import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIAS_INICIAIS, PESOS_PADRAO, calcularPotencial, type LojaInsert, type Loja, type Pesos } from "./crm";

export const lojasQuery = queryOptions({
  queryKey: ["lojas"],
  queryFn: async () => {
    const { data, error } = await supabase.from("lojas").select("*").order("criada_em", { ascending: false }).limit(5000);
    if (error) throw error;
    return data;
  },
});

export const lojaQuery = (id: string) =>
  queryOptions({
    queryKey: ["lojas", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lojas").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categorias").select("*").order("nome");
    if (error) throw error;
    if (data.length === 0) {
      const { data: ins, error: e2 } = await supabase.from("categorias").insert(CATEGORIAS_INICIAIS).select("*");
      if (e2) throw e2;
      return ins.sort((a, b) => a.nome.localeCompare(b.nome));
    }
    return data;
  },
});

export const pesosQuery = queryOptions({
  queryKey: ["pesos"],
  queryFn: async (): Promise<Pesos> => {
    const { data } = await supabase.from("configuracoes").select("pesos").maybeSingle();
    return { ...PESOS_PADRAO, ...((data?.pesos as Partial<Pesos>) ?? {}) };
  },
});

export const roteiroQuery = (data: string) =>
  queryOptions({
    queryKey: ["roteiro", data],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("roteiro_dia")
        .select("*, loja:lojas(*)")
        .eq("data", data)
        .order("ordem");
      if (error) throw error;
      return rows as (typeof rows[number] & { loja: Loja })[];
    },
  });

export function useSalvarLoja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (loja: LojaInsert & { id?: string }) => {
      const [cats, pesos] = await Promise.all([qc.ensureQueryData(categoriasQuery), qc.ensureQueryData(pesosQuery)]);
      const peso = cats.find((c) => c.nome === loja.categoria)?.peso ?? 5;
      const payload = { ...loja, potencial: calcularPotencial(loja, Number(peso), pesos) };
      const q = loja.id
        ? supabase.from("lojas").update(payload).eq("id", loja.id).select().single()
        : supabase.from("lojas").insert(payload).select().single();
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lojas"] }),
  });
}

export function useAtualizarLoja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Loja> & { id: string }) => {
      const { error } = await supabase.from("lojas").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lojas"] }),
  });
}

export async function recalcularPotenciais(pesos: Pesos) {
  const [{ data: lojas }, { data: cats }] = await Promise.all([
    supabase.from("lojas").select("id, google_nota, google_avaliacoes, instagram, site, categoria"),
    supabase.from("categorias").select("nome, peso"),
  ]);
  const pesoDe = (n: string | null) => Number(cats?.find((c) => c.nome === n)?.peso ?? 5);
  await Promise.all(
    (lojas ?? []).map((l) =>
      supabase.from("lojas").update({ potencial: calcularPotencial(l, pesoDe(l.categoria), pesos) }).eq("id", l.id),
    ),
  );
}
