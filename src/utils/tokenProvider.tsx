import axios from "axios";

export const tokenProvider = async (userId: string) => {
  try {
    const res = await axios.post(
      "https://backend-api.redanttech.com/api/stream/token",
      { userId },
      { headers: { "Content-Type": "application/json" } },
    );

    if (!res.data?.token) {
      throw new Error("Token not returned from server");
    }

    return res.data.token;
  } catch (err: any) {
    console.error("Failed to fetch Stream token:", err.message || err);
    throw err;
  }
};
