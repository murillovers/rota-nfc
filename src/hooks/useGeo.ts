import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useGeo() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const localizar = useCallback(
    () =>
      new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (!navigator.geolocation) { toast.error("GPS indisponível neste aparelho"); return resolve(null); }
        setCarregando(true);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const v = { lat: p.coords.latitude, lng: p.coords.longitude };
            setPos(v); setCarregando(false); resolve(v);
          },
          () => { setCarregando(false); toast.error("Não consegui acessar sua localização"); resolve(null); },
          { enableHighAccuracy: true, timeout: 15000 },
        );
      }),
    [],
  );
  return { pos, localizar, carregando };
}
