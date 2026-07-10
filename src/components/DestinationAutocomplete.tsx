import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { PlaceSuggestion, searchPlaces } from "../services/geocoding";

const DEBOUNCE_MS = 450;

export default function DestinationAutocomplete({
  value,
  onChangeText,
  onSelect,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (label: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = value.trim();
    if (!isFocused || trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(trimmed);
        if (requestId.current === currentRequest) {
          setSuggestions(results);
        }
      } catch {
        if (requestId.current === currentRequest) setSuggestions([]);
      } finally {
        if (requestId.current === currentRequest) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, isFocused]);

  function handleSelect(label: string) {
    setSuggestions([]);
    setIsFocused(false);
    onSelect(label);
  }

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        placeholder="Ex: Paris, França"
        className="border border-gray-200 rounded-xl px-4 py-3 text-base"
      />

      {isFocused && (isSearching || suggestions.length > 0) && (
        <View className="border border-gray-200 rounded-xl mt-2 overflow-hidden">
          {isSearching ? (
            <View className="flex-row items-center px-4 py-3">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-sm text-gray-500 ml-2">Buscando lugares...</Text>
            </View>
          ) : (
            suggestions.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item.label)}
                className={`px-4 py-3 active:bg-gray-50 ${
                  index > 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <Text className="text-base text-gray-900">{item.label}</Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
