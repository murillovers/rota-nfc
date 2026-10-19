# Rota NFC

Crie um CRM de prospecção em campo, mobile-first, em português do Brasil, de uso individual (um único usuário). Ele serve para eu vender placas NFC para lojas de Caxias do Sul (RS) e região. Quero mapear lojas, registrar visitas, organizar uma agenda e acompanhar o funil de vendas.

STACK E REGRAS GERAIS
- React + Tailwind + Supabase (banco, autenticação, storage e edge functions).
- Login simples por e-mail e senha, só para mim. Todas as tabelas com RLS restrita ao meu usuário.
- Todas as chaves de API (Google) ficam em secrets do Supabase e são usadas só em edge functions. Nunca no front-end.
- PWA instalável no celular, com modo offline para consultar fichas e registrar visitas, sincronizando depois.
- Interface limpa, botões grandes para uso na rua, com tema claro e escuro.
- Lembretes e avisos ficam dentro do próprio app. Não integrar com Google Agenda.

FASE 1 – BASE, MAPA E FICHA
1. Tabela "lojas": nome, nome fantasia, categoria, endereço, bairro, cidade, latitude, longitude, telefone, WhatsApp, site, Instagram, google_place_id (único, para evitar duplicados), nota e número de avaliações do Google, horário de funcionamento, status, prioridade (alta, média, baixa), pontuação de potencial, dono/responsável, melhor horário para contato, observações, criada_em.
2. Status do funil: não visitada, visitada, retornar, interessada, negociando, cliente, perdida, descartada.
3. Categorias iniciais: barbearia, salão de beleza, manicure e nail designer, loja de celular e acessórios, restaurante, lanchonete e cafeteria, padaria, pet shop, academia, clínica de estética, loja de roupas, ótica, floricultura, oficina mecânica, imobiliária, consultório (dentista, psicólogo), hotel e pousada, loja de móveis, mercado pequeno, tabacaria, tatuador. Categorias editáveis por mim.
4. Importação via Google Places API (New), em uma edge function: eu escolho categoria e região (Caxias do Sul e, opcionalmente, bairros ou cidades vizinhas), e o app busca, pagina os resultados e salva as lojas novas, sem duplicar por place_id. Mostrar quantas foram importadas.
5. Botão para adicionar loja manualmente e para marcar "fechada" ou "duplicada".
6. Tela de mapa (Google Maps JS) com pinos coloridos por status, agrupamento de pinos, filtros por categoria, bairro, status e prioridade, e busca por nome. Tocar no pino abre um resumo com botões: ligar, WhatsApp, abrir rota no Google Maps ou Waze e abrir ficha.
7. Visão em lista com os mesmos filtros e ordenação por prioridade, distância e potencial.
8. Botão "perto de mim": usa o GPS e lista as lojas mais próximas que ainda não visitei.
9. Pontuação de potencial automática, com base em nota e número de avaliações do Google, presença de Instagram e site, e categoria. Os pesos devem ser editáveis nas configurações.

FASE 2 – DADOS DA EMPRESA E FOTOS
1. Campo CNPJ na ficha, com máscara e validação. Um botão "buscar dados" chama uma edge function que consulta a BrasilAPI (https://brasilapi.com.br/api/cnpj/v1/{cnpj}) e preenche: razão social, nome fantasia, data de abertura, quadro de sócios (nome e qualificação), atividade principal (CNAE), porte, situação cadastral e telefone.
2. Na ficha mostrar "Aberta há X anos", destacar um selo "Empresa nova" para menos de 1 ano, e listar sócios com um botão para definir qual é o decisor (vira o campo "responsável"). Quando não houver CNPJ (informal ou MEI sem sócios), o campo responsável é preenchido por mim na visita.
3. Fotos: exibir as fotos da loja vindas do Google Places Photos usando a referência da foto, sem salvar o arquivo (respeitando os termos do Google, com atribuição). Além disso, um botão "tirar foto da fachada" que usa a câmera do celular e salva no Supabase Storage, na ficha da loja. Galeria na ficha.
4. Links de Instagram e site ficam salvos como atalhos clicáveis. Não fazer scraping.

FASE 3 – CRM, VISITAS E AGENDA
1. Tabela "visitas": loja, data e hora, resultado (não estava, dono ausente, conversei, pediu retorno, interessado, fechou, não quer), com quem falei, o que a pessoa disse, objeções e próximo passo.
2. Registro rápido de visita em poucos toques, com anotação por texto ou por voz (Web Speech API em pt-BR, convertendo para texto). Ao salvar, o status da loja atualiza e posso definir a data de retorno ("voltar em").
3. Histórico cronológico de visitas na ficha.
4. Tela de agenda, com visão semanal e diária, mostrando visitas agendadas e retornos. Posso arrastar um compromisso para remarcar e criar novos tocando em um horário. Título do evento: "Visitar [loja]" ou o objetivo; descrição com os detalhes da conversa anterior.
5. Aviso na tela inicial: "Hoje você tem X retornos e Y visitas", com lista de lojas atrasadas em destaque.
6. "Rota do dia": ordena as lojas agendadas por proximidade e mostra o trajeto, com botão para abrir no Google Maps ou Waze com todos os pontos.
7. Funil em formato kanban, arrastando a loja entre as etapas.

FASE 4 – VENDAS E PÓS-VENDA
1. Tabela "propostas/pedidos": loja, quantidade de placas, valor unitário, desconto, total, status (enviada, aceita, produzida, instalada, paga) e datas.
2. Calculadora rápida de proposta com tabela de preços por quantidade, editável. Botão para gerar a proposta em texto ou PDF e enviar por WhatsApp (link wa.me já com a mensagem).
3. Modelos de mensagem de WhatsApp (primeiro contato, follow-up, pós-visita, pós-venda), com variáveis como {nome_loja} e {responsavel}. Editáveis.
4. Roteiros de abordagem e respostas a objeções por categoria de loja, editáveis e consultáveis na ficha.
5. Pós-venda: após a venda, criar automaticamente tarefas internas de "checar se a placa funciona" (7 dias depois) e "pedir indicação". Campos "quem indicou" e "pode indicar".
6. Motivo da perda, obrigatório ao marcar como perdida.

FASE 5 – DEMO NFC E MÉTRICAS
1. Páginas públicas de demonstração em /demo/:slug, geradas por loja, mostrando como ficaria a página da loja ao encostar a placa (avaliação no Google, Instagram, WhatsApp, cardápio), com o nome e a logo dela. Gerar um QR code para mostrar na visita.
2. Links curtos /t/:slug para as placas vendidas, que registram cada toque (data e hora) e redirecionam para o destino. Contador de toques por loja na ficha, para provar resultado ao cliente.
3. Painel com: lojas visitadas na semana, meta semanal de visitas com barra de progresso, taxa de conversão, faturamento do mês e meta, ranking das categorias que mais fecham, e mapa de calor das regiões com mais vendas.
4. Exportar e importar lojas em CSV e fazer backup dos dados.

PADRÕES DE QUALIDADE
- Estados de carregamento, mensagens de erro claras e confirmação antes de excluir.
- Dados de exemplo (10 lojas fictícias) para eu testar, removíveis com um botão.
- Código organizado em componentes pequenos, com tipos bem definidos.

COMO CONSTRUIR
Implemente uma fase por vez. Comece pela Fase 1, me avise ao terminar e aguarde meu "continuar" antes de seguir para a próxima. Se precisar de chaves de API, me peça e indique onde configurá-las.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a6115f6-0bdf-4283-9a08-b3fd4504d66c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
