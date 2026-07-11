import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { updateTripNotes } from "../db/database";

const AUTOSAVE_DELAY_MS = 600;

export default function TripNotes({
  tripId,
  initialNotes,
}: {
  tripId: number;
  initialNotes: string;
}) {
  const [text, setText] = useState(initialNotes);
  const textRef = useRef(text);
  const isFirstRender = useRef(true);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Autosave com debounce: espera o usuário parar de digitar por um
  // instante antes de gravar no banco.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      updateTripNotes(tripId, text);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text, tripId]);

  // Se o usuário trocar de aba antes do debounce disparar, grava na hora
  // pra não perder o que foi digitado.
  useEffect(() => {
    return () => {
      updateTripNotes(tripId, textRef.current);
    };
  }, [tripId]);

  return (
    <View className="flex-1 px-6 pt-2 pb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-gray-900">
          O que anotar
        </Text>
        <Text className="text-xs text-gray-400">💾 Salvo automaticamente</Text>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
        placeholder="Cole aqui códigos de reserva, horários de voo, endereços, anotações gerais..."
        className="flex-1 border border-gray-200 rounded-2xl p-4 text-base text-gray-900"
      />
    </View>
  );
}
