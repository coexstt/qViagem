import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Budget,
  ItineraryItem,
  Trip,
  TravelStyle,
  getItineraryForTrip,
  getTripById,
  insertGeneratedItems,
  insertManualItem,
  moveItem,
  updateItemContent,
  updateTripPreferences,
} from "../../src/db/database";
import {
  generateAlternative,
  generateItinerary,
  generateRainAlternatives,
} from "../../src/services/gemini";
import { getApiKey } from "../../src/services/apiKey";
import { getCurrentCoords } from "../../src/services/location";
import { reverseGeocode } from "../../src/services/geocoding";
import {
  currentPeriodNow,
  currentTripDayIndex,
  formatDayLabel,
  tripDurationDays,
} from "../../src/utils/date";
import { formatItineraryForSharing } from "../../src/utils/share";
import PilotoForm from "../../src/components/PilotoForm";
import DayBlock from "../../src/components/DayBlock";
import AddActivityModal from "../../src/components/AddActivityModal";
import RainAlternativesModal, {
  RainSuggestion,
} from "../../src/components/RainAlternativesModal";

export default function TripAgendaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripId = Number(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [swappingItemId, setSwappingItemId] = useState<number | null>(null);
  const [addActivityDayIndex, setAddActivityDayIndex] = useState<number | null>(null);
  const [rainModalVisible, setRainModalVisible] = useState(false);
  const [rainLoading, setRainLoading] = useState(false);
  const [rainError, setRainError] = useState<string | null>(null);
  const [rainSuggestions, setRainSuggestions] = useState<RainSuggestion[]>([]);
  const [rainAddedTitles, setRainAddedTitles] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setTrip(getTripById(tripId));
    setItems(getItineraryForTrip(tripId));
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!trip) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <Stack.Screen options={{ title: "Agenda" }} />
      </SafeAreaView>
    );
  }

  const currentTrip: Trip = trip;
  const totalDays = tripDurationDays(currentTrip.startDate, currentTrip.endDate);

  async function handleGenerate(budget: Budget, style: TravelStyle) {
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert(
        "Chave da API necessária",
        "Configure sua chave gratuita do Gemini para gerar roteiros com IA.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Configurar", onPress: () => router.push("/api-key") },
        ]
      );
      return;
    }

    updateTripPreferences(currentTrip.id, budget, style);
    const generated = await generateItinerary({
      destination: currentTrip.destination,
      days: totalDays,
      budget,
      style,
    });
    insertGeneratedItems(currentTrip.id, generated);
    refresh();
  }

  async function handleSwap(item: ItineraryItem) {
    setSwappingItemId(item.id);
    try {
      const alternative = await generateAlternative({
        destination: currentTrip.destination,
        period: item.period,
        budget: currentTrip.budget ?? "Médio",
        style: currentTrip.style ?? "Cultural",
        currentTitle: item.title,
        avoidTitles: items.filter((i) => i.id !== item.id).map((i) => i.title),
      });
      updateItemContent(item.id, alternative.title, alternative.description);
      refresh();
    } catch (e) {
      Alert.alert(
        "Não foi possível trocar a sugestão",
        e instanceof Error ? e.message : "Tente novamente."
      );
    } finally {
      setSwappingItemId(null);
    }
  }

  function handleMove(item: ItineraryItem, direction: "up" | "down") {
    moveItem(item, direction);
    refresh();
  }

  function handleAddActivitySubmit(
    period: ItineraryItem["period"],
    title: string,
    description: string
  ) {
    if (addActivityDayIndex === null) return;
    insertManualItem(currentTrip.id, addActivityDayIndex, period, title, description);
    refresh();
  }

  async function handleOpenRainModal() {
    setRainModalVisible(true);
    setRainLoading(true);
    setRainError(null);
    setRainSuggestions([]);
    setRainAddedTitles([]);

    try {
      const coords = await getCurrentCoords();
      const locationContext = coords
        ? (await reverseGeocode(coords.latitude, coords.longitude)) ??
          currentTrip.destination
        : currentTrip.destination;

      const suggestions = await generateRainAlternatives({
        locationContext,
        budget: currentTrip.budget ?? "Médio",
        style: currentTrip.style ?? "Cultural",
      });
      setRainSuggestions(suggestions);
    } catch (e) {
      setRainError(
        e instanceof Error ? e.message : "Não foi possível buscar alternativas."
      );
    } finally {
      setRainLoading(false);
    }
  }

  function handleAddRainSuggestion(suggestion: RainSuggestion) {
    const dayIndex = currentTripDayIndex(currentTrip.startDate, currentTrip.endDate);
    const period = currentPeriodNow();
    insertGeneratedItems(currentTrip.id, [
      { dayIndex, period, title: suggestion.title, description: suggestion.description },
    ]);
    setRainAddedTitles((prev) => [...prev, suggestion.title]);
    refresh();
  }

  async function handleShare() {
    const text = formatItineraryForSharing(currentTrip, items);
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert("Não foi possível compartilhar", "Tente novamente.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: trip.destination,
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              {items.length > 0 && (
                <Text onPress={handleShare} className="text-primary text-lg">
                  📤
                </Text>
              )}
              <Text
                onPress={() => router.push("/api-key")}
                className="text-primary text-lg"
              >
                ⚙️
              </Text>
            </View>
          ),
        }}
      />

      {items.length === 0 ? (
        <PilotoForm destination={trip.destination} onGenerate={handleGenerate} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {Array.from({ length: totalDays }, (_, dayIndex) => (
            <DayBlock
              key={dayIndex}
              dayIndex={dayIndex}
              dateLabel={formatDayLabel(trip.startDate, dayIndex)}
              items={items.filter((item) => item.dayIndex === dayIndex)}
              swappingItemId={swappingItemId}
              onMove={handleMove}
              onSwap={handleSwap}
              onAddActivity={setAddActivityDayIndex}
            />
          ))}
        </ScrollView>
      )}

      {items.length > 0 && (
        <Pressable
          onPress={handleOpenRainModal}
          className="absolute bottom-6 right-6 bg-gray-900 rounded-full px-4 py-3 active:opacity-80"
        >
          <Text className="text-white text-sm font-semibold">
            🌧️ Mudar Planos (Choveu!)
          </Text>
        </Pressable>
      )}

      <AddActivityModal
        visible={addActivityDayIndex !== null}
        onClose={() => setAddActivityDayIndex(null)}
        onSubmit={handleAddActivitySubmit}
      />

      <RainAlternativesModal
        visible={rainModalVisible}
        isLoading={rainLoading}
        errorMessage={rainError}
        suggestions={rainSuggestions}
        addedTitles={rainAddedTitles}
        onAdd={handleAddRainSuggestion}
        onClose={() => setRainModalVisible(false)}
      />
    </SafeAreaView>
  );
}
