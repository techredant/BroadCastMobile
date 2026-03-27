// ChatWrapper.tsx
import { useEffect, useRef, useState } from "react";
import { Chat, OverlayProvider, useCreateChatClient } from "stream-chat-expo";
import { FullScreenLoader } from "./FullScreenLoader";
import { studyBuddyTheme } from "@/lib/theme";

const API_URL = "https://cast-api-zeta.vercel.app";
const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

async function syncUserToStream(user: any) {
  try {
    await fetch(`${API_URL}/api/stream/sync-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        name: user.fullName ?? user.username ?? "Guest",
        image: user.imageUrl,
      }),
    });
  } catch (err) {
    console.error("Failed to sync user:", err);
  }
}

async function getStreamToken(userId: string) {
  const res = await fetch(`${API_URL}/api/stream/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.token) throw new Error("No token returned from backend");
  return data.token;
}

type ChatWrapperProps = {
  user: any;
  children: React.ReactNode;
};

export const ChatWrapper = ({ user, children }: ChatWrapperProps) => {
  const [clientReady, setClientReady] = useState(false);
  const syncedRef = useRef(false);

  // Sync user once
  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      syncUserToStream(user).catch(console.error);
    }
  }, [user]);

  // Create chat client
  const chatClient = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: {
      id: user.id,
      name: user.fullName ?? user.username ?? "Guest",
      image: user.imageUrl,
    },
    tokenOrProvider: async () => await getStreamToken(user.id),
  });

  // ✅ Ready state
  useEffect(() => {
    if (chatClient) setClientReady(true);
  }, [chatClient]);

  if (!chatClient || !clientReady) {
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
