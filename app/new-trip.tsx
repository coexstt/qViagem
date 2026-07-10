import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { insertTrip } from "../src/db/database";
import DestinationAutocomplete from "../src/components/DestinationAutocomplete";
import DateRangeCalendar from "../src/components/DateRangeCalendar";

export default function NewTripScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleSave() {
    if (!destination.trim()) {
      setError("Informe o destino da viagem.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Selecione a data de início e a data de fim.");
      return;
    }
    insertTrip(destination.trim(), startDate, endDate);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Destino
          </Text>
          <DestinationAutocomplete
            value={destination}
            onChangeText={setDestination}
            onSelect={setDestination}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Datas da viagem
          </Text>
          <DateRangeCalendar
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </View>

        {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

        <Pressable
          onPress={handleSave}
          className="bg-primary rounded-2xl py-4 items-center active:opacity-80"
        >
          <Text className="text-white text-base font-semibold">
            Salvar Viagem
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
