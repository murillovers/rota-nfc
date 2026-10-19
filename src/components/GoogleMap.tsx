import { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { CAXIAS, statusInfo, type Loja } from "@/lib/crm";

declare global {
  interface Window { __gmapsInit?: () => void; google?: any }
}

let loader: Promise<void> | null = null;
function carregarMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__gmapsInit = () => resolve();
    const s = document.createElement("script");
    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const ch = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__gmapsInit&channel=${ch}&language=pt-BR&region=BR`;
    s.async = true;
    s.onerror = () => reject(new Error("Falha ao carregar o Google Maps"));
    document.head.appendChild(s);
  });
  return loader;
}

type Props = {
  lojas: Loja[];
  onSelect?: (l: Loja) => void;
  rota?: { lat: number; lng: number }[];
  minhaPos?: { lat: number; lng: number } | null;
  numerar?: boolean;
  className?: string;
};

export default function GoogleMap({ lojas, onSelect, rota, minhaPos, numerar, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const selRef = useRef(onSelect);
  selRef.current = onSelect;

  useEffect(() => {
    carregarMaps()
      .then(() => {
        if (!ref.current) return;
        const g = window.google;
        setMap(new g.maps.Map(ref.current, {
          center: CAXIAS, zoom: 13, clickableIcons: false, disableDefaultUI: true, zoomControl: true,
          gestureHandling: "greedy",
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        }));
      })
      .catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (!map) return;
    const g = window.google;
    const markers = lojas
      .filter((l) => l.latitude != null && l.longitude != null)
      .map((l, i) => {
        const m = new g.maps.Marker({
          position: { lat: l.latitude, lng: l.longitude },
          title: l.nome,
          label: numerar ? { text: String(i + 1), color: "#fff", fontWeight: "700" } : undefined,
          icon: {
            path: g.maps.SymbolPath.CIRCLE, scale: numerar ? 13 : 9,
            fillColor: statusInfo(l.status).cor, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2,
          },
        });
        m.addListener("click", () => selRef.current?.(l));
        return m;
      });
    let cluster: MarkerClusterer | null = null;
    if (numerar) markers.forEach((m) => m.setMap(map));
    else cluster = new MarkerClusterer({ map, markers });

    let linha: any = null;
    if (rota && rota.length > 1) {
      linha = new g.maps.Polyline({ path: rota, map, strokeColor: "#e8752a", strokeWeight: 4, strokeOpacity: 0.85 });
    }
    let eu: any = null;
    if (minhaPos) {
      eu = new g.maps.Marker({
        position: minhaPos, map, title: "Você",
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#2563eb", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
      });
    }
    const pts = [...markers.map((m) => m.getPosition()), ...(minhaPos ? [minhaPos] : [])];
    if (pts.length > 1) {
      const b = new g.maps.LatLngBounds();
      pts.forEach((p) => b.extend(p));
      map.fitBounds(b, 40);
    } else if (pts.length === 1) map.setCenter(pts[0]);

    return () => {
      cluster?.clearMarkers();
      markers.forEach((m) => m.setMap(null));
      linha?.setMap(null);
      eu?.setMap(null);
    };
  }, [map, lojas, rota, minhaPos, numerar]);

  if (erro) return <div className="grid h-full place-items-center p-6 text-center text-sm text-destructive">{erro}</div>;
  return <div ref={ref} className={className ?? "h-full w-full"} />;
}
