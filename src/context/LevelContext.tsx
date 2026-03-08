// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import axios from "axios";
// import { useAuth, useUser } from "@clerk/clerk-expo";

// interface LevelContextType {
//   currentLevel: { type: string; value: string };
//   setCurrentLevel: (level: { type: string; value: string }) => void;

//   county?: string;
//   setCounty: (county?: string) => void;

//   constituency?: string;
//   setConstituency: (constituency?: string) => void;

//   ward?: string;
//   setWard: (ward?: string) => void;

//   userDetails?: any;
//   refreshUserDetails: (force?: boolean) => Promise<void>;
//   isLoadingUser: boolean;
// }

// const LevelContext = createContext<LevelContextType | undefined>(undefined);

// export const LevelProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { user } = useUser();
//   const { getToken } = useAuth();

//   /* ---------------- STATE ---------------- */
//   const [currentLevel, setCurrentLevel] = useState({
//     type: "home",
//     value: "home",
//   });

//   const [county, setCounty] = useState<string>();
//   const [constituency, setConstituency] = useState<string>();
//   const [ward, setWard] = useState<string>();

//   const [userDetails, setUserDetails] = useState<any>(null);
//   const [isLoadingUser, setIsLoadingUser] = useState(false);

//   /* ---------------- INTERNAL GUARDS ---------------- */
//   const hasFetchedRef = useRef(false);

//    /* ---------------- FETCH USER ---------------- */
//   const refreshUserDetails = async (force = false) => {
//     if (!user) return;

//     // Prevent duplicate calls
//     if (!force && hasFetchedRef.current) return;

//     hasFetchedRef.current = true;
//     setIsLoadingUser(true);

//     try {
//       const token = await getToken();

//       const res = await axios.get(
//         `https://cast-api-zeta.vercel.app/api/users/${user.id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = res.data;

//       setUserDetails(data);
//       setCounty(data?.county);
//       setConstituency(data?.constituency);
//       setWard(data?.ward);
//     } catch (err: any) {
//       if (axios.isAxiosError(err) && err.response?.status === 404) {
//         // User not yet created in backend
//         setUserDetails(null);
//         setCounty(undefined);
//         setConstituency(undefined);
//         setWard(undefined);
//       } else {
//         console.error("❌ Error fetching user details:", err);
//       }
//     } finally {
//       setIsLoadingUser(false);
//     }
//   };

//   /* ---------------- AUTO FETCH (ONCE) ---------------- */
//   useEffect(() => {
//     if (!user) {
//       hasFetchedRef.current = false;
//       setUserDetails(null);
//       return;
//     }

//     refreshUserDetails();
//   }, [user]);

//   /* ---------------- PROVIDER ---------------- */
//   return (
//     <LevelContext.Provider
//       value={{
//         currentLevel,
//         setCurrentLevel,

//         county,
//         setCounty,

//         constituency,
//         setConstituency,

//         ward,
//         setWard,

//         userDetails,
//         refreshUserDetails,
//         isLoadingUser,
//       }}
//     >
//       {children}
//     </LevelContext.Provider>
//   );
// };

// /* ---------------- HOOK ---------------- */
// export const useLevel = () => {
//   const context = useContext(LevelContext);
//   if (!context) {
//     throw new Error("useLevel must be used within a LevelProvider");
//   }
//   return context;
// };

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-expo";
import io, { Socket } from "socket.io-client";
import { Post } from "@/types/post";

interface LevelContextType {
  currentLevel: { type: string; value: string };
  setCurrentLevel: (level: { type: string; value: string }) => void;

  county?: string;
  setCounty: (county?: string) => void;

  constituency?: string;
  setConstituency: (constituency?: string) => void;

  ward?: string;
  setWard: (ward?: string) => void;

  userDetails?: any;
  refreshUserDetails: (force?: boolean) => Promise<void>;
  isLoadingUser: boolean;

  posts: Post[];
  loadingPosts: boolean;
  socket: Socket | null;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);
const BASE_URL = "https://backend-api.redanttech.com";

export const LevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [currentLevel, setCurrentLevel] = useState({ type: "home", value: "home" });
  const [county, setCounty] = useState<string>();
  const [constituency, setConstituency] = useState<string>();
  const [ward, setWard] = useState<string>();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const hasFetchedRef = useRef(false);

  /* ---------------- FETCH USER ---------------- */
  const refreshUserDetails = async (force = false) => {
    if (!user) return;
    if (!force && hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setIsLoadingUser(true);

    try {
      const token = await getToken();
      const res = await axios.get(`${BASE_URL}/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setUserDetails(data);
      setCounty(data?.county);
      setConstituency(data?.constituency);
      setWard(data?.ward);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setUserDetails(null);
        setCounty(undefined);
        setConstituency(undefined);
        setWard(undefined);
      } else {
        console.error("❌ Error fetching user details:", err);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  /* ---------------- FETCH POSTS ---------------- */
  const fetchPosts = async (level = currentLevel) => {
    if (!level?.type || !level?.value) return;
    setLoadingPosts(true);

    try {
      const res = await axios.get<Post[]>(
        `${BASE_URL}/api/posts?levelType=${level.type}&levelValue=${level.value}`
      );
      setPosts(res.data ?? []);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  /* ---------------- SET LEVEL ---------------- */
  const setLevelAndFetch = (level: { type: string; value: string }) => {
    setCurrentLevel(level);
    fetchPosts(level);
  };

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!currentLevel?.type || !currentLevel?.value) return;

    // Disconnect previous socket
    socketRef.current?.disconnect();

    const socket = io(BASE_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    const room = `level-${currentLevel.type}-${currentLevel.value}`;
    socket.emit("joinRoom", room);

    socket.on("newPost", (post: Post) => {
      setPosts((prev) => (prev.some((p) => p._id === post._id) ? prev : [post, ...prev]));
    });

    socket.on("deletePost", (deletedPostId: string) => {
      setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    });

    return () => {
      socket.emit("leaveRoom", room);
      socket.disconnect();
    };
  }, [currentLevel]);

  /* ---------------- AUTO FETCH USER ---------------- */
  useEffect(() => {
    if (!user) {
      hasFetchedRef.current = false;
      setUserDetails(null);
      return;
    }
    refreshUserDetails();
  }, [user]);

  return (
    <LevelContext.Provider
      value={{
        currentLevel,
        setCurrentLevel: setLevelAndFetch,
        county,
        setCounty,
        constituency,
        setConstituency,
        ward,
        setWard,
        userDetails,
        refreshUserDetails,
        isLoadingUser,
        posts,
        loadingPosts,
        socket: socketRef.current,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) throw new Error("useLevel must be used within a LevelProvider");
  return context;
};