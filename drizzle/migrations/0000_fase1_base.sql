CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  peso numeric NOT NULL DEFAULT 5,
  criada_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, nome)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias TO authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categorias" ON public.categorias FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.lojas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  nome_fantasia text,
  categoria text,
  endereco text,
  bairro text,
  cidade text DEFAULT 'Caxias do Sul',
  latitude double precision,
  longitude double precision,
  telefone text,
  whatsapp text,
  site text,
  instagram text,
  google_place_id text,
  google_nota numeric,
  google_avaliacoes integer,
  horario_funcionamento text,
  status text NOT NULL DEFAULT 'nao_visitada',
  prioridade text NOT NULL DEFAULT 'media',
  potencial numeric NOT NULL DEFAULT 0,
  responsavel text,
  melhor_horario text,
  observacoes text,
  fechada boolean NOT NULL DEFAULT false,
  duplicada boolean NOT NULL DEFAULT false,
  exemplo boolean NOT NULL DEFAULT false,
  criada_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, google_place_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lojas TO authenticated;
GRANT ALL ON public.lojas TO service_role;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lojas" ON public.lojas FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.configuracoes (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  pesos jsonb NOT NULL DEFAULT '{"nota":30,"avaliacoes":25,"instagram":15,"site":10,"categoria":20}'::jsonb,
  atualizada_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own config" ON public.configuracoes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.roteiro_dia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  data date NOT NULL DEFAULT current_date,
  loja_id uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  concluida boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, data, loja_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roteiro_dia TO authenticated;
GRANT ALL ON public.roteiro_dia TO service_role;
ALTER TABLE public.roteiro_dia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roteiro" ON public.roteiro_dia FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());