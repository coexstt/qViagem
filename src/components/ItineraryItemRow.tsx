import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ItineraryItem } from "../db/database";

export default function ItineraryItemRow({
  item,
  isFirst,
  isLast,
  isSwapping,
  onMoveUp,
  onMoveDown,
  onSwap,
  onDelete,
  onViewMap,
}: {
  item: ItineraryItem;
  isFirst: boolean;
  isLast: boolean;
  isSwapping: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSwap: () => void;
  onDelete: () => void;
  onViewMap: () => void;
}) {
  return (
    <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-3">
      <View className="flex-row">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {item.title}
            </Text>
            {item.source === "user" && (
              <View className="bg-amber-100 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-[11px] font-semibold text-amber-700">
                  Você
                </Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text className="text-sm text-gray-500 leading-5">
              {item.description}
            </Text>
          ) : null}

          {item.source === "ai" && (
            <Pressable
              onPress={onSwap}
              disabled={isSwapping}
              className="flex-row items-center mt-2 self-start"
            >
              {isSwapping ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text className="text-primary text-sm font-semibold">
                  🔄 Trocar sugestão
                </Text>
              )}
            </Pressable>
          )}
        </View>

        <View className="items-center justify-center gap-1">
          <Pressable
            onPress={onMoveUp}
            disabled={isFirst}
            hitSlop={6}
            className={`w-8 h-8 rounded-lg items-center justify-center ${
              isFirst ? "opacity-20" : "bg-gray-200"
            }`}
          >
            <Text className="text-gray-700 text-base">↑</Text>
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={isLast}
            hitSlop={6}
            className={`w-8 h-8 rounded-lg items-center justify-center ${
              isLast ? "opacity-20" : "bg-gray-200"
            }`}
          >
            <Text className="text-gray-700 text-base">↓</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <Pressable onPress={onViewMap} hitSlop={6} className="flex-row items-center">
          <Ionicons name="map-outline" size={16} color="#2563EB" />
          <Text className="text-primary text-sm font-semibold ml-1">
            Ver no Mapa
          </Text>
        </Pressable>

        <Pressable onPress={onDelete} hitSlop={6} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
}
