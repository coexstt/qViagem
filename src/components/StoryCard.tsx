import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

export default function StoryCard({
  title,
  thumbnailUrl,
  distanceMeters,
  text,
  isAiGenerated,
  isTransforming,
  onTransform,
  onReset,
}: {
  title: string;
  thumbnailUrl?: string;
  distanceMeters?: number;
  text: string;
  isAiGenerated: boolean;
  isTransforming: boolean;
  onTransform: () => void;
  onReset: () => void;
}) {
  return (
    <View className="rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden mb-6">
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-blue-50 items-center justify-center">
          <Text className="text-5xl">🏛️</Text>
        </View>
      )}

      <View className="p-5">
        <Text className="text-lg font-bold text-gray-900 mb-2">{title}</Text>

        <View className="flex-row flex-wrap gap-2 mb-3">
          {distanceMeters !== undefined && (
            <View className="bg-primary/10 rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-primary">
                📍 a {distanceMeters}m de você
              </Text>
            </View>
          )}
          <View
            className={`rounded-full px-3 py-1 ${
              isAiGenerated ? "bg-purple-100" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isAiGenerated ? "text-purple-700" : "text-gray-600"
              }`}
            >
              {isAiGenerated ? "✨ Narrativa por IA" : "📖 Texto da Wikipedia"}
            </Text>
          </View>
        </View>

        <Text className="text-[15px] text-gray-700 leading-6">{text}</Text>

        <View className="flex-row flex-wrap gap-3 mt-5">
          {!isAiGenerated && (
            <Pressable
              onPress={onTransform}
              disabled={isTransforming}
              className="bg-primary rounded-xl px-4 py-2.5 active:opacity-80 flex-row items-center"
            >
              {isTransforming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">
                  Transformar com IA ✨
                </Text>
              )}
            </Pressable>
          )}

          <Pressable
            onPress={onReset}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 active:opacity-80"
          >
            <Text className="text-gray-700 font-semibold text-sm">
              🔍 Nova busca
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
