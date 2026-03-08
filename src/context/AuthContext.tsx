import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    // 🔓 Not signed in
    if (!isSignedIn) {
      if (!inAuthGroup) {
        router.replace("/(auth)");
      }
      setLoading(false);
      return;
    }

    const hasCompletedName = !!user?.unsafeMetadata?.hasCompletedName;
    const onboardingComplete = !!user?.unsafeMetadata?.onboardingComplete;

    // 👤 Missing name
    if (!hasCompletedName) {
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/nameScreen");
      }
      setLoading(false);
      return;
    }

    // 📍 Missing location
    if (!onboardingComplete) {
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/location");
      }
      setLoading(false);
      return;
    }

    // ✅ Fully authenticated + onboarded
    if (inAuthGroup || inOnboardingGroup) {
      router.replace("/(drawer)/(tabs)");
    }

    setLoading(false);
  }, [isLoaded, isSignedIn, user, segments]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!isSignedIn,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);