import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PackingItem,
  TravelStyle,
  deletePackingItem,
  getPackingItems,
  insertPackingItems,
  togglePackingItem,
} from "../db/database";
import { suggestPackingItems } from "../utils/packing";

export default function PackingChecklist({
  tripId,
  destination,
  style,
}: {
  tripId: number;
  destination: string;
  style: TravelStyle | null;
}) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItemText, setNewItemText] = useState("");

  function refresh() {
    setItems(getPackingItems(tripId));
  }

  useEffect(() => {
    const existing = getPackingItems(tripId);
    if (existing.length === 0) {
      insertPackingItems(tripId, suggestPackingItems(destination, style));
      setItems(getPackingItems(tripId));
    } else {
      setItems(existing);
    }
  }, [tripId]);

  function handleToggle(item: PackingItem) {
    togglePackingItem(item.id, !item.checked);
    refresh();
  }

  function handleDelete(item: PackingItem) {
    deletePackingItem(item.id);
    refresh();
  }

  function handleAdd() {
    const label = newItemText.trim();
    if (!label) return;
    insertPackingItems(tripId, [label]);
    setNewItemText("");
    refresh();
  }

  const checkedCount = items.filter((item) => item.checked).length;

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-gray-900">
          O que levar
        </Text>
        <Text className="text-sm text-gray-500">
          {checkedCount}/{items.length} prontos
        </Text>
      </View>

      <View className="gap-2 mb-4">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleToggle(item)}
            className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
          >
            <Ionicons
              name={item.checked ? "checkbox" : "square-outline"}
              size={20}
              color={item.checked ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              className={`flex-1 ml-3 text-base ${
                item.checked ? "text-gray-400 line-through" : "text-gray-900"
              }`}
            >
              {item.label}
            </Text>
            <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="close" size={18} color="#D1D5DB" />
            </Pressable>
          </Pressable>
        ))}

        {items.length === 0 && (
          <Text className="text-sm text-gray-400 text-center py-6">
            Sua mala está vazia. Adicione itens abaixo.
          </Text>
        )}
      </View>

      <View className="flex-row gap-2">
        <TextInput
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAdd}
          placeholder="Adicionar item..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base"
        />
        <Pressable
          onPress={handleAdd}
          className="bg-primary rounded-xl px-5 items-center justify-center active:opacity-80"
        >
          <Text className="text-white font-semibold text-lg">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
