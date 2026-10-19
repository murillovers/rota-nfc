import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Prospecta NFC — CRM de prospecção em campo" },
      { name: "description", content: "Mapeie lojas, registre visitas e acompanhe o funil de vendas de placas NFC." },
      { property: "og:title", content: "Prospecta NFC" },
      { property: "og:description", content: "CRM de prospecção em campo para placas NFC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/painel" : "/auth" });
  },
});
