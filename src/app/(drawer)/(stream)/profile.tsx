import { COLORS } from "@/lib/theme";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { Image } from "expo-image";
import { Alert, Pressable, Text, View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";

const MENU_ITEMS = [
  { icon: "notifications-outline", label: "Notifications", color: COLORS.primary },
  { icon: "bookmark-outline", label: "Saved Posts", color: COLORS.accent },
  { icon: "time-outline", label: "Activity History", color: COLORS.accentSecondary },
  { icon: "people-outline", label: "Following", color: COLORS.primary },
  { icon: "settings-outline", label: "Settings", color: COLORS.textMuted },
];

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const {theme, isDark} = useTheme()

  return (
    <View className="flex-1  py-4" style={{backgroundColor: theme.background}}>
      <StatusBar
                      translucent
                      backgroundColor="transparent"
                      barStyle={isDark ? "light-content" : "dark-content"}
                  />
      {/* PROFILE CARD */}
      <View className="items-center py-5">
        <View className="mb-3.5 relative">
          <Image
            source={user?.imageUrl}
            style={{ width: 88, height: 88, borderRadius: 44 }}
            contentFit="cover"
          />

          <View className="absolute bottom-[2px] right-[2px] h-[18px] w-[18px] rounded-[9px] bg-accent-secondary border-[3px] border-background" />
        </View>

        <Text className="text-2xl font-bold text-foreground">
          {user?.fullName || user?.username || "Citizen"}
        </Text>

        <Text className="mt-0.5 text-base text-foreground-muted">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        {/* Engagement Streak */}
        <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-[#FDCB6E1E] px-3.5 py-1.5">
          <Ionicons name="trending-up-outline" size={16} color="#FDCB6E" />
          <Text className="text-sm font-semibold text-[#FDCB6E]">
            5 day engagement streak
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="mt-2 mb-6 flex-row gap-3 px-5">
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-2xl font-bold text-primary">18</Text>
          <Text className="mt-1 text-xs text-foreground-muted">Events Joined</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-2xl font-bold text-primary">42</Text>
          <Text className="mt-1 text-xs text-foreground-muted">Posts Shared</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-2xl font-bold text-primary">120</Text>
          <Text className="mt-1 text-xs text-foreground-muted">Comments</Text>
        </View>
      </View>

      {/* MENU ITEMS */}
      <ScrollView className="gap-1 px-5">
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={i}
            className="mb-1.5 flex-row items-center gap-3.5 rounded-xl border border-border bg-surface px-4 py-4"
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text className="flex-1 text-base font-medium text-foreground">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSubtle} />
          </Pressable>
        ))}
      </ScrollView>

      {/* SIGN OUT BTN */}
      <Pressable
        className="mt-1 mx-5 flex-row items-center justify-center gap-2 rounded-xl border border-[#FF6B6B33] bg-surface px-4 py-4"
        onPress={async () => {
          try {
            await signOut();
            Sentry.logger.info("User signed out successfully", { userId: user?.id });
          } catch (error) {
            Sentry.logger.error("Error signing out", { error, userId: user?.id });
            Sentry.captureException(error);
            Alert.alert("Error", "An error occurred while signing out. Please try again.");
          }
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text className="text-base font-semibold text-danger">Sign Out</Text>
      </Pressable>
    </View>
  );
};

export default ProfileScreen;