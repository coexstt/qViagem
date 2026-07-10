import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { getTripById, Trip } from "../../src/db/database";

export default function TripAgendaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    setTrip(getTripById(Number(id)));
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <Stack.Screen options={{ title: trip?.destination ?? "Agenda" }} />
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🗓️</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          Agenda ainda vazia
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Em breve você vai poder montar o roteiro dia a dia
          {trip ? ` de ${trip.destination}` : ""}.
        </Text>
      </View>
    </SafeAreaView>
  );
}
