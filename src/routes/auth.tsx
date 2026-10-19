import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Nfc } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Prospecta NFC" },
      { name: "description", content: "Acesse seu CRM de prospecção em campo." },
      { property: "og:title", content: "Entrar — Prospecta NFC" },
      { property: "og:description", content: "Acesse seu CRM de prospecção em campo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/painel" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password: senha, options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        setModo("entrar");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-secondary px-6 text-secondary-foreground">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Nfc className="size-7" /></div>
          <div>
            <h1 className="text-3xl font-extrabold">Prospecta</h1>
            <p className="text-sm opacity-75">CRM de campo · placas NFC</p>
          </div>
        </div>
        <form onSubmit={enviar} className="space-y-4 rounded-2xl bg-card p-6 text-card-foreground shadow-xl">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="h-12" />
          </div>
          <Button type="submit" disabled={carregando} className="h-12 w-full text-base">
            {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
          <button type="button" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")} className="w-full text-sm text-muted-foreground underline">
            {modo === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
