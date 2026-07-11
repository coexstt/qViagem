import { TravelStyle } from "../db/database";

const BASE_ITEMS = [
  "Documentos e passaporte",
  "Carregador de celular",
  "Itens de higiene pessoal",
  "Remédios de uso pessoal",
  "Fones de ouvido",
];

const HOT_KEYWORDS = ["praia", "mar", "calor"];
const HOT_ITEMS = ["Protetor solar", "Roupas de banho", "Óculos de sol"];

const COLD_KEYWORDS = ["frio", "neve", "inverno", "gelo"];
const COLD_ITEMS = ["Casaco pesado", "Cachecol"];

// Sugestão 100% local (sem IA) baseada em palavras-chave do destino/estilo —
// mantém a Mala rápida e gratuita para popular.
export function suggestPackingItems(
  destination: string,
  style: TravelStyle | null
): string[] {
  const text = `${destination} ${style ?? ""}`.toLowerCase();
  const items = [...BASE_ITEMS];

  if (HOT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    items.push(...HOT_ITEMS);
  }
  if (COLD_KEYWORDS.some((keyword) => text.includes(keyword))) {
    items.push(...COLD_ITEMS);
  }

  return items;
}
