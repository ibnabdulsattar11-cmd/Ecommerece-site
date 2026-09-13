import { create } from "zustand";
import api, { setAccessToken } from "@/lib/axios";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Called once on app load to silently restore a session via the refresh cookie.
  initAuth: async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      setAccessToken(data.data.accessToken);
      const profile = await api.get("/users/me");
      set({ user: profile.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (identifier, password) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    setAccessToken(data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data.user;
  },

  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setAccessToken(data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data.user;
  },

  logout: async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
