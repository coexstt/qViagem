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
  geosearchNearby,
  getSummary,
  searchByName,
} from "../../src/services/wikipedia";
import { generateNarrative } from "../../src/services/gemini";
import StoryCard from "../../src/components/StoryCard";
import PlaceResultsList from "../../src/components/PlaceResultsList";

type ScreenState =
  | { step: "idle" }
  | { step: "loading"; message: string }
  | { step: "results"; places: WikiPlace[] }
  | {
      step: "story";
      title: string;
      thumbnailUrl?: string;
      narrative: string;
      distanceMeters?: number;
    }
  | { step: "error"; message: string };

export default function GuiaLocalScreen() {
  const [state, setState] = useState<ScreenState>({ step: "idle" });
  const [searchQuery, setSearchQuery] = useState("");

  function reset() {
    setState({ step: "idle" });
    setSearchQuery("");
  }

  async function loadStoryFor(place: WikiPlace) {
    setState({ step: "loading", message: "Preparando a história..." });
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
      const narrative = await generateNarrative({
        title: summary.title,
        sourceText: summary.extract,
      });
      setState({
        step: "story",
        title: summary.title,
        thumbnailUrl: summary.thumbnailUrl,
        narrative,
        distanceMeters: place.distanceMeters,
      });
    } catch (e) {
      setState({
        step: "error",
        message:
          e instanceof Error ? e.message : "Não foi possível gerar a história.",
      });
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
        await loadStoryFor(places[0]);
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

        {state.step === "story" ? (
          <StoryCard
            title={state.title}
            thumbnailUrl={state.thumbnailUrl}
            narrative={state.narrative}
            distanceMeters={state.distanceMeters}
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
              <PlaceResultsList places={state.places} onSelect={loadStoryFor} />
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
