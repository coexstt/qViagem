import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Budget, TravelStyle } from "../db/database";

const BUDGET_OPTIONS: Budget[] = ["Econômico", "Médio", "Luxo"];
const STYLE_OPTIONS: TravelStyle[] = ["Aventura", "Cultural", "Relaxar", "Família"];

function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2.5 rounded-xl border mr-2 mb-2 ${
        selected ? "bg-primary border-primary" : "bg-white border-gray-200"
      }`}
    >
      <Text className={selected ? "text-white font-semibold" : "text-gray-700"}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function PilotoForm({
  destination,
  onGenerate,
}: {
  destination: string;
  onGenerate: (budget: Budget, style: TravelStyle) => Promise<void>;
}) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [style, setStyle] = useState<TravelStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!budget || !style) {
      setError("Escolha o orçamento e o estilo da viagem.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      await onGenerate(budget, style);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o roteiro.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (isGenerating) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-base font-semibold text-gray-900 mt-4 text-center">
          Gerando roteiro incrível para {destination}...
        </Text>
        <Text className="text-sm text-gray-500 mt-1 text-center">
          Isso pode levar até 30 segundos, principalmente em viagens mais longas.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-6">
      <Text className="text-lg font-semibold text-gray-900 mb-1">
        Vamos montar seu roteiro
      </Text>
      <Text className="text-sm text-gray-500 mb-6">
        Responda 2 perguntas rápidas e a IA monta os dias para você.
      </Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">Orçamento</Text>
      <View className="flex-row flex-wrap mb-5">
        {BUDGET_OPTIONS.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={budget === option}
            onPress={() => setBudget(option)}
          />
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-2">
        Estilo da viagem
      </Text>
      <View className="flex-row flex-wrap mb-6">
        {STYLE_OPTIONS.map((option) => (
          <Pill
            key={option}
            label={option}
            selected={style === option}
            onPress={() => setStyle(option)}
          />
        ))}
      </View>

      {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        className="bg-primary rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text className="text-white text-base font-semibold">
          Gerar Roteiro com IA
        </Text>
      </Pressable>
    </View>
  );
}
