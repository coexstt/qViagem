import { Budget, NewItineraryItem, Period, TravelStyle } from "../db/database";
import { getApiKey } from "./apiKey";

const MODEL = "gemini-3.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class MissingApiKeyError extends Error {
  constructor() {
    super("Nenhuma chave de API do Gemini foi configurada.");
    this.name = "MissingApiKeyError";
  }
}

const ACTIVITY_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
  },
  required: ["title", "description"],
};

const ITINERARY_SCHEMA = {
  type: "OBJECT",
  properties: {
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          manha: ACTIVITY_SCHEMA,
          tarde: ACTIVITY_SCHEMA,
          noite: ACTIVITY_SCHEMA,
        },
        required: ["manha", "tarde", "noite"],
      },
    },
  },
  required: ["days"],
};

type RawActivity = { title: string; description: string };
type RawDay = { manha: RawActivity; tarde: RawActivity; noite: RawActivity };

async function callGemini(prompt: string, schema: object): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new MissingApiKeyError();

  const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: schema,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini respondeu com erro (${response.status}): ${body}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("A resposta da IA veio vazia.");
  return text;
}

type GenerateItineraryParams = {
  destination: string;
  days: number;
  budget: Budget;
  style: TravelStyle;
};

export async function generateItinerary(
  params: GenerateItineraryParams
): Promise<NewItineraryItem[]> {
  const prompt = `
Você é um planejador de viagens especialista. Monte um roteiro de ${params.days} dia(s) para uma viagem a ${params.destination}.

Preferências do viajante:
- Orçamento: ${params.budget}
- Estilo da viagem: ${params.style}

Regras:
- Cada dia deve ter exatamente 3 atividades: manhã, tarde e noite.
- Considere deslocamento e proximidade geográfica entre as atividades de um mesmo dia, evitando trajetos ilógicos.
- Varie os tipos de atividade ao longo dos dias (não repita o mesmo tipo de atração todo dia).
- Respeite o orçamento e o estilo escolhidos nas sugestões (ex: luxo sugere experiências mais exclusivas; econômico prioriza opções gratuitas ou de baixo custo).
- "title" deve ser curto (até 8 palavras). "description" deve ter 1-2 frases práticas (o que fazer, dica útil).
- Responda em português do Brasil.
- Retorne exatamente ${params.days} itens no array "days", na ordem cronológica.
`.trim();

  const text = await callGemini(prompt, ITINERARY_SCHEMA);

  let parsed: { days: RawDay[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Não consegui entender a resposta da IA. Tente novamente.");
  }

  const items: NewItineraryItem[] = [];
  parsed.days.forEach((day, dayIndex) => {
    (["manha", "tarde", "noite"] as Period[]).forEach((period) => {
      const activity = day[period];
      items.push({
        dayIndex,
        period,
        title: activity.title,
        description: activity.description,
      });
    });
  });
  return items;
}

type GenerateAlternativeParams = {
  destination: string;
  period: Period;
  budget: Budget;
  style: TravelStyle;
  currentTitle: string;
  avoidTitles: string[];
};

const PERIOD_LABEL: Record<Period, string> = {
  manha: "manhã",
  tarde: "tarde",
  noite: "noite",
};

export async function generateAlternative(
  params: GenerateAlternativeParams
): Promise<RawActivity> {
  const prompt = `
Sugira UMA atividade alternativa para substituir "${params.currentTitle}" no período da ${PERIOD_LABEL[params.period]} de uma viagem a ${params.destination}.

Preferências do viajante:
- Orçamento: ${params.budget}
- Estilo da viagem: ${params.style}

Não repita nenhuma destas atividades já usadas na viagem: ${params.avoidTitles.join(", ") || "nenhuma"}.

"title" deve ser curto (até 8 palavras). "description" deve ter 1-2 frases práticas. Responda em português do Brasil.
`.trim();

  const text = await callGemini(prompt, ACTIVITY_SCHEMA);
  try {
    return JSON.parse(text) as RawActivity;
  } catch {
    throw new Error("Não consegui entender a resposta da IA. Tente novamente.");
  }
}
