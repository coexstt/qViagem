import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center mb-4">
          <Text className="text-5xl">🧳</Text>
          <Text className="text-3xl font-bold text-gray-900 mt-4">
            qViagem
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Seu roteiro de viagem inteligente,{"\n"}criado em segundos.
          </Text>
        </View>
      </View>

      <View className="px-8 pb-10">
        <Pressable
          className="bg-primary rounded-2xl py-5 items-center active:opacity-80"
          android_ripple={{ color: "#1D4ED8" }}
        >
          <Text className="text-white text-lg font-semibold">
            Iniciar Nova Viagem
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
