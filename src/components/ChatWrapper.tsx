// import { studyBuddyTheme } from "@/lib/theme";
// import { useUser } from "@clerk/clerk-expo";
// import type { UserResource } from "@clerk/types";
// import { useEffect, useRef } from "react";
// import { Chat, OverlayProvider, useCreateChatClient } from "stream-chat-expo";
// import { FullScreenLoader } from "./FullScreenLoader";

// const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

// const syncUserToStream = async (user: UserResource) => {
//   try {
//     await fetch("/api/sync-user", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: user.id,
//         name: user.fullName ?? user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
//         image: user.imageUrl,
//       }),
//     });
//   } catch (error) {
//     console.error("Failed to syn user to Stream", error);
//   }
// };

// const ChatClient = ({ children, user }: { children: React.ReactNode; user: UserResource }) => {
//   const syncedRef = useRef(false);

//   useEffect(() => {
//     // this if statements is needed so that we don't run this method multiple times. only once!
//     if (!syncedRef.current) {
//       syncedRef.current = true;
//       syncUserToStream(user);
//     }
//   }, [user]);

//   const tokenProvider = async () => {
//     try {
//       const response = await fetch("/api/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id }),
//       });
//       const data = await response.json();
//       return data.token;
//     } catch (error) {
//        console.log("chatwrapper error", error);

//     }
//   };

//   const chatClient = useCreateChatClient({
//     apiKey: STREAM_API_KEY,
//     userData: {
//       id: user.id,
//       name: user.fullName ?? user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
//       image: user.imageUrl,
//     },
//     tokenOrProvider: tokenProvider,
//   });

//   if (!chatClient) return <FullScreenLoader message="Loading..." />;

//   return (
//     <OverlayProvider value={{ style: studyBuddyTheme }}>
//       <Chat client={chatClient} style={studyBuddyTheme}>
//         {children}
//       </Chat>
//     </OverlayProvider>
//   );
// };

// const ChatWrapper = ({ children }: { children: React.ReactNode }) => {
//   const { user, isLoaded } = useUser();

//   if (!isLoaded) return <FullScreenLoader message="Loading..." />;

//   // not signed in — render children directly (auth screens)
//   if (!user) return <>{children}</>;

//   return <ChatClient user={user}>{children}</ChatClient>;
// };
// export default ChatWrapper;

// // TODO: ADD sentry logs link in the video

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Chat, OverlayProvider, useCreateChatClient } from "stream-chat-expo";
import { FullScreenLoader } from "./FullScreenLoader";
import { studyBuddyTheme } from "@/lib/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

async function syncUserToStream(user: any) {
  try {
    await fetch(`${API_URL}/stream/sync-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        name: user.fullName ?? user.username ?? "Guest",
        image: user.imageUrl,
      }),
    });
  } catch (error) {
    console.error("Failed to sync user:", error);
  }
}

async function getStreamToken(userId: string) {
  const response = await fetch(`${API_URL}/stream/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await response.json();
  return data.token;
}

const ChatWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const syncedRef = useRef(false);

  // Wait for Clerk to load
  if (!isLoaded) {
    return <FullScreenLoader message="Loading user..." />;
  }

  // Not signed in → just render normally
  if (!user) {
    return <>{children}</>;
  }

  // Sync once
  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      syncUserToStream(user);
    }
  }, [user]);

  const tokenProvider = async () => {
    return await getStreamToken(user.id);
  };

  const chatClient = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: {
      id: user.id,
      name: user.fullName ?? user.username ?? "Guest",
      image: user.imageUrl,
    },
    tokenOrProvider: tokenProvider,
  });

  if (!chatClient) {
    return <FullScreenLoader message="Loading chat..." />;
  }

  return (
    <OverlayProvider value={{ style: studyBuddyTheme }}>
      <Chat client={chatClient} style={studyBuddyTheme}>
        {children}
      </Chat>
    </OverlayProvider>
  );
};

export default ChatWrapper;