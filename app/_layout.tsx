import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "../src/db/database";

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="new-trip"
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Nova Viagem",
            }}
          />
          <Stack.Screen
            name="trip/[id]"
            options={{ headerShown: true, title: "" }}
          />
          <Stack.Screen
            name="api-key"
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Chave da API",
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
