import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StatusBar,
  RefreshControl,
  FlatList,
} from "react-native";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { PostCard } from "@/components/posts/PostCard";
import { Status } from "@/app/status/Status";
import { useFocusEffect } from "expo-router";
import { DrawerActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LoaderKitView } from "react-native-loader-kit";
import SAMPLE_STATUSES from "@/assets/data/SampleStatuses.json";
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerMenuButton } from "@/components/Button/DrawerMenuButton";
import { LevelHeader } from "@/components/level/NewsHeader";
import { useLevel } from "../../../../../context/LevelContext";
import { useTheme } from "../../../../../context/ThemeContext";
import { FloatingLevelButton } from "@/modals/LevelFloatingAction";


const BASE_URL = "https://cast-api-zeta.vercel.app";

interface Post {
  _id: string;
  text: string;
  images?: string[];
  createdAt: string;
  likes: number;
  commentsCount: number;
  views: number;
  accountType: string;
  author: {
    name: string;
    avatar: string;
  };
}

export default function NewsScreen() {
  const { currentLevel, userDetails, isLoadingUser } = useLevel();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
 const [news, setNews] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // ---------------- FlatList viewability ----------------
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisiblePostId(viewableItems[0].item._id);
    }
  }).current;
  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  // ---------------- Fetch posts ----------------
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/posts`, {
        params: {
          levelType: currentLevel.type,
          levelValue: currentLevel.value,
        },
      });

      // Only non-personal accounts = news/org accounts
      const filteredNews = res.data.filter(
        (item: Post) => item.accountType !== "Personal Account"
      );

      setNews(filteredNews);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, [currentLevel]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);


  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  // ---------------- Socket setup ----------------
  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;
    const socket = io(BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    const room = `level-${currentLevel.type}-${currentLevel.value}`;
    socket.emit("joinRoom", room);

    socket.on("newPost", (post) => {
      setNews((prev) => (prev.some((p) => p._id === post._id) ? prev : [post, ...prev]));
    });

    socket.on("deletePost", (deletedPostId) => {
      setNews((prev) => prev.filter((p) => p._id !== deletedPostId));
    });

    return () => {
      socket.emit("leaveRoom", room);
      socket.disconnect();
    };
  }, [currentLevel]);

  if (loading) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
      }}
    >
      <LoaderKitView
        style={{ width: 60, height: 60 }}
        name="BallScaleRippleMultiple"
        animationSpeedMultiplier={1.0}
        color={theme.text}
      />
      <Text style={{ marginTop: 16, color: theme.text }}>
        Loading {currentLevel?.value} posts...
      </Text>
    </View>
  );
}

  // ---------------- Render ----------------
  return (
    // <BottomSheetModalProvider>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />
    

        {/* Drawer Button */}
      {/* <DrawerMenuButton /> */}
        {/* Posts List */}
        <FlatList
          data={news}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item._id.toString()}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isVisible={visiblePostId === item._id && isFocused}
              socket={socketRef.current}
              allPosts={news}
              onDeletePost={(postId: any) => setNews((prev) => prev.filter((p) => p._id !== postId))}
            />
          )}
          ListHeaderComponent={
          
              <LevelHeader />
           
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.background} colors={[theme.text]} />}
          ListEmptyComponent={
  <View
    style={{
      alignItems: "center",
      // marginTop: 60,
    }}
  >
    {loading || isLoadingUser ? (
      <>
        <LoaderKitView
          style={{ width: 50, height: 50 }}
          name="BallScaleRippleMultiple"
          animationSpeedMultiplier={1.0}
          color={theme.text}
        />
        <Text style={{ marginTop: 16, color: theme.text }}>
          Loading {currentLevel.value} news...
        </Text>
      </>
    ) : (
      <Text style={{ color: theme.subtext }}>
        No news for this level yet
      </Text>
    )}
  </View>
}

        />
      
        {/* Floating Action Button */}
        <FloatingLevelButton />
      </View>
    // </BottomSheetModalProvider>
  );
}

