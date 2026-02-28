import { Image, View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "../../../../context/LevelContext";
import { useTheme } from "../../../../context/ThemeContext";

export default function TabsLayout() {
  const { currentLevel, userDetails } = useLevel();
  const { theme } = useTheme();
  const { user } = useUser();

  const profileImage =
    userDetails?.image && userDetails.image.trim() !== ""
      ? userDetails.image
      : user?.imageUrl || "";

  return (
    <NativeTabs>
      {/* HOME */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {currentLevel?.value
            ? currentLevel.value.charAt(0).toUpperCase() +
              currentLevel.value.slice(1)
            : "Home"}
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="globe"
          md="public"
          selectedColor={theme.primary}
        />
      </NativeTabs.Trigger>

      {/* MARKET */}
      <NativeTabs.Trigger name="market/index">
        <NativeTabs.Trigger.Label>Market</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="cart"
          md="shopping_cart"
          selectedColor={theme.primary}
        />
      </NativeTabs.Trigger>

      {/* INPUT (No Floating Button in NativeTabs) */}
      <NativeTabs.Trigger name="input">
        <NativeTabs.Trigger.Label>Post</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="plus.circle.fill"
          md="add_circle"
          selectedColor={theme.primary}
        />
      </NativeTabs.Trigger>

      {/* NEWS */}
      <NativeTabs.Trigger name="news/index">
        <NativeTabs.Trigger.Label>News</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="newspaper"
          md="article"
          selectedColor={theme.primary}
        />
      </NativeTabs.Trigger>

      {/* PROFILE WITH USER IMAGE */}
      <NativeTabs.Trigger name="profile/index">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill"  md="person" selectedColor={"#6C5CE7"} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}