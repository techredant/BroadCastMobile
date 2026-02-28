import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Pressable, Dimensions } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { MediaViewerModal } from "@/components/posts/MediaViewModal";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { useLevel } from "../../../../../context/LevelContext";
import { useUserContext } from "../../../../../context/FollowContext";
import { useTheme } from "../../../../../context/ThemeContext";
import Video from "react-native-video";

const BASE_URL = "https://cast-api-zeta.vercel.app";

const SCREEN_WIDTH = Dimensions.get("window").width;
const POST_MARGIN = 2; // optional spacing between items
const NUM_COLUMNS = 3;
const POST_SIZE = (SCREEN_WIDTH - POST_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function ProfileScreen() {
  const { members, currentUserId, toggleFollow } = useUserContext();
  const { userDetails, isLoadingUser, currentLevel } = useLevel();
    const [posts, setPosts] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
      const [modalVisible, setModalVisible] = useState(false);
      const [selectedIndex, setSelectedIndex] = useState(0);

 const openMedia = (index: number) => {
  setSelectedIndex(index);
  setModalVisible(true);
};

  // -------------------- Prepare followers/following --------------------
  const followersData = members.filter((m) => m.followers.includes(userDetails?.clerkId));
  const followingData = members.filter((m) => m.isFollowing);

  // -------------------- Flatten media posts --------------------
  const mediaPosts = posts
    .filter((p) => p.media && p.media.length > 0)
    .flatMap((p) => p.media);

  const getData = () => {
    if (activeTab === "posts") return mediaPosts;
    if (activeTab === "followers") return followersData;
    if (activeTab === "following") return followingData;
    return [];
  };

  const [activeTab, setActiveTab] = useState<
    "posts" | "followers" | "following"
  >("posts");

const fetchPosts = useCallback(async () => {
  if (!userDetails?.clerkId) return;

  try {
    const url = `${BASE_URL}/api/posts/${userDetails?.clerkId}?levelType=${currentLevel.type}&levelValue=${currentLevel.value}`;

    const res = await axios.get(url);
    setPosts(res.data ?? []);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
  } finally {
    setRefreshing(false);
  }
}, [currentLevel, userDetails?.clerkId]);

useEffect(() => {
  fetchPosts();
}, [fetchPosts]);


  // /* ---------------- PINCH ZOOM ---------------- */
  const pinchScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      pinchScale.value = e.scale;
    })
    .onEnd(() => {
      pinchScale.value = withSpring(1);
    });

  const pinchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pinchScale.value }],
  }));


// Pull-to-refresh
const onRefresh = () => {
  setRefreshing(true);
  fetchPosts();
};
const {theme} = useTheme()


  if (isLoadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profile...</Text>
      </View>
    );
  }


const renderItem = ({ item, index }: any) => {
  if (activeTab === "posts") {
    const isVideo = item.endsWith(".mp4") || item.endsWith(".mov");

    return (
      <Pressable onPress={() => openMedia(index)}>
        {isVideo ? (
          <Video
            source={{ uri: item }}
            style={styles.postImage}
            resizeMode="cover"
            repeat
            paused={false}
            muted
          />
        ) : (
          <Image source={{ uri: item }} style={styles.postImage} />
        )}
      </Pressable>
    );
  }

   return (
      <View
        style={[styles.userRow, { width: "100%", justifyContent: "space-between", backgroundColor: theme.background }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: item?.image }} style={styles.userAvatar} />
          {item.firstName ?
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>:(
          <Text style={styles.userName}>{item.companyName}</Text>
           )}
        </View>

        <TouchableOpacity
          onPress={() => toggleFollow(item)}
          style={[
            styles.followButton,
            {
              backgroundColor: item.isFollowing ? "#fff" : "#1DA1F2",
              borderWidth: item.isFollowing ? 1 : 0,
              borderColor: "#1DA1F2",
            },
          ]}
        >
          <Text
            style={{
              color: item.isFollowing ? "#1DA1F2" : "#fff",
              fontWeight: "bold",
            }}
          >
            {item.isFollowing ? "Unfollow" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
};



  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              userDetails?.image?.trim() !== ""
                ? userDetails?.image
                : "https://i.pravatar.cc/150?img=32",
          }}
          style={styles.avatar}
        />

        <View style={styles.bio}>
          <Text style={[styles.name, {color: theme.text}]}>{userDetails?.firstName}</Text>
          <Text style={styles.username}>@{userDetails?.nickName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setActiveTab("posts")}
          >
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text
              style={[
                styles.statLabel,
                activeTab === "posts" && styles.activeLabel,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setActiveTab("followers")}
          >
            <Text style={styles.statNumber}>{followersData.length}</Text>
            <Text
              style={[
                styles.statLabel,
                activeTab === "followers" && styles.activeLabel,
              ]}
            >
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setActiveTab("following")}
          >
            <Text style={styles.statNumber}>{followingData.length}</Text>
            <Text
              style={[
                styles.statLabel,
                activeTab === "following" && styles.activeLabel,
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
    <FlatList
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 140, flexDirection: "row" }}
  data={getData()}
  key={activeTab}
  keyExtractor={(item, index) => index.toString()}
  numColumns={activeTab === "posts" ? 3 : 1} // 3 columns
  renderItem={renderItem}
  showsVerticalScrollIndicator={false}
/>

  {/* MEDIA MODAL */}
      <MediaViewerModal
  modalVisible={modalVisible}
  setModalVisible={setModalVisible}
  mediaList={mediaPosts}          // pass all media
  selectedIndex={selectedIndex}
  post={posts.find(p => p.media && p.media.includes(mediaPosts[selectedIndex]))} 
  pinchGesture={pinchGesture}
        pinchStyle={pinchStyle}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    flexDirection: "column",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  stats: {
    // flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  bio: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  username: {
    color: "#666",
  },
  bioText: {
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
   followButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#1DA1F2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryText: {
    fontWeight: "bold",
  },
  postImage: {
    width: POST_SIZE,
    height: POST_SIZE,
    margin: POST_MARGIN,
},

  userRow: {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  borderBottomWidth: 1,
  borderColor: "#eee",
},
userAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 12,
},
userName: {
  fontSize: 16,
  fontWeight: "500",
},
activeLabel: {
  color: "#1DA1F2",
  fontWeight: "bold",
},

});

