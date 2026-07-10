import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "gemini_api_key";

// Chave padrão embutida no build via .env (nunca commitada — veja .gitignore).
// Uma chave salva manualmente pelo usuário em Settings sempre tem prioridade.
const DEFAULT_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? null;

export async function getApiKey(): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  return stored ?? DEFAULT_API_KEY;
}

export async function hasCustomApiKey(): Promise<boolean> {
  return (await SecureStore.getItemAsync(STORAGE_KEY)) !== null;
}

export async function setApiKey(value: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
