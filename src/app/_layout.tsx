// RootLayout.tsx
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import ChatWrapper from "@/components/ChatWrapper";
import VideoProvider from "@/components/VideoProvider";
import { AppProvider } from "@/contexts/AppProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LevelProvider } from "../../context/LevelContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { UserOnboardingProvider } from "../../context/UserOnBoardingContext";
import { UserProvider } from "../../context/FollowContext";
import { ActivityIndicator, View } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { useEffect } from "react";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <RootInnerLayout />
    </ClerkProvider>
  );
}

function RootInnerLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();

  // 🔑 Redirect / Auth Gate Logic
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inDrawerGroup = segments[0] === "(drawer)";

    const hasCompletedName = user?.unsafeMetadata?.hasCompletedName;
    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete;

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)");
      return;
    }

    if (isSignedIn && !hasCompletedName && !inOnboardingGroup) {
      router.replace("/(onboarding)/nameScreen");
      return;
    }

    if (
      isSignedIn &&
      hasCompletedName &&
      !onboardingComplete &&
      !inOnboardingGroup
    ) {
      router.replace("/(onboarding)/location");
      return;
    }

    if (
      isSignedIn &&
      hasCompletedName &&
      onboardingComplete &&
      !inDrawerGroup
    ) {
      router.replace("/(drawer)/(tabs)");
    }
  }, [isLoaded, isSignedIn, user, segments]);

  // Clerk loading
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  // If not signed in → just render auth stack
  if (!isSignedIn) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  // ✅ Fully signed-in: wrap all providers
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LevelProvider>
          <UserOnboardingProvider>
            <UserProvider currentUserId={user!.id}>
              <MenuProvider>
                <ChatWrapper user={user!}>
                  <VideoProvider>
                    <AppProvider>
                      <Stack screenOptions={{ headerShown: false }} />
                    </AppProvider>
                  </VideoProvider>
                </ChatWrapper>
              </MenuProvider>
            </UserProvider>
          </UserOnboardingProvider>
        </LevelProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
