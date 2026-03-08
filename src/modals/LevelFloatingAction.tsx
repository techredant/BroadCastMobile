import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useLevel } from "@/context/LevelContext";

type LevelType =
  | "home"
  | "county"
  | "constituency"
  | "ward"
  | "ai"
  | "live"
  | "audioRoom"
  | "chat";

export function FloatingLevelButton() {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);
  const { userDetails, setCurrentLevel } = useLevel();

  // Animate progress when open changes
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 250 });
  }, [open]);

  const toggle = () => setOpen((prev) => !prev);

  const selectLevel = (type: LevelType) => {
    toggle(); // close menu

    // Special routes
    // Handle special routes first
    if (type === "ai") {
      router.replace("/");
      return; // <--- stop here
    }
    if (type === "live") {
      router.replace("/live");
      return;
    }
    if (type === "audioRoom") {
      router.replace("/audio");
      return;
    }
    if (type === "chat") {
      router.replace("/(stream)");
      return;
    }

    // Update context level
    const mapping: Record<LevelType, { type: string; value: string }> = {
      home: { type: "home", value: "home" },
      county: { type: "county", value: userDetails?.county ?? "county" },
      constituency: {
        type: "constituency",
        value: userDetails?.constituency ?? "constituency",
      },
      ward: { type: "ward", value: userDetails?.ward ?? "ward" },
      ai: { type: "ai", value: "ai" },
      live: { type: "live", value: "live" },
      audioRoom: { type: "audioRoom", value: "audioRoom" },
      chat: { type: "chat", value: "chat" },
    };

    setCurrentLevel(mapping[type]);
  };;

  const actions = [
    {
      key: "home",
      label: "Home",
      icon: <Ionicons name="home-outline" size={18} color="#fff" />,
      offset: 0,
    },
    {
      key: "county",
      label: "County",
      icon: <Feather name="map" size={18} color="#fff" />,
      offset: 60,
    },
    {
      key: "constituency",
      label: "Constituency",
      icon: <FontAwesome5 name="flag" size={16} color="#fff" />,
      offset: 120,
    },
    {
      key: "ward",
      label: "Ward",
      icon: <FontAwesome5 name="map-pin" size={16} color="#fff" />,
      offset: 180,
    },
    {
      key: "ai",
      label: "Chat AI",
      icon: <FontAwesome5 name="robot" size={16} color="#fff" />,
      offset: 240,
    },
    {
      key: "live",
      label: "Go Live",
      icon: <Feather name="video" size={16} color="#fff" />,
      offset: 300,
    },
    {
      key: "audioRoom",
      label: "Join Audio",
      icon: <Ionicons name="mic-circle" size={22} color="#fff" />,
      offset: 360,
    },
    {
      key: "chat",
      label: "Chat members",
      icon: (
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
      ),
      offset: 420,
    },
  ];

  // Precompute animated styles outside map
  const getActionStyle = (offset: number) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateY: -progress.value * offset },
        { scale: progress.value },
      ],
      opacity: progress.value,
    }));

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
    >
      {/* Overlay to close menu */}
      {open && <Pressable style={StyleSheet.absoluteFill} onPress={toggle} />}

      {/* Action buttons */}
      {actions.map((action) => (
        <Animated.View
          key={action.key}
          style={[styles.actionContainer, getActionStyle(action.offset)]}
        >
          <Pressable
            style={styles.action}
            onPress={() => selectLevel(action.key as LevelType)}
          >
            {action.icon}
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        </Animated.View>
      ))}

      {/* FAB button */}
      <Pressable style={styles.fab} onPress={toggle}>
        <Feather name="plus" size={26} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 5,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 20,
  },
  actionContainer: { position: "absolute", bottom: 90, right: 20, zIndex: 15 },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginBottom: 10,
    elevation: 5,
  },
  actionText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 13 },
});
