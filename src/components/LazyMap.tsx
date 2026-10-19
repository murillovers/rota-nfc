import { lazy, Suspense, type ComponentProps } from "react";
import { ClientOnly } from "@tanstack/react-router";

const GoogleMap = lazy(() => import("./GoogleMap"));

export function LazyMap(props: ComponentProps<typeof GoogleMap>) {
  const fb = <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground">Carregando mapa…</div>;
  return (
    <ClientOnly fallback={fb}>
      <Suspense fallback={fb}><GoogleMap {...props} /></Suspense>
    </ClientOnly>
  );
}
