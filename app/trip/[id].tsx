import { useCallback, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
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
import { generateAlternative, generateItinerary } from "../../src/services/gemini";
import { getApiKey } from "../../src/services/apiKey";
import { formatDayLabel, tripDurationDays } from "../../src/utils/date";
import PilotoForm from "../../src/components/PilotoForm";
import DayBlock from "../../src/components/DayBlock";
import AddActivityModal from "../../src/components/AddActivityModal";

export default function TripAgendaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripId = Number(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [swappingItemId, setSwappingItemId] = useState<number | null>(null);
  const [addActivityDayIndex, setAddActivityDayIndex] = useState<number | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: trip.destination,
          headerRight: () => (
            <Text
              onPress={() => router.push("/api-key")}
              className="text-primary text-lg"
            >
              ⚙️
            </Text>
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

      <AddActivityModal
        visible={addActivityDayIndex !== null}
        onClose={() => setAddActivityDayIndex(null)}
        onSubmit={handleAddActivitySubmit}
      />
    </SafeAreaView>
  );
}
