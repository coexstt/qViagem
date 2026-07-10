import { Pressable, Text, View } from "react-native";
import { WikiPlace } from "../services/wikipedia";

export default function PlaceResultsList({
  places,
  onSelect,
}: {
  places: WikiPlace[];
  onSelect: (place: WikiPlace) => void;
}) {
  return (
    <View className="gap-3">
      {places.map((place) => (
        <Pressable
          key={`${place.lang}-${place.pageId}`}
          onPress={() => onSelect(place)}
          className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 active:opacity-80"
        >
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
            <Text className="text-lg">📍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {place.title}
            </Text>
            {place.distanceMeters !== undefined && (
              <Text className="text-sm text-gray-500 mt-0.5">
                a {place.distanceMeters}m de você
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
