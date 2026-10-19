import { useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RESULTADOS, useRegistrarVisita } from "@/lib/visitas";

function useDitado(onTexto: (t: string) => void) {
  const [ouvindo, setOuvindo] = useState(false);
  const rec = useRef<any>(null);
  function alternar() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return void toast.error("Ditado por voz não é suportado neste navegador");
    if (ouvindo) { rec.current?.stop(); return undefined; }
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = true; r.interimResults = false;
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) onTexto(e.results[i][0].transcript);
    };
    r.onend = () => setOuvindo(false);
    r.onerror = () => setOuvindo(false);
    rec.current = r; r.start(); setOuvindo(true);
  }
  return { ouvindo, alternar };
}

export function VisitaForm({ lojaId, onSalvo }: { lojaId: string; onSalvo: () => void }) {
  const registrar = useRegistrarVisita();
  const [resultado, setResultado] = useState<string>("");
  const [comQuem, setComQuem] = useState("");
  const [notas, setNotas] = useState("");
  const [objecoes, setObjecoes] = useState("");
  const [proximo, setProximo] = useState("");
  const [voltarEm, setVoltarEm] = useState("");
  const ditado = useDitado((t) => setNotas((n) => (n ? n + " " : "") + t.trim()));

  async function salvar() {
    if (!resultado) return void toast.error("Escolha o resultado da visita");
    try {
      await registrar.mutateAsync({
        loja_id: lojaId, resultado, com_quem: comQuem || null, notas: notas || null,
        objecoes: objecoes || null, proximo_passo: proximo || null, voltar_em: voltarEm || null,
      });
      toast.success(voltarEm ? "Visita salva e retorno agendado no roteiro" : "Visita salva");
      onSalvo();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar visita");
    }
  }

  const atalho = (dias: number) => {
    const d = new Date(); d.setDate(d.getDate() + dias);
    setVoltarEm(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {RESULTADOS.map((r) => (
          <button
            key={r.id} type="button" onClick={() => setResultado(r.id)}
            className={`h-12 rounded-xl border text-sm font-semibold ${resultado === r.id ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="space-y-1"><Label>Com quem falei</Label><Input className="h-12" value={comQuem} onChange={(e) => setComQuem(e.target.value)} /></div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label>O que a pessoa disse</Label>
          <Button type="button" size="sm" variant={ditado.ouvindo ? "destructive" : "outline"} onClick={ditado.alternar}>
            {ditado.ouvindo ? <><MicOff /> Parar</> : <><Mic /> Falar</>}
          </Button>
        </div>
        <Textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>
      <div className="space-y-1"><Label>Objeções</Label><Input className="h-12" value={objecoes} onChange={(e) => setObjecoes(e.target.value)} /></div>
      <div className="space-y-1"><Label>Próximo passo</Label><Input className="h-12" value={proximo} onChange={(e) => setProximo(e.target.value)} /></div>
      <div className="space-y-1">
        <Label>Voltar em</Label>
        <div className="flex gap-2">
          {[1, 3, 7, 15].map((d) => <Button key={d} type="button" variant="outline" size="sm" onClick={() => atalho(d)}>+{d}d</Button>)}
        </div>
        <Input type="date" className="h-12" value={voltarEm} onChange={(e) => setVoltarEm(e.target.value)} />
      </div>
      <Button onClick={salvar} disabled={registrar.isPending} className="h-14 w-full text-base">
        {registrar.isPending ? "Salvando…" : "Salvar visita"}
      </Button>
    </div>
  );
}
