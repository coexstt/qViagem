export type WikiLang = "pt" | "en";

export type WikiPlace = {
  pageId: number;
  title: string;
  lang: WikiLang;
  distanceMeters?: number;
};

export type WikiSummary = {
  title: string;
  extract: string;
  thumbnailUrl?: string;
};

type GeosearchResult = { pageid: number; title: string; dist: number };
type SearchResult = { pageid: number; title: string };

async function geosearchLang(
  lat: number,
  lon: number,
  radiusMeters: number,
  lang: WikiLang
): Promise<WikiPlace[]> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=${radiusMeters}&gslimit=10&format=json&origin=*`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json();
  const results: GeosearchResult[] = json?.query?.geosearch ?? [];
  return results.map((r) => ({
    pageId: r.pageid,
    title: r.title,
    lang,
    distanceMeters: Math.round(r.dist),
  }));
}

// A Wikipedia em português costuma ter menos cobertura fora do Brasil,
// então caímos para o inglês quando não há nada por perto no idioma pt.
export async function geosearchNearby(
  lat: number,
  lon: number,
  radiusMeters = 500
): Promise<WikiPlace[]> {
  const ptResults = await geosearchLang(lat, lon, radiusMeters, "pt");
  if (ptResults.length > 0) return ptResults;
  return geosearchLang(lat, lon, radiusMeters, "en");
}

async function searchLang(query: string, lang: WikiLang): Promise<WikiPlace[]> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&srlimit=8&format=json&origin=*`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json();
  const results: SearchResult[] = json?.query?.search ?? [];
  return results.map((r) => ({ pageId: r.pageid, title: r.title, lang }));
}

export async function searchByName(query: string): Promise<WikiPlace[]> {
  const ptResults = await searchLang(query, "pt");
  if (ptResults.length > 0) return ptResults;
  return searchLang(query, "en");
}

export async function getSummary(
  title: string,
  lang: WikiLang
): Promise<WikiSummary> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível carregar informações da Wikipedia.");
  }
  const json = await response.json();
  return {
    title: json.title ?? title,
    extract: json.extract ?? "",
    thumbnailUrl: json.thumbnail?.source,
  };
}
