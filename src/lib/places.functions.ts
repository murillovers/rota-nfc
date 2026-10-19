import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calcularPotencial, PESOS_PADRAO, type Pesos } from "./crm";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

type Place = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  addressComponents?: { longText: string; types: string[] }[];
  businessStatus?: string;
};

export const importarLojasGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { categoria: string; regiao: string; maxPaginas?: number }) => {
    const categoria = String(d.categoria ?? "").trim().slice(0, 80);
    const regiao = String(d.regiao ?? "").trim().slice(0, 120);
    if (!categoria || !regiao) throw new Error("Informe categoria e região");
    return { categoria, regiao, maxPaginas: Math.min(3, Math.max(1, Number(d.maxPaginas ?? 3))) };
  })
  .handler(async ({ data, context }) => {
    const LOVABLE_API_KEY = process.env['LOVABLE_API_KEY'];
    const GOOGLE_MAPS_API_KEY = process.env['GOOGLE_MAPS_API_KEY'];
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) throw new Error("Google Maps não está conectado");
    const { supabase, userId } = context;

    const [{ data: cfg }, { data: cat }] = await Promise.all([
      supabase.from("configuracoes").select("pesos").eq("user_id", userId).maybeSingle(),
      supabase.from("categorias").select("peso").eq("nome", data.categoria).maybeSingle(),
    ]);
    const pesos = { ...PESOS_PADRAO, ...((cfg?.pesos as Partial<Pesos>) ?? {}) };
    const pesoCat = Number(cat?.peso ?? 5);

    const places: Place[] = [];
    let pageToken: string | undefined;
    for (let i = 0; i < data.maxPaginas; i++) {
      const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.regularOpeningHours.weekdayDescriptions,places.addressComponents,places.businessStatus,nextPageToken",
        },
        body: JSON.stringify({
          textQuery: `${data.categoria} em ${data.regiao}, RS, Brasil`,
          languageCode: "pt-BR",
          regionCode: "BR",
          pageSize: 20,
          ...(pageToken ? { pageToken } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`Places falhou [${res.status}]: ${body}`);
        throw new Error(`Google Places recusou a busca (${res.status})`);
      }
      const json = (await res.json()) as { places?: Place[]; nextPageToken?: string };
      places.push(...(json.places ?? []));
      pageToken = json.nextPageToken;
      if (!pageToken) break;
    }

    const rows = places
      .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
      .map((p) => {
        const comp = (t: string) => p.addressComponents?.find((c) => c.types.includes(t))?.longText ?? null;
        const base = {
          user_id: userId,
          nome: p.displayName?.text ?? "Sem nome",
          categoria: data.categoria,
          endereco: p.formattedAddress ?? null,
          bairro: comp("sublocality_level_1") ?? comp("sublocality") ?? comp("neighborhood"),
          cidade: comp("administrative_area_level_2") ?? comp("locality"),
          latitude: p.location?.latitude ?? null,
          longitude: p.location?.longitude ?? null,
          telefone: p.nationalPhoneNumber ?? null,
          site: p.websiteUri ?? null,
          google_place_id: p.id,
          google_nota: p.rating ?? null,
          google_avaliacoes: p.userRatingCount ?? null,
          horario_funcionamento: p.regularOpeningHours?.weekdayDescriptions?.join("\n") ?? null,
          instagram: p.websiteUri?.includes("instagram.com") ? p.websiteUri : null,
        };
        return { ...base, potencial: calcularPotencial(base, pesoCat, pesos) };
      });

    if (!rows.length) return { encontradas: 0, importadas: 0 };
    const { data: inseridas, error } = await supabase
      .from("lojas")
      .upsert(rows, { onConflict: "user_id,google_place_id", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error(error.message);
    return { encontradas: rows.length, importadas: inseridas?.length ?? 0 };
  });
