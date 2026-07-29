import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE == "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSiningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance("/auth/check");
      set({ authUser: res.data });
      get().connectToSocket();
    } catch (error) {
      console.log("Error checking auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    try {
      const res = await axiosInstance("/auth/signup", {
        method: "POST",
        data: formData,
      });
      console.log(res.data, "res.data");
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectToSocket();
    } catch (error) {
      console.log("Error signing up", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSiningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance("/auth/logout", {
        method: "POST",
      });
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectFromSocket();
    } catch (error) {
      console.log("Error logging out", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSiningUp: false });
    }
  },

  login: async (formData) => {
    try {
      const res = await axiosInstance("/auth/login", {
        method: "POST",
        data: formData,
      });
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectToSocket();
    } catch (error) {
      console.log("Error logging in", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ isUpdatingProfile: true });
      const res = await axiosInstance("/auth/update-profile", {
        method: "PUT",
        data: formData,
      });
      set({ authUser: res.data, isUpdatingProfile: false });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error updating profile", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectToSocket: () => {
    const { authUser } = get();
    if (!authUser || get()?.socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket });
    socket.on("getOnlineUsers", (onlineUsers) => {
      console.log(onlineUsers, "onlineUsers:::");
      set({ onlineUsers });
    });
  },

  disconnectFromSocket: () => {
    if (get().socket.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));
