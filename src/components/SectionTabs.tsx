import { Pressable, Text, View } from "react-native";

export type TripSection = "agenda" | "mala" | "notas";

const SECTIONS: { value: TripSection; label: string }[] = [
  { value: "agenda", label: "📅 Agenda" },
  { value: "mala", label: "🎒 Minha Mala" },
  { value: "notas", label: "📝 Notas" },
];

export default function SectionTabs({
  active,
  onChange,
}: {
  active: TripSection;
  onChange: (section: TripSection) => void;
}) {
  return (
    <View className="flex-row bg-gray-100 rounded-2xl p-1 mx-6 mt-4 mb-2">
      {SECTIONS.map((section) => {
        const isActive = section.value === active;
        return (
          <Pressable
            key={section.value}
            onPress={() => onChange(section.value)}
            className={`flex-1 items-center py-2.5 rounded-xl ${
              isActive ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {section.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
