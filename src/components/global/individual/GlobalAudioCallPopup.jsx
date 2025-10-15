"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useSocket } from "../../../../context/SocketContext.jsx";
import axios from "axios";
import ReactDOM from "react-dom";
import {
  clearCallState,
  setCallStatus,
  setCallActive,
  setIsScreenSharing,
  setIsRemoteSharing,
  setCallData,
  setActiveGroupParticipants,
  setMutedUsers,
} from "../../../../redux/audioVideoCall/callSlice";

import IncomingAudioCall from "./IncomingAudioCall.jsx";
import OutgoingAudioCall from "./OutgoingAudioCall.jsx";
import Video from "twilio-video";
import { toast } from "react-toastify";
import GroupScreenShare from "../../startCall/GroupScreenShare.jsx";

const GlobalAudioCallPopup = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();

  const [myUserId, setMyUserId] = useState(null);
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteScreenTrack, setRemoteScreenTrack] = useState();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState({});

  const audioContainerRef = useRef(null);

  const { isIncomingCall, isCallActive, callType, callStatus, callData } =
    useSelector((state) => state.call);

  const {
    callerId,
    callerName,
    callerImage,
    receiverId,
    receiverName,
    receiverImage,
    roomName,
  } = callData || {};

  // ✅ Get current user ID from cookies
  useEffect(() => {
    const rawUserData = Cookies.get("HRMS_LoggedIn_UserData");
    try {
      const userData = rawUserData && JSON.parse(rawUserData);
      setMyUserId(userData?.id || null);
      setCurrentUser(userData || null);
    } catch (err) {
      console.error("Invalid user data in cookies", err);
      setMyUserId(null);
      setCurrentUser(null);
    }
  }, []);

  const isCaller = myUserId && callerId === myUserId;
  const isReceiver = myUserId && callerId !== myUserId;

  // ✅ Warn user before refresh/close if in call
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isCallActive) {
        // Show warning dialog
        event.preventDefault();
        event.returnValue =
          "You are currently in a call. If you leave or refresh, the call will be disconnected.";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isCallActive]);

  // ✅ Handle actual disconnect when tab is closed/refreshed
  useEffect(() => {
    const handleUnload = () => {
      if (isCallActive) {
        if (room) {
          room.disconnect();
          setRoom(null);
        }
        if (localTrack) {
          localTrack.stop();
          setLocalTrack(null);
        }

        const targetId = isCaller ? receiverId : callerId;
        if (socket?.current) {
          socket.current.emit("call-ended", { to: targetId });
          socket.current.emit("participant-left", {
            userId: myUserId,
            userName: `${currentUser?.first_name || ""}`.trim(),
            roomName: room?.name,
          });
        }

        dispatch(clearCallState());
        dispatch(setCallActive(false));
      }
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [
    isCallActive,
    room,
    localTrack,
    socket,
    isCaller,
    receiverId,
    callerId,
    dispatch,
    currentUser,
    myUserId,
  ]);

  // ✅ Join Twilio Room
  const joinRoom = async (roomName, identity) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_HRMS_MA_API}/api/twilio/token`,
        { identity, roomName }
      );

      const localAudio = await Video.createLocalAudioTrack();

      const joinedRoom = await Video.connect(data.token, {
        name: roomName,
        tracks: [localAudio],
        video: false,
      });

      setRoom(joinedRoom);
      setLocalTrack(localAudio);

      joinedRoom.on("trackSubscribed", (track, participant) => {
        if (track.kind === "audio") {
          const audioEl = track.attach();
          audioEl.autoplay = true;
          audioEl.playsInline = true;
          audioContainerRef.current.appendChild(audioEl);

          // ✅ Defensive check
          const participantId = participant?.identity
            ? `user-${participant.identity.replace("user-", "")}`
            : `participant-${
                participant?.sid || Math.random().toString(36).slice(2, 8)
              }`;

          setRemoteAudioTracks((prev) => ({
            ...prev,
            [participantId]: track,
          }));
        }

        if (track.kind === "video") {
          setRemoteScreenTrack(track);
          dispatch(setIsRemoteSharing(true));
        }
      });

      // Also handle when track is unsubscribed (remote participant stops sharing)
      joinedRoom.on("trackUnsubscribed", (track, participant) => {
        if (track.kind === "video") {
          setRemoteScreenTrack(null);
          dispatch(setIsRemoteSharing(false));
        }
        if (track.kind === "audio") {
          const participantId = participant?.identity
            ? `user-${participant.identity.replace("user-", "")}`
            : `participant-${participant?.sid || "unknown"}`;

          setRemoteAudioTracks((prev) => {
            const updated = { ...prev };
            delete updated[participantId];
            return updated;
          });
        }
      });

      return joinedRoom;
    } catch (err) {
      console.error("❌ Failed to join room:", err);
      dispatch(setCallStatus("failed"));
    }
  };

  // ✅ Cleanup when call ends or component unmounts
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
        setRoom(null);
      }
      if (localTrack) {
        localTrack.stop();
        setLocalTrack(null);
      }
      dispatch(clearCallState());
    };
  }, []);

  const cleanupRoom = () => {
    if (room) {
      room.localParticipant.tracks.forEach((publication) => {
        if (publication.track) {
          publication.track.stop();
          room.localParticipant.unpublishTrack(publication.track);
        }
      });
      room.disconnect();
      setRoom(null);
    }

    if (localTrack) {
      localTrack.stop();
      setLocalTrack(null);
    }

    dispatch(clearCallState());
  };

  // ✅ Accept incoming call
  const handleAccept = async () => {
    try {
      const identity = `user-${myUserId}`;
      const joinedRoom = await joinRoom(roomName, identity);
      if (joinedRoom) {
        // Emit join-call with identity info so server and other clients know who joined
        socket.current?.emit("join-call", {
          roomName,
          userId: myUserId,
          first_name: `${currentUser?.first_name || ""} ${
            currentUser?.last_name || ""
          }`.trim(),
        });

        dispatch(setCallActive(true));
        dispatch(setCallStatus("accepted"));

        // Notify caller that call was accepted (existing flow), still OK to include name
        socket.current?.emit("call-accepted", {
          to: callerId,
          roomName,
          fromUserId: myUserId,
          fromUserName: `${currentUser?.first_name || ""}`.trim(),
        });
      }
    } catch (err) {
      console.error("❌ Accept call failed:", err);
      toast.error("Failed to accept call");
      dispatch(setCallStatus("failed"));
    }
  };

  const handleCallAccepted = async ({ roomName }) => {
    try {
      dispatch(setCallStatus("accepted"));
      dispatch(setCallActive(true));

      const identity = `user-${myUserId}`;
      const joinedRoom = await joinRoom(roomName, identity);
      if (joinedRoom) {
        socket.current?.emit("join-call", {
          roomName,
          userId: myUserId,
          first_name: `${currentUser?.first_name || ""} ${
            currentUser?.last_name || ""
          }`.trim(),
        });
      }
    } catch (err) {
      console.error("Failed to join room after accept:", err);
      dispatch(setCallStatus("failed"));
    }
  };

  // ✅ Reject call
  const handleReject = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    if (localTrack) {
      localTrack.stop();
      setLocalTrack(null);
    }

    const targetId = isCaller ? receiverId : callerId;
    socket.current.emit("call-rejected", { to: targetId });

    dispatch(clearCallState());
    dispatch(setCallActive(false));
    cleanupRoom();
  };

  const handleHangUp = () => {
    stopScreenShare();
    if (!room) return;

    const totalParticipants = room.participants.size + 1;
    const userName = `${currentUser?.first_name || ""} ${
      currentUser?.last_name || ""
    }`.trim();

    if (totalParticipants > 2) {
      // ✅ Multi-party -> just leave
      socket.current?.emit("participant-left", {
        userId: myUserId,
        first_name: userName,
        roomName,
      });
    } else {
      // ✅ 1v1 -> end the whole call
      socket.current?.emit("call-ended", { roomName });
    }

    // Local cleanup
    room.disconnect();
    setRoom(null);
    if (localTrack) {
      localTrack.stop();
      setLocalTrack(null);
    }

    dispatch(clearCallState());
    dispatch(setActiveGroupParticipants([]));
    dispatch(setCallActive(false));
    dispatch(setMutedUsers([]));
    cleanupRoom();
  };

  // ✅ Screen share
  const startScreenShare = async () => {
    try {
      if (!room) {
        console.warn("⚠️ Cannot start screen share: no active room");
        toast.error("You need to be in a call before sharing your screen");
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = new Video.LocalVideoTrack(stream.getTracks()[0]);
      room.localParticipant.publishTrack(screenTrack);

      dispatch(setIsScreenSharing(true));
      // toast(`name ${roomName}`);

      // 🔔 Emit socket event
      socket.current.emit("screen-share-started", { roomName });

      screenTrack.mediaStreamTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = () => {
    if (!room) return;
    room.localParticipant.tracks.forEach((publication) => {
      if (publication.track.kind === "video") {
        publication.track.stop();
        room.localParticipant.unpublishTrack(publication.track);
      }
    });

    dispatch(setIsScreenSharing(false));

    // 🔔 Emit socket event
    socket.current.emit("screen-share-stopped", { roomName });
  };

  const toggleMute = () => {
    if (localTrack) {
      const willBeMuted = localTrack.isEnabled; // currently true = unmuted
      if (willBeMuted) {
        localTrack.disable(); // mute
      } else {
        localTrack.enable(); // unmute
      }

      // new muted state is opposite of isEnabled
      const newMutedState = !localTrack.isEnabled;

      setIsMuted(newMutedState);

      // notify others correctly
      socket.current.emit("mute-toggle", {
        roomName,
        userId: myUserId,
        isMuted: newMutedState,
      });

      dispatch(setMutedUsers({ userId: myUserId, isMuted: newMutedState }));
    }
  };

  // ✅ Listen to socket events
  useEffect(() => {
    if (!socket?.current) return;

    // 🔹 Listen ONCE for the full participant list when you first join
    socket.current.once("participant-joined", ({ participants }) => {
      dispatch(setActiveGroupParticipants(participants));
    });

    const handleIncomingCall = ({
      roomName,
      callerId,
      callerName,
      callerImage,
    }) => {
      dispatch(
        setCallData({
          callerId,
          callerName,
          callerImage,
          receiverId: myUserId,
          roomName,
        })
      );
      dispatch(setCallStatus("calling"));
    };

    const handleCallRejected = () => {
      toast.error("Call was rejected.");
      dispatch(clearCallState());
    };

    const handleCallEnded = () => {
      toast("Call ended");
      if (room) {
        cleanupRoom();
      }
      if (localTrack) {
        localTrack.stop();
        setLocalTrack(null);
      }
      dispatch(clearCallState());
      dispatch(setActiveGroupParticipants([]));
    };

    const handleRemoteStartScreenShare = ({ from, roomName }) => {
      dispatch(setIsRemoteSharing(true));
    };

    const handleRemoteStopScreenShare = () => {
      dispatch(setIsRemoteSharing(false));
      setRemoteScreenTrack(null);
    };

    const handleParticipantJoined = ({ userId, first_name, participants }) => {
      if (!userId) return;
      if (userId === myUserId) return;

      dispatch(setActiveGroupParticipants(participants));
      // toast.success(`${first_name || "Someone"} joined`);
    };

    const handleParticipantLeft = ({ userId, first_name, participants }) => {
      if (!userId) return;
      if (userId === myUserId) return;

      dispatch(setActiveGroupParticipants(participants));
      toast.info(`${first_name || "Someone"} left`);
    };

    const handleMuteToggle = ({ userId, isMuted }) => {
      dispatch(setMutedUsers({ userId, isMuted }));
    };

    socket.current.on("incoming-call", handleIncomingCall);
    socket.current.on("call-accepted", handleCallAccepted);
    socket.current.on("call-rejected", handleCallRejected);
    socket.current.on("call-ended", handleCallEnded);
    socket.current.on("participant-joined", handleParticipantJoined);
    socket.current.on("participant-left", handleParticipantLeft);
    socket.current.on("mute-toggle", handleMuteToggle);
    socket.current.on(
      "remote-start-screen-share",
      handleRemoteStartScreenShare
    );
    socket.current.on("remote-stop-screen-share", handleRemoteStopScreenShare);

    return () => {
      socket.current.off("incoming-call", handleIncomingCall);
      socket.current.off("call-accepted", handleCallAccepted);
      socket.current.off("call-rejected", handleCallRejected);
      socket.current.off("call-ended", handleCallEnded);
      socket.current.off("participant-joined", handleParticipantJoined);
      socket.current.off("participant-left", handleParticipantLeft);
      socket.current.off("mute-toggle", handleMuteToggle);
      socket.current.off(
        "remote-start-screen-share",
        handleRemoteStartScreenShare
      );
      socket.current.off(
        "remote-stop-screen-share",
        handleRemoteStopScreenShare
      );
    };
  }, [socket?.current, room, localTrack, dispatch, myUserId, currentUser]);

  // ✅ Render conditions
  const shouldRender =
    !callData?.isGroup &&
    callType === "audio" &&
    ["calling", "accepted"].includes(callStatus) &&
    callData &&
    myUserId !== null;

  if (!shouldRender) return null;

  const popupContainer = document.body;

  const screenShareUI = (
    <GroupScreenShare
      callType="oneOnone"
      remoteScreenTrack={remoteScreenTrack}
      handleHangUp={handleHangUp}
      toggleMute={toggleMute}
      isMuted={localTrack ? !localTrack.isEnabled : false}
      remoteAudioTracks={remoteAudioTracks}
    />
  );

  return (
    <>
      {/* Hidden container for remote audio */}
      <div ref={audioContainerRef} style={{ display: "none" }} />

      {remoteScreenTrack &&
        ReactDOM.createPortal(screenShareUI, popupContainer)}

      {isReceiver ? (
        <IncomingAudioCall
          callerName={callerName}
          callerImage={callerImage}
          isIncomingCall={isIncomingCall}
          isCallActive={isCallActive}
          callStatus={callStatus}
          callerId={callerId}
          handleAccept={handleAccept}
          handleReject={handleReject}
          handleHangUp={handleHangUp}
          startScreenShare={startScreenShare}
          stopScreenShare={stopScreenShare}
          joinRoom={joinRoom}
          localTrack={localTrack}
          setIsScreenSharing={setIsScreenSharing}
          remoteScreenTrack={remoteScreenTrack}
          toggleMute={toggleMute}
          isMuted={isMuted}
        />
      ) : isCaller ? (
        <OutgoingAudioCall
          receiverName={receiverName}
          receiverImage={receiverImage}
          callStatus={callStatus}
          handleHangUp={handleHangUp}
          startScreenShare={startScreenShare}
          stopScreenShare={stopScreenShare}
          joinRoom={joinRoom}
          localTrack={localTrack}
          setIsScreenSharing={setIsScreenSharing}
          remoteScreenTrack={remoteScreenTrack}
          toggleMute={toggleMute}
          isMuted={isMuted}
        />
      ) : null}
    </>
  );
};

export default GlobalAudioCallPopup;
