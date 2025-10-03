"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import { setIncomingCall } from "../redux/audioVideoCall/callSlice";

const GlobalSocketListener = () => {
  const { socket, socketReady } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socketReady) return;

    const activeSocket = socket?.current || socket;
    const rawUserData = Cookies.get("HRMS_LoggedIn_UserData");

    let userData;
    try {
      userData = rawUserData && JSON.parse(rawUserData);
    } catch (err) {
      console.error("❌ Failed to parse user data from cookies:", err);
      return;
    }

    const myUserId = userData?.id;
    if (!myUserId) {
      console.warn("❌ No user ID found");
      return;
    }

    // ✅ Join user room
    activeSocket.emit("join-user", myUserId);

    // ✅ Join all group rooms
    axios
      .get(`${process.env.NEXT_PUBLIC_HRMS_MA_API}/api/get-groups/${myUserId}`)
      .then((res) => {
        res.data.groups?.forEach((group) => {
          activeSocket.emit("join-group", group.id);
        });
      })
      .catch((err) => console.error("❌ Failed to join groups:", err));

    // 📲 Handle incoming call
    activeSocket.on("incoming-call", (payload) => {
      const {
        isGroup = false,
        callType,
        callerId,
        callerName,
        callerImage,
        signalingData,
        groupId,
        groupName,
        groupImage,
        roomName,
        meetingLink,
      } = payload;

      if (callerId === myUserId) return; // ignore self calls

      if (isGroup) {
        dispatch(
          setIncomingCall({
            callType,
            isGroup: true,
            groupId,
            groupName,
            groupImage,
            roomName,
            callData: {
              callerId,
              callerName,
              callerImage,
              signalingData,
              roomName,
              meetingLink,
            },
          })
        );
      } else {
        dispatch(
          setIncomingCall({
            callType,
            isGroup: false,
            callData: {
              callerId,
              callerName,
              callerImage,
              signalingData,
              roomName,
            },
          })
        );
      }
    });
  }, [socketReady, dispatch]);

  return null;
};

export default GlobalSocketListener;
