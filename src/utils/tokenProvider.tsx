import axios from "axios";

export const tokenProvider = async (userId: string) => {
  const res = await axios.post(
    "https://backend-api.redanttech.com/api/token",
    { userId }
  );

  return res.data.token;
};

