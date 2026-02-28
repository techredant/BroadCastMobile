import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Redirect, Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";

import ChatWrapper from "@/components/ChatWrapper";
import VideoProvider from "@/components/VideoProvider";
import { AppProvider } from "@/contexts/AppProvider";
import * as Sentry from "@sentry/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LevelProvider } from "../../context/LevelContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { UserOnboardingProvider } from "../../context/UserOnBoardingContext";
import { UserProvider } from "../../context/FollowContext";
import { ActivityIndicator, View } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { useEffect } from "react";

Sentry.init({
  dsn: "https://4cbf0be15075fc50561c2e10fa33fc85@o4509813037137920.ingest.de.sentry.io/4510905593823312",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllImages: false,
      maskAllVectors: false,
      maskAllText: false,
    }),
  ],
});

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <RootInnerLayout />
    </ClerkProvider>
  );
}

function RootInnerLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments(); // current route segments

  // 🔑 Redirect logic (AuthGate)
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inDrawerGroup = segments[0] === "(drawer)";

    const hasCompletedName = user?.unsafeMetadata?.hasCompletedName;
    const onboardingComplete = user?.unsafeMetadata?.onboardingComplete;

    // 1️⃣ Not signed in
    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)");
      return;
    }

    // 2️⃣ Signed in but name not completed
    if (isSignedIn && !hasCompletedName && !inOnboardingGroup) {
      router.replace("/(onboarding)/nameScreen");
      return;
    }

    // 3️⃣ Name done but location not completed
    if (isSignedIn && hasCompletedName && !onboardingComplete && !inOnboardingGroup) {
      router.replace("/(onboarding)/location");
      return;
    }

    // 4️⃣ Fully onboarded
    if (isSignedIn && hasCompletedName && onboardingComplete && !inDrawerGroup) {
      router.replace("/(drawer)/(tabs)");
    }
  }, [isLoaded, isSignedIn, user, segments]);

  // 🔄 Loading fallback while Clerk initializes
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔑 Main App Layout (wrap all providers)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LevelProvider>
          <UserOnboardingProvider>
            <UserProvider currentUserId={user?.id || ""}>
              <MenuProvider>
                <ChatWrapper>
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