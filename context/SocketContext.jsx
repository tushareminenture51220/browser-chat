"use client";

import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getOnlineUsers, setLoggedInUser } from "../redux/users/action";

// Create Socket Context
const SocketContext = createContext();

// Custom Hook
export function useSocket() {
  return useContext(SocketContext);
}

// Provider Component
export function SocketProvider({ children }) {
  const socket = useRef(null);
  const dispatch = useDispatch();

  const [unReadMessageCount, setUnReadMessageCount] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    const rawUserData = Cookies.get("HRMS_LoggedIn_UserData");
    const authToken = Cookies.get("HRMS_Auth_Token");
    const XSRF = Cookies.get("XSRF-TOKEN");
    const laravel = Cookies.get("laravel_session");
    console.log("data", rawUserData);
    console.log("authToken", authToken);
    console.log("XSRF", XSRF);
    console.log("laravel", laravel);
    
    
    if (!rawUserData || !authToken) {
      console.warn("🔒 No user data or auth token found in cookies.");
      return;
    }

    let userData;
    try {
      userData = JSON.parse(rawUserData);
      dispatch(setLoggedInUser(userData));
    } catch (error) {
      console.error("❌ Failed to parse user data:", error);
      return;
    }

    const userId = userData?.id;
    if (!userId) {
      console.warn("❌ Invalid user data: missing user ID");
      return;
    }

    // ✅ Initialize socket connection
    socket.current = io(`${import.meta.env.VITE_HRMS_MA_API}`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: {
        token: authToken,
        userId: userId,
      },
    });

    // console.log("✅ Socket instance created");

    // 🔌 On connect
    socket.current.on("connect", async () => {
      // console.log("🔌 Connected to Socket.IO server");
      setSocketReady(true);

      // 👇 Add this line:
      socket.current.emit("join-user", userId);
      // console.log("📡 Emitted join-user for:", userId);

      // Join group rooms
      try {
        const response = await fetch(
          `${import.meta.env.VITE_HRMS_MA_API}/api/get-groups/${userId}`
        );
        const { groups } = await response.json();

        if (Array.isArray(groups)) {
          groups.forEach((group) => {
            socket.current.emit("join-group", group.id);
            // console.log("🔗 Joined group:", group.id);
          });
        }
      } catch (err) {
        console.error("❌ Failed to join groups:", err);
      }
    });

    // 🟢 Online users
    socket.current.on("onlineUsers", (data) => {
      // console.log("🟢 Online users updated:", data);
      dispatch(getOnlineUsers(data));
    });

    // 📬 Unread message count
    socket.current.on("unreadMessageCount", (count) => {
      // console.log("📬 Unread message count received:", count);
      setUnReadMessageCount((prev) => ({
        ...prev,
        ...count,
      }));
    });

    // 🧹 Cleanup on unmount
    return () => {
      if (socket.current) {
        console.log("🔌 Disconnecting socket...");
        socket.current.disconnect();
        socket.current = null;
        setSocketReady(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketReady,
        unReadMessageCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
