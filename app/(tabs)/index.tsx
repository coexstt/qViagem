import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { getAllTrips, Trip } from "../../src/db/database";

const DESTINATION_ICONS = ["🏖️", "🏔️", "🏙️", "🗼", "🏰", "🌴", "⛩️", "🏝️"];

function iconFor(destination: string) {
  const index = destination.charCodeAt(0) % DESTINATION_ICONS.length;
  return DESTINATION_ICONS[index];
}

function formatRange(startDate: string, endDate: string) {
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const start = new Date(startDate).toLocaleDateString("pt-BR", options);
  const end = new Date(endDate).toLocaleDateString("pt-BR", options);
  return `${start} - ${end}`;
}

export default function MeusRoteirosScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setTrips(getAllTrips());
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Meus Roteiros</Text>
        <Pressable
          onPress={() => router.push("/new-trip")}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-80"
        >
          <Text className="text-white text-2xl leading-none">+</Text>
        </Pressable>
      </View>

      {trips.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🧳</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            Nenhuma viagem ainda
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6">
            Comece agora e monte seu primeiro roteiro.
          </Text>
          <Pressable
            onPress={() => router.push("/new-trip")}
            className="bg-primary rounded-2xl py-4 px-8 active:opacity-80"
          >
            <Text className="text-white text-base font-semibold">
              Iniciar Nova Viagem
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 24, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/trip/${item.id}`)}
              className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 active:opacity-80"
            >
              <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-4">
                <Text className="text-2xl">{iconFor(item.destination)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {item.destination}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {formatRange(item.startDate, item.endDate)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
