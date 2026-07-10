import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

export type RainSuggestion = { title: string; description: string };

export default function RainAlternativesModal({
  visible,
  isLoading,
  errorMessage,
  suggestions,
  addedTitles,
  onAdd,
  onClose,
}: {
  visible: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  suggestions: RainSuggestion[];
  addedTitles: string[];
  onAdd: (suggestion: RainSuggestion) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8 gap-4">
          <Text className="text-lg font-semibold text-gray-900">
            🌧️ Mudança de planos
          </Text>
          <Text className="text-sm text-gray-500">
            Sugestões de atividades cobertas para as próximas horas.
          </Text>

          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-sm text-gray-500 mt-3">
                Pensando em alternativas...
              </Text>
            </View>
          ) : errorMessage ? (
            <View className="items-center py-6">
              <Text className="text-sm text-gray-600 text-center">
                {errorMessage}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {suggestions.map((suggestion, index) => {
                const added = addedTitles.includes(suggestion.title);
                return (
                  <View
                    key={index}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
                  >
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {suggestion.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-3">
                      {suggestion.description}
                    </Text>
                    <Pressable
                      onPress={() => onAdd(suggestion)}
                      disabled={added}
                      className={`self-start rounded-xl px-4 py-2 ${
                        added ? "bg-gray-200" : "bg-primary active:opacity-80"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          added ? "text-gray-500" : "text-white"
                        }`}
                      >
                        {added ? "✓ Adicionado" : "+ Adicionar ao roteiro"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          <Pressable onPress={onClose} className="items-center py-2">
            <Text className="text-gray-500 font-medium">Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
