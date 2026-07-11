import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentCoords } from "../../src/services/location";
import {
  WikiPlace,
  WikiSummary,
  geosearchNearby,
  getSummary,
  searchByName,
} from "../../src/services/wikipedia";
import { generateNarrative } from "../../src/services/gemini";
import { getCachedNarrative, saveNarrative } from "../../src/db/database";
import StoryCard from "../../src/components/StoryCard";
import PlaceResultsList from "../../src/components/PlaceResultsList";

type ScreenState =
  | { step: "idle" }
  | { step: "loading"; message: string }
  | { step: "results"; places: WikiPlace[] }
  | {
      step: "place";
      place: WikiPlace;
      summary: WikiSummary;
      displayText: string;
      isAiGenerated: boolean;
      isTransforming: boolean;
    }
  | { step: "error"; message: string };

export default function GuiaLocalScreen() {
  const [state, setState] = useState<ScreenState>({ step: "idle" });
  const [searchQuery, setSearchQuery] = useState("");

  function reset() {
    setState({ step: "idle" });
    setSearchQuery("");
  }

  // A Wikipedia é gratuita e ilimitada, então mostramos o texto bruto dela
  // na hora. O Gemini só entra em jogo se o usuário pedir explicitamente
  // (botão "Transformar com IA"), pra economizar a cota gratuita.
  async function loadPlace(place: WikiPlace) {
    setState({ step: "loading", message: "Buscando informações na Wikipedia..." });
    try {
      const summary = await getSummary(place.title, place.lang);
      if (!summary.extract) {
        setState({
          step: "error",
          message:
            "Esse local não tem texto suficiente na Wikipedia para gerar uma história.",
        });
        return;
      }
      setState({
        step: "place",
        place,
        summary,
        displayText: summary.extract,
        isAiGenerated: false,
        isTransforming: false,
      });
    } catch {
      setState({
        step: "error",
        message: "Não foi possível carregar informações da Wikipedia.",
      });
    }
  }

  async function handleTransformWithAI() {
    if (state.step !== "place") return;
    const { place, summary } = state;

    const cached = getCachedNarrative(place.lang, summary.title);
    if (cached) {
      setState({ ...state, displayText: cached, isAiGenerated: true });
      return;
    }

    setState({ ...state, isTransforming: true });
    try {
      const narrative = await generateNarrative({
        title: summary.title,
        sourceText: summary.extract,
      });
      saveNarrative(place.lang, summary.title, narrative);
      setState({
        ...state,
        displayText: narrative,
        isAiGenerated: true,
        isTransforming: false,
      });
    } catch (e) {
      Alert.alert(
        "Não foi possível gerar a narrativa",
        e instanceof Error ? e.message : "Tente novamente."
      );
      setState({ ...state, isTransforming: false });
    }
  }

  async function handleLocateMe() {
    setState({ step: "loading", message: "Obtendo sua localização..." });
    const coords = await getCurrentCoords();
    if (!coords) {
      Alert.alert(
        "Permissão de localização negada",
        "Sem acesso ao GPS, você ainda pode pesquisar um monumento manualmente abaixo."
      );
      setState({ step: "idle" });
      return;
    }

    setState({ step: "loading", message: "Procurando pontos históricos por perto..." });
    try {
      const places = await geosearchNearby(coords.latitude, coords.longitude, 500);
      if (places.length === 0) {
        setState({
          step: "error",
          message:
            "Nenhum ponto histórico encontrado num raio de 500m. Tente pesquisar manualmente abaixo.",
        });
        return;
      }
      if (places.length === 1) {
        await loadPlace(places[0]);
      } else {
        setState({ step: "results", places });
      }
    } catch {
      setState({
        step: "error",
        message: "Não foi possível buscar locais próximos. Tente novamente.",
      });
    }
  }

  async function handleManualSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    setState({ step: "loading", message: "Pesquisando..." });
    try {
      const places = await searchByName(query);
      if (places.length === 0) {
        setState({
          step: "error",
          message: `Nenhum resultado encontrado para "${query}".`,
        });
        return;
      }
      setState({ step: "results", places });
    } catch {
      setState({
        step: "error",
        message: "Não foi possível pesquisar agora. Tente novamente.",
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Guia Local</Text>
        <Text className="text-sm text-gray-500 mb-6">
          Descubra a história dos lugares ao seu redor.
        </Text>

        {state.step === "place" ? (
          <StoryCard
            title={state.summary.title}
            thumbnailUrl={state.summary.thumbnailUrl}
            distanceMeters={state.place.distanceMeters}
            text={state.displayText}
            isAiGenerated={state.isAiGenerated}
            isTransforming={state.isTransforming}
            onTransform={handleTransformWithAI}
            onReset={reset}
          />
        ) : (
          <>
            <Pressable
              onPress={handleLocateMe}
              disabled={state.step === "loading"}
              className="bg-primary rounded-2xl py-5 items-center mb-6 active:opacity-80"
            >
              <Text className="text-white text-base font-semibold">
                📍 Onde estou agora?
              </Text>
            </Pressable>

            <Text className="text-sm font-medium text-gray-700 mb-2">
              Ou pesquise um monumento
            </Text>
            <View className="flex-row gap-2 mb-6">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleManualSearch}
                placeholder="Ex: Torre Eiffel"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base"
              />
              <Pressable
                onPress={handleManualSearch}
                className="bg-gray-900 rounded-xl px-5 items-center justify-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Buscar</Text>
              </Pressable>
            </View>

            {state.step === "loading" && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-sm text-gray-500 mt-3">{state.message}</Text>
              </View>
            )}

            {state.step === "results" && (
              <PlaceResultsList places={state.places} onSelect={loadPlace} />
            )}

            {state.step === "error" && (
              <View className="items-center py-8 px-4">
                <Text className="text-4xl mb-3">🤔</Text>
                <Text className="text-sm text-gray-600 text-center">
                  {state.message}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
