import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const logoutStore = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user profile
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/me");
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch user data",
        );
      }
    },
    // Enable request only if token exists
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  const logout = () => {
    try {
      logoutStore();
      queryClient.clear();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    user,
    isLoading: isUserLoading,
    isError: !!userError,
    error: userError,
    logout,
  };
};
