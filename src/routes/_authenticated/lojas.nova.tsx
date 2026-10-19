import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LojaForm } from "@/components/LojaForm";
import { categoriasQuery } from "@/lib/queries";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/_authenticated/lojas/nova")({
  head: pageHead("Nova loja", "Cadastrar uma loja manualmente."),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriasQuery),
  component: () => {
    const navigate = useNavigate();
    return (
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-extrabold">Nova loja</h1>
        <LojaForm onSalvo={(l) => navigate({ to: "/lojas/$id", params: { id: l.id } })} />
      </div>
    );
  },
});
