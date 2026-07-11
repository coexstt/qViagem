import { Pressable, Text, View } from "react-native";
import { ItineraryItem, Period } from "../db/database";
import ItineraryItemRow from "./ItineraryItemRow";

const PERIOD_SECTIONS: { value: Period; label: string; icon: string }[] = [
  { value: "manha", label: "Manhã", icon: "🌅" },
  { value: "tarde", label: "Tarde", icon: "☀️" },
  { value: "noite", label: "Noite", icon: "🌙" },
];

export default function DayBlock({
  dayIndex,
  dateLabel,
  items,
  swappingItemId,
  onMove,
  onSwap,
  onAddActivity,
  onDelete,
  onViewMap,
}: {
  dayIndex: number;
  dateLabel: string;
  items: ItineraryItem[];
  swappingItemId: number | null;
  onMove: (item: ItineraryItem, direction: "up" | "down") => void;
  onSwap: (item: ItineraryItem) => void;
  onAddActivity: (dayIndex: number) => void;
  onDelete: (item: ItineraryItem) => void;
  onViewMap: (item: ItineraryItem) => void;
}) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-gray-900">{dateLabel}</Text>
        <Pressable
          onPress={() => onAddActivity(dayIndex)}
          hitSlop={8}
          className="w-8 h-8 rounded-full bg-primary items-center justify-center active:opacity-80"
        >
          <Text className="text-white text-lg leading-none">+</Text>
        </Pressable>
      </View>

      {PERIOD_SECTIONS.map((section) => {
        const periodItems = items.filter((item) => item.period === section.value);
        if (periodItems.length === 0) return null;

        return (
          <View key={section.value} className="mb-3">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {section.icon} {section.label}
            </Text>
            {periodItems.map((item, index) => (
              <ItineraryItemRow
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === periodItems.length - 1}
                isSwapping={swappingItemId === item.id}
                onMoveUp={() => onMove(item, "up")}
                onMoveDown={() => onMove(item, "down")}
                onSwap={() => onSwap(item)}
                onDelete={() => onDelete(item)}
                onViewMap={() => onViewMap(item)}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}
