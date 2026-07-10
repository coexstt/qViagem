import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Period } from "../db/database";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export default function AddActivityModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (period: Period, title: string, description: string) => void;
}) {
  const [period, setPeriod] = useState<Period>("manha");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setPeriod("manha");
    setTitle("");
    setDescription("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError("Digite o nome da atividade.");
      return;
    }
    onSubmit(period, title.trim(), description.trim());
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8 gap-4">
            <Text className="text-lg font-semibold text-gray-900">
              Adicionar atividade
            </Text>

            <View className="flex-row">
              {PERIOD_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setPeriod(option.value)}
                  className={`px-4 py-2 rounded-xl border mr-2 ${
                    period === option.value
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={
                      period === option.value
                        ? "text-white font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Nome da atividade
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Jantar no restaurante X"
                className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Detalhes (opcional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Endereço, horário, observações..."
                multiline
                className="border border-gray-200 rounded-xl px-4 py-3 text-base min-h-[72px]"
              />
            </View>

            {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

            <View className="flex-row gap-3 mt-1">
              <Pressable
                onPress={handleClose}
                className="flex-1 rounded-2xl py-4 items-center bg-gray-100 active:opacity-80"
              >
                <Text className="text-gray-700 font-semibold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                className="flex-1 rounded-2xl py-4 items-center bg-primary active:opacity-80"
              >
                <Text className="text-white font-semibold">Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
