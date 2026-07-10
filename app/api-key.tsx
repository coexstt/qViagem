import { useEffect, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { getApiKey, setApiKey } from "../src/services/apiKey";

export default function ApiKeyScreen() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getApiKey().then((saved) => setHasSavedKey(Boolean(saved)));
  }, []);

  async function handleSave() {
    if (!key.trim()) {
      setError("Cole sua chave da API antes de salvar.");
      return;
    }
    await setApiKey(key.trim());
    router.back();
  }

  return (
    <View className="flex-1 bg-white px-6 pt-6 gap-5">
      <View>
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          Chave da API do Gemini
        </Text>
        <Text className="text-sm text-gray-500 leading-5">
          O qViagem usa a IA do Google Gemini para gerar seus roteiros. Crie
          uma chave gratuita no Google AI Studio e cole abaixo — ela fica
          guardada com segurança só no seu aparelho.
        </Text>
      </View>

      <Pressable
        onPress={() => Linking.openURL("https://aistudio.google.com/apikey")}
      >
        <Text className="text-primary font-semibold">
          Abrir aistudio.google.com/apikey ↗
        </Text>
      </Pressable>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {hasSavedKey ? "Substituir chave salva" : "Sua chave da API"}
        </Text>
        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder="AIza..."
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          className="border border-gray-200 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

      <Pressable
        onPress={handleSave}
        className="bg-primary rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text className="text-white text-base font-semibold">Salvar chave</Text>
      </Pressable>
    </View>
  );
}
