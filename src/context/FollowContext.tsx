import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://cast-api-zeta.vercel.app/api/users";

interface User {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  image: string;
  followers: string[];
  isFollowing?: boolean;
}

interface UserContextType {
  currentUserId: string;
  members: User[];
  loading: boolean;
  fetchUsers: () => void;
  toggleFollow: (member: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserProvider");
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
  currentUserId: string;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, currentUserId }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- Fetch Members ----------------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(BASE_URL, { params: { clerkId: currentUserId } });

      // Set following state based on current user
      const updatedMembers = response.data.map((member: User) => ({
        ...member,
        isFollowing: member.followers.includes(currentUserId),
      }));

      setMembers(updatedMembers);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Follow / Unfollow ----------------
  const toggleFollow = async (member: User) => {
    try {
      const action = member.isFollowing ? "unfollow" : "follow";
      await axios.post(`${BASE_URL}/${currentUserId}/${action}/${member.clerkId}`);

      setMembers((prev) =>
        prev.map((m) =>
          m.clerkId === member.clerkId ? { ...m, isFollowing: !member.isFollowing } : m
        )
      );
    } catch (err: any) {
      console.error("❌ Error updating follow state:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ currentUserId, members, loading, fetchUsers, toggleFollow }}>
      {children}
    </UserContext.Provider>
  );
};