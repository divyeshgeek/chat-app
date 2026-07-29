import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../src/pages/HomPage";
import SignupPage from "../src/pages/SignupPage";
import LoginPage from "../src/pages/LoginPage";
import SettingsPage from "../src/pages/SettingsPage";
import ProfilePage from "../src/pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { showNotification } from "./lib/showNotification";
import { useChatStore } from "./store/useChatStore";

const App = () => {
  const { theme } = useThemeStore();
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } =
    useAuthStore();
  const { selectedUser } = useChatStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      socket.on("newMessage", (newMessages) => {
        // const isMessageSentFromSelectedUser =
        //   newMessages.senderId === selectedUser._id;
        // if (!isMessageSentFromSelectedUser) return;
        showNotification({
          title: `New message`,
          message: newMessages?.text || "Sent an image",
          icon: selectedUser?.profilePic,
        });
      });
    }
  }, [authUser]);
  console.log(onlineUsers, "onlineUsers");
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
