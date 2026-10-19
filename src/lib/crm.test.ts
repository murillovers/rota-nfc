import { describe, it, expect } from "vitest";
import { calcularPotencial, ordenarPorProximidade, PESOS_PADRAO } from "./crm";

describe("potencial", () => {
  it("loja perfeita com categoria peso 10 vale 100", () => {
    expect(calcularPotencial({ google_nota: 5, google_avaliacoes: 999, instagram: "@x", site: "x.com" }, 10, PESOS_PADRAO)).toBe(100);
  });
  it("loja sem nada vale 0", () => {
    expect(calcularPotencial({ google_nota: null, google_avaliacoes: null, instagram: null, site: null }, 0, PESOS_PADRAO)).toBe(0);
  });
});

describe("roteiro", () => {
  it("ordena pelo vizinho mais próximo", () => {
    const r = ordenarPorProximidade({ lat: 0, lng: 0 }, [
      { id: "c", latitude: 0, longitude: 3 }, { id: "a", latitude: 0, longitude: 1 }, { id: "b", latitude: 0, longitude: 2 },
    ]);
    expect(r.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});
