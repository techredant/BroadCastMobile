import React, { JSX, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  AnimatedStyle
} from "react-native-reanimated";
import { useLevel } from "../../context/LevelContext";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

type LevelType = "home" | "county" | "constituency" | "ward" | "ai" | "live" | "audioRoom";

type Action = {
  key: LevelType;
  label: string;
  icon: JSX.Element;
  offset: number;
};


type Props = {
  containerAnimatedStyle?: AnimatedStyle<any>;
};

export function FloatingLevelButton({ containerAnimatedStyle }: Props) {
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);
  const { userDetails, setCurrentLevel } = useLevel();

  const lastScrollY = useSharedValue(0);
const fabTranslateY = useSharedValue(0);



  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      progress.value = withTiming(next ? 1 : 0, { duration: 250 });
      return next;
    });
  };

  const selectLevel = (type: LevelType) => {
    toggle();

    if (type === "ai") {
      // router.push("/ai/ai-index");
      return;
    }

    if (type === "live") {
      router.push("/live");
      return;
    }

      if (type === "audioRoom") {
      router.push("/audio");
      return;
    }

    // Normal levels
    if (type === "home") {
      setCurrentLevel({ type: "home", value: "home" });
    }

    if (type === "county") {
      setCurrentLevel({
        type: "county",
        value: userDetails?.county ?? "county",
      });
    }

    if (type === "constituency") {
      setCurrentLevel({
        type: "constituency",
        value: userDetails?.constituency ?? "constituency",
      });
    }

    if (type === "ward") {
      setCurrentLevel({
        type: "ward",
        value: userDetails?.ward ?? "ward",
      });
    }
  };

  const actions: Action[] = [
    {
      key: "home",
      label: "Home",
      icon: <Ionicons name="home-outline" size={18} color="#fff" />,
      offset: 60,
    },
    {
      key: "county",
      label: "County",
      icon: <Feather name="map" size={18} color="#fff" />,
      offset: 120,
    },
    {
      key: "constituency",
      label: "Constituency",
      icon: <FontAwesome5 name="flag" size={16} color="#fff" />,
      offset: 180,
    },
    {
      key: "ward",
      label: "Ward",
      icon: <FontAwesome5 name="map-pin" size={16} color="#fff" />,
      offset: 240,
    },
    {
      key: "ai",
      label: "Chat AI",
      icon: <FontAwesome5 name="robot" size={16} color="#fff" />,
      offset: 300,
    },
    {
      key: "live",
      label: "Go Live",
      icon: <Feather name="video" size={16} color="#fff" />,
      offset: 360,
    },
   {
  key: "audioRoom",
  label: "Join Audio",
  icon: <Ionicons name="mic-circle" size={22} color="#fff" />,
  offset: 420,
},
  ];

  return (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    pointerEvents="box-none"
    style={[StyleSheet.absoluteFill, containerAnimatedStyle]}
  >
    {open && (
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={toggle} />
      </Animated.View>
    )}

    {actions.map(action => {
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [
          { translateY: -progress.value * action.offset },
          { scale: progress.value },
        ],
        opacity: progress.value,
      }));

      return (
        <Animated.View
          key={action.key}
          style={[styles.actionContainer, animatedStyle]}
        >
          <Pressable
            style={styles.action}
            onPress={() => selectLevel(action.key)}
          >
            {action.icon}
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        </Animated.View>
      );
    })}

    <Pressable style={styles.fab} onPress={toggle}>
      <Animated.View
        style={{ transform: [{ rotate: open ? "45deg" : "0deg" }] }}
      >
        <Feather name="plus" size={26} color="#fff" />
      </Animated.View>
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
    overlay: {
        position: "absolute",
        width,
        height,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 10,
    },
    actionContainer: {
        position: "absolute",
        bottom: 90,
        right: 20,
        zIndex: 15,
    },
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
    actionText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "600",
        fontSize: 13,
    },
});