import { Image, Pressable, Text, View } from "react-native";

export default function StoryCard({
  title,
  thumbnailUrl,
  narrative,
  distanceMeters,
  onReset,
}: {
  title: string;
  thumbnailUrl?: string;
  narrative: string;
  distanceMeters?: number;
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
        <View className="flex-row items-center flex-wrap mb-2">
          <Text className="text-lg font-bold text-gray-900 flex-1">{title}</Text>
        </View>

        {distanceMeters !== undefined && (
          <View className="bg-primary/10 self-start rounded-full px-3 py-1 mb-3">
            <Text className="text-xs font-semibold text-primary">
              📍 a {distanceMeters}m de você
            </Text>
          </View>
        )}

        <Text className="text-[15px] text-gray-700 leading-6">{narrative}</Text>

        <Pressable
          onPress={onReset}
          className="mt-5 self-start bg-white border border-gray-200 rounded-xl px-4 py-2.5 active:opacity-80"
        >
          <Text className="text-gray-700 font-semibold text-sm">
            🔍 Nova busca
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
