import type { LojaInsert } from "./crm";

export const LOJAS_EXEMPLO: LojaInsert[] = [
  { nome: "Barbearia do Gringo", categoria: "Barbearia", bairro: "Centro", latitude: -29.1685, longitude: -51.1799, google_nota: 4.8, google_avaliacoes: 312, instagram: "@barbeariadogringo", telefone: "(54) 99911-0001", whatsapp: "54999110001", prioridade: "alta" },
  { nome: "Salão Bella Serra", categoria: "Salão de beleza", bairro: "São Pelegrino", latitude: -29.1652, longitude: -51.1868, google_nota: 4.6, google_avaliacoes: 158, instagram: "@bellaserra", status: "visitada" },
  { nome: "Cantina Nonna Lúcia", categoria: "Restaurante", bairro: "Exposição", latitude: -29.1561, longitude: -51.1765, google_nota: 4.7, google_avaliacoes: 890, site: "nonnalucia.com.br", status: "interessada", prioridade: "alta" },
  { nome: "Café Colonial Uva", categoria: "Lanchonete e cafeteria", bairro: "Pio X", latitude: -29.1601, longitude: -51.1702, google_nota: 4.4, google_avaliacoes: 97, status: "retornar" },
  { nome: "Pet Amigo Caxias", categoria: "Pet shop", bairro: "Panazzolo", latitude: -29.1749, longitude: -51.1888, google_nota: 4.5, google_avaliacoes: 210, instagram: "@petamigocx" },
  { nome: "Academia Força Gaúcha", categoria: "Academia", bairro: "Madureira", latitude: -29.1801, longitude: -51.1745, google_nota: 4.3, google_avaliacoes: 402, site: "forcagaucha.com", status: "negociando" },
  { nome: "Estética Pele de Seda", categoria: "Clínica de estética", bairro: "Lourdes", latitude: -29.1633, longitude: -51.1951, google_nota: 4.9, google_avaliacoes: 75, instagram: "@peledeseda", status: "cliente" },
  { nome: "Ótica Visão Serrana", categoria: "Ótica", bairro: "Centro", latitude: -29.1678, longitude: -51.1820, google_nota: 4.2, google_avaliacoes: 48, prioridade: "baixa" },
  { nome: "Tattoo Black Pine", categoria: "Tatuador", bairro: "Rio Branco", latitude: -29.1570, longitude: -51.1885, google_nota: 5.0, google_avaliacoes: 133, instagram: "@blackpinetattoo" },
  { nome: "Padaria Pão da Serra", categoria: "Padaria", bairro: "Cristo Redentor", latitude: -29.1890, longitude: -51.1670, google_nota: 4.1, google_avaliacoes: 260, status: "perdida", prioridade: "baixa" },
].map((l) => ({ ...l, cidade: "Caxias do Sul", endereco: `${l.bairro}, Caxias do Sul - RS`, exemplo: true }));
