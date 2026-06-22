import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

// Interceptor to add token to each request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for handling errors (for example, 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.log("Unauthorized, redirecting to login...");
        localStorage.removeItem("token");
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
