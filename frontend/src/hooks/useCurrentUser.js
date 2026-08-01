import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export function useCurrentUser(token) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!token,
  });
}
