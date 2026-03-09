// import React, {
//   useRef,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   TextInput,
//   StatusBar,
//   RefreshControl,
//   FlatList,
// } from "react-native";
// import axios from "axios";
// import io, { Socket } from "socket.io-client";
// import { Status } from "@/app/status/Status";
// import { useFocusEffect } from "expo-router";
// import { useIsFocused, useNavigation } from "@react-navigation/native";
// import { LoaderKitView } from "react-native-loader-kit";
// import SAMPLE_STATUSES from "@/assets/data/SampleStatuses.json";
// import { Post } from "@/types/post";
// import { PostCard } from "@/components/posts/PostCard";
// import { DrawerMenuButton } from "@/components/Button/DrawerMenuButton";
// import { useLevel } from "@/context/LevelContext";
// import { useTheme } from "@/context/ThemeContext";
// import { FloatingLevelButton } from "@/modals/LevelFloatingAction";

// const BASE_URL = "https://backend-api.redanttech.com";

// export default function HomeScreen() {
//   const { currentLevel } = useLevel();
//   const { theme, isDark } = useTheme();
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();

//   const [posts, setPosts] = useState<any[]>([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [visiblePostId, setVisiblePostId] = useState<string | null>(null);

//   const socketRef = useRef<Socket | null>(null);

//   // ---------------- FlatList viewability ----------------
//   const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
//     if (viewableItems.length > 0) {
//       setVisiblePostId(viewableItems[0].item._id);
//     }
//   }).current;
//   const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

//   // ---------------- Fetch posts ----------------
//   const fetchPosts = useCallback(async () => {
//     if (!currentLevel?.type || !currentLevel?.value) {
//       console.log("Level not ready yet");
//       return;
//     }

//     setLoading(true);

//     try {
//       const url = `${BASE_URL}/api/posts?levelType=${currentLevel.type}&levelValue=${currentLevel.value}`;

//       const res = await axios.get<Post[]>(url);
//       setPosts(res.data ?? []);
//     } catch (err) {
//       console.error("❌ Error fetching posts:", err);
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   }, [currentLevel]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchPosts();
//     }, [fetchPosts]),
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchPosts();
//   };

//   // ---------------- Socket setup ----------------
//   useEffect(() => {
//     if (!currentLevel?.type || !currentLevel?.value) return;
//     const socket = io(BASE_URL, { transports: ["websocket"] });
//     socketRef.current = socket;

//     const room = `level-${currentLevel.type}-${currentLevel.value}`;
//     socket.emit("joinRoom", room);

//     socket.on("newPost", (post) => {
//       setPosts((prev) =>
//         prev.some((p) => p._id === post._id) ? prev : [post, ...prev],
//       );
//     });

//     socket.on("deletePost", (deletedPostId) => {
//       setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
//     });

//     return () => {
//       socket.emit("leaveRoom", room);
//       socket.disconnect();
//     };
//   }, [currentLevel]);

//   const rawLevelValue =
//     typeof currentLevel === "object"
//       ? currentLevel?.value
//       : (currentLevel ?? "home");

//   const levelType =
//     typeof currentLevel === "object" ? currentLevel?.type : null;

//   // 🔥 Convert "home" → "national"
//   const displayValue =
//     rawLevelValue?.toLowerCase() === "home"
//       ? "national"
//       : (rawLevelValue ?? "national");

//   const formattedLevel =
//     displayValue.charAt(0).toUpperCase() + displayValue.slice(1);

//   // ---------------- Render ----------------
//   return (
//     // <BottomSheetModalProvider>
//     <View style={{ flex: 1, backgroundColor: theme.background }}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle={isDark ? "light-content" : "dark-content"}
//       />
//       <DrawerMenuButton />
//       {/* Posts List */}
//       <FlatList
//         data={posts}
//         onViewableItemsChanged={onViewableItemsChanged}
//         viewabilityConfig={viewabilityConfig}
//         keyExtractor={(item) => item._id.toString()}
//         scrollEventThrottle={16}
//         renderItem={({ item }) => (
//           <PostCard
//             post={item}
//             isVisible={visiblePostId === item._id && isFocused}
//             socket={socketRef.current}
//             allPosts={posts}
//             onDeletePost={(postId: any) =>
//               setPosts((prev) => prev.filter((p) => p._id !== postId))
//             }
//           />
//         )}
//         ListHeaderComponent={
//           <>
//             <View
//               className="px-4 py-2 justify-center items-center mt-8"
//               style={{ backgroundColor: theme.background }}
//             >
//               <Text
//                 className="font-bold text-2xl"
//                 style={{ color: theme.text, fontSize: 18, marginTop: 14 }}
//               >
//                 {formattedLevel}
//                 {levelType && levelType !== "home" ? ` ${levelType}` : ""}
//               </Text>
//             </View>
//             <Status statuses={SAMPLE_STATUSES} />
//           </>
//         }
//         contentContainerStyle={{ paddingBottom: 120 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={theme.background}
//             colors={[theme.text]}
//           />
//         }
//         ListEmptyComponent={
//           <View
//             style={{
//               alignItems: "center",
//               // marginTop: 60,
//             }}
//           >
//             {loading ? (
//               <>
//                 <LoaderKitView
//                   style={{ width: 50, height: 50 }}
//                   name="BallScaleRippleMultiple"
//                   animationSpeedMultiplier={1.0}
//                   color={theme.text}
//                 />
//                 <Text style={{ marginTop: 16, color: theme.text }}>
//                   Loading {currentLevel.value} posts...
//                 </Text>
//               </>
//             ) : (
//               <Text style={{ color: theme.subtext }}>
//                 No posts for {currentLevel.value} yet
//               </Text>
//             )}
//           </View>
//         }
//       />

//       <FloatingLevelButton />
//     </View>
//   );
// }

import React, { useRef, useState, useEffect, useCallback } from "react";

import { View, Text, StatusBar, RefreshControl, FlatList } from "react-native";

import axios from "axios";
import io, { Socket } from "socket.io-client";

import { useFocusEffect } from "expo-router";
import { useIsFocused, useNavigation } from "@react-navigation/native";

import { LoaderKitView } from "react-native-loader-kit";

import SAMPLE_STATUSES from "@/assets/data/SampleStatuses.json";

import { Post } from "@/types/post";

import { PostCard } from "@/components/posts/PostCard";
import { DrawerMenuButton } from "@/components/Button/DrawerMenuButton";

import { useLevel } from "@/context/LevelContext";
import { useTheme } from "@/context/ThemeContext";

import { FloatingLevelButton } from "@/modals/LevelFloatingAction";

import { Status } from "@/app/status/Status";

const BASE_URL = "https://backend-api.redanttech.com";

export default function HomeScreen() {
  const { currentLevel } = useLevel();
  const { theme, isDark } = useTheme();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const socketRef = useRef<Socket | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);

  // ---------------- Viewability ----------------

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setVisiblePostId(viewableItems[0].item._id);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  // ---------------- Fetch Posts ----------------

  const fetchPosts = useCallback(async () => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    setLoading(true);

    try {
      const url = `${BASE_URL}/api/posts?levelType=${currentLevel.type}&levelValue=${currentLevel.value}`;

      const res = await axios.get<Post[]>(url);

      setPosts((prev) => {
        const map = new Map(prev.map((p) => [p._id, p]));

        res.data?.forEach((post) => {
          map.set(post._id, post);
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [currentLevel?.type, currentLevel?.value]);

  // ---------------- First Load Fix ----------------

  useEffect(() => {
    if (currentLevel?.type && currentLevel?.value) {
      fetchPosts();
    }
  }, [currentLevel]);

  // ---------------- Refetch on Focus ----------------

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts]),
  );

  // ---------------- Pull To Refresh ----------------

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // ---------------- Socket Setup ----------------

  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    const socket = io(BASE_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const room = `level-${currentLevel.type}-${currentLevel.value}`;

    socket.emit("joinRoom", room);

    socket.on("newPost", (post: Post) => {
      setPosts((prev) => {
        if (prev.find((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    });

    socket.on("deletePost", (deletedPostId: string) => {
      setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    });

    return () => {
      socket.emit("leaveRoom", room);
      socket.disconnect();
    };
  }, [currentLevel]);

  // ---------------- Level Display ----------------

  const rawLevelValue =
    typeof currentLevel === "object"
      ? currentLevel?.value
      : (currentLevel ?? "home");

  const levelType =
    typeof currentLevel === "object" ? currentLevel?.type : null;

  const displayValue =
    rawLevelValue?.toLowerCase() === "home"
      ? "national"
      : (rawLevelValue ?? "national");

  const formattedLevel =
    displayValue.charAt(0).toUpperCase() + displayValue.slice(1);

  // ---------------- Render Post ----------------

  const renderPost = useCallback(
    ({ item }: { item: Post }) => {
      return (
        <PostCard
          post={item}
          isVisible={visiblePostId === item._id && isFocused}
          socket={socketRef.current}
          allPosts={posts}
          onDeletePost={(postId: string) =>
            setPosts((prev) => prev.filter((p) => p._id !== postId))
          }
        />
      );
    },
    [visiblePostId, isFocused, posts],
  );

  // ---------------- Render ----------------

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <DrawerMenuButton />

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderPost}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            <View
              className="px-4 py-2 justify-center items-center mt-8"
              style={{ backgroundColor: theme.background }}
            >
              <Text
                className="font-bold text-2xl"
                style={{ color: theme.text, fontSize: 18, marginTop: 14 }}
              >
                {formattedLevel}
                {levelType && levelType !== "home" ? ` ${levelType}` : ""}
              </Text>
            </View>

            <Status statuses={SAMPLE_STATUSES} />
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.background}
            colors={[theme.text]}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              marginTop: 60,
            }}
          >
            {loading ? (
              <>
                <LoaderKitView
                  style={{ width: 50, height: 50 }}
                  name="BallScaleRippleMultiple"
                  animationSpeedMultiplier={1.0}
                  color={theme.text}
                />

                <Text style={{ marginTop: 16, color: theme.text }}>
                  Loading {currentLevel?.value} posts...
                </Text>
              </>
            ) : (
              <Text style={{ color: theme.subtext }}>
                No posts for {currentLevel?.value} yet
              </Text>
            )}
          </View>
        }
      />

      <FloatingLevelButton />
    </View>
  );
}