import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal", // key for modal
        animation: "slide_from_bottom", // slide up
      }}
    >
      <Stack.Screen name="comments" />
    </Stack>
  );
}
