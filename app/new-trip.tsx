import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { insertTrip } from "../src/db/database";

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NewTripScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState("");

  function handleStartChange(event: DateTimePickerEvent, date?: Date) {
    setShowStartPicker(Platform.OS === "ios");
    if (event.type === "dismissed" || !date) return;
    setStartDate(date);
    if (date > endDate) setEndDate(date);
  }

  function handleEndChange(event: DateTimePickerEvent, date?: Date) {
    setShowEndPicker(Platform.OS === "ios");
    if (event.type === "dismissed" || !date) return;
    setEndDate(date);
  }

  function handleSave() {
    if (!destination.trim()) {
      setError("Informe o destino da viagem.");
      return;
    }
    if (endDate < startDate) {
      setError("A data de fim não pode ser antes da data de início.");
      return;
    }
    insertTrip(destination.trim(), toISODate(startDate), toISODate(endDate));
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-6 gap-5">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Destino
          </Text>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Ex: Paris, França"
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Data de início
          </Text>
          <Pressable
            onPress={() => setShowStartPicker(true)}
            className="border border-gray-200 rounded-xl px-4 py-3"
          >
            <Text className="text-base text-gray-900">
              {formatDisplay(startDate)}
            </Text>
          </Pressable>
          {showStartPicker && (
            <View className={Platform.OS === "ios" ? "items-end" : undefined}>
              {Platform.OS === "ios" && (
                <Pressable onPress={() => setShowStartPicker(false)} className="py-2">
                  <Text className="text-primary font-semibold">Concluído</Text>
                </Pressable>
              )}
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartChange}
              />
            </View>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Data de fim
          </Text>
          <Pressable
            onPress={() => setShowEndPicker(true)}
            className="border border-gray-200 rounded-xl px-4 py-3"
          >
            <Text className="text-base text-gray-900">
              {formatDisplay(endDate)}
            </Text>
          </Pressable>
          {showEndPicker && (
            <View className={Platform.OS === "ios" ? "items-end" : undefined}>
              {Platform.OS === "ios" && (
                <Pressable onPress={() => setShowEndPicker(false)} className="py-2">
                  <Text className="text-primary font-semibold">Concluído</Text>
                </Pressable>
              )}
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={handleEndChange}
              />
            </View>
          )}
        </View>

        {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

        <Pressable
          onPress={handleSave}
          className="bg-primary rounded-2xl py-4 items-center mt-2 active:opacity-80"
        >
          <Text className="text-white text-base font-semibold">
            Salvar Viagem
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
