import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, Map, List, Route as RouteIcon, Settings, Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/painel", label: "Início", icon: Home },
  { to: "/mapa", label: "Mapa", icon: Map },
  { to: "/lojas", label: "Lojas", icon: List },
  { to: "/roteiro", label: "Roteiro", icon: RouteIcon },
  { to: "/config", label: "Ajustes", icon: Settings },
] as const;

export function AppShell() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [escuro, setEscuro] = useState(false);
  useEffect(() => setEscuro(document.documentElement.classList.contains("dark")), []);

  function alternarTema() {
    const novo = !escuro;
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("tema", novo ? "dark" : "light");
    setEscuro(novo);
  }
  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-secondary px-4 py-3 text-secondary-foreground">
        <Link to="/painel" className="text-xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
          Prospecta<span className="text-primary">.</span>
        </Link>
        <div className="flex gap-1">
          <button onClick={alternarTema} aria-label="Alternar tema" className="grid size-10 place-items-center rounded-full hover:bg-accent/20">
            {escuro ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <button onClick={sair} aria-label="Sair" className="grid size-10 place-items-center rounded-full hover:bg-accent/20">
            <LogOut className="size-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
