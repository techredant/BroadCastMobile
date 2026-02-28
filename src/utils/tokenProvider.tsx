import axios from "axios";

export const tokenProvider = async (userId: string) => {
  const res = await axios.post(
    "https://cast-api-zeta.vercel.app/api/stream/token",
    { userId }
  );

  return res.data.token;
};

