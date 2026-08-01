import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export function useModuleManifests(businessId, token) {
  return useQuery({
    queryKey: ["moduleManifests", businessId],
    queryFn: async () => {
      if (!businessId) return [];

      try {
        // Fetch enabled manifests directly from the new Django module_registry
        const manifestResponse = await axios.get(
          `${API_BASE}/api/registry/manifests/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        return manifestResponse.data;
      } catch (error) {
        console.warn("Failed to fetch manifests from API.", error);
        // If the token is invalid/expired, log out the user
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("businessId");
          localStorage.removeItem("logoUrl");
          localStorage.removeItem("themeColor");
          window.location.href = "/";
        }
        return [];
      }
    },
    enabled: !!businessId,
  });
}
