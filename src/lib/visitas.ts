import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Visita = Database["public"]["Tables"]["visitas"]["Row"];
export type VisitaInsert = Database["public"]["Tables"]["visitas"]["Insert"];

export const RESULTADOS = [
  { id: "nao_estava", label: "Não estava", status: "retornar" },
  { id: "dono_ausente", label: "Dono ausente", status: "retornar" },
  { id: "conversei", label: "Conversei", status: "visitada" },
  { id: "pediu_retorno", label: "Pediu retorno", status: "retornar" },
  { id: "interessado", label: "Interessado", status: "interessada" },
  { id: "fechou", label: "Fechou", status: "cliente" },
  { id: "nao_quer", label: "Não quer", status: "perdida" },
] as const;
export const resultadoLabel = (id: string) => RESULTADOS.find((r) => r.id === id)?.label ?? id;

export const visitasQuery = (lojaId: string) =>
  queryOptions({
    queryKey: ["visitas", lojaId],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitas").select("*").eq("loja_id", lojaId).order("data_hora", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export function useRegistrarVisita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: VisitaInsert) => {
      const { error } = await supabase.from("visitas").insert(v);
      if (error) throw error;
      const novoStatus = RESULTADOS.find((r) => r.id === v.resultado)?.status;
      const patch: { status?: string; responsavel?: string } = {};
      if (novoStatus) patch.status = novoStatus;
      if (novoStatus) await supabase.from("lojas").update(patch).eq("id", v.loja_id);
      if (v.voltar_em) {
        await supabase.from("roteiro_dia").upsert(
          { loja_id: v.loja_id, data: v.voltar_em, ordem: 999 },
          { onConflict: "user_id,data,loja_id", ignoreDuplicates: true },
        );
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["visitas", v.loja_id] });
      qc.invalidateQueries({ queryKey: ["lojas"] });
      qc.invalidateQueries({ queryKey: ["roteiro"] });
    },
  });
}
