export type PlaceSuggestion = {
  id: string;
  label: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim (OpenStreetMap) é gratuito e não exige chave de API — só pede
// um User-Agent identificando o app e uso moderado (por isso o debounce
// na tela que chama essa função).
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `${ENDPOINT}?format=jsonv2&addressdetails=1&limit=6&accept-language=pt-BR&q=${encodeURIComponent(
    trimmed
  )}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "qViagem/1.0 (personal travel itinerary app)",
    },
  });
  if (!response.ok) return [];

  const results: NominatimResult[] = await response.json();

  return results.map((result) => {
    const place =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.municipality ||
      result.address?.county ||
      result.display_name.split(",")[0];
    const country = result.address?.country;
    const label = country ? `${place}, ${country}` : place;

    return { id: String(result.place_id), label };
  });
}
