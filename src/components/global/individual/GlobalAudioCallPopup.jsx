"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactDOM from "react-dom";
import Cookies from "js-cookie";
import { useSocket } from "../../../../context/SocketContext.jsx";
import axios from "axios";
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

  // State management
  const [myUserId, setMyUserId] = useState(null);
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteScreenTrack, setRemoteScreenTrack] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState({});

  // Refs
  const audioContainerRef = useRef(null);
  const cleanupInProgressRef = useRef(false);
  const roomJoinLockRef = useRef(false);

  // Redux state
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

  const isCaller = myUserId && callerId === myUserId;
  const isReceiver = myUserId && callerId !== myUserId;

  // ✅ Get current user from cookies
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

  // ✅ Cleanup media tracks
  const cleanupMedia = useCallback(() => {
    if (cleanupInProgressRef.current) return;
    cleanupInProgressRef.current = true;

    try {
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

      setRemoteScreenTrack(null);
      setRemoteAudioTracks({});
      roomJoinLockRef.current = false;
    } finally {
      cleanupInProgressRef.current = false;
    }
  }, [room, localTrack]);

  // ✅ Complete cleanup including Redux state
  const cleanupRoom = useCallback(() => {
    cleanupMedia();
    dispatch(clearCallState());
    dispatch(setActiveGroupParticipants([]));
    dispatch(setMutedUsers([]));
  }, [cleanupMedia, dispatch]);

  // ✅ Warn user before refresh/close if in call
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isCallActive && room) {
        event.preventDefault();
        event.returnValue =
          "You are currently in a call. If you leave or refresh, the call will be disconnected.";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCallActive, room]);

  // ✅ Handle disconnect on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (isCallActive && room && socket?.current) {
        const targetId = isCaller ? receiverId : callerId;
        const userName = `${currentUser?.first_name || ""}`.trim();

        socket.current.emit("call-ended", { to: targetId });
        socket.current.emit("participant-left", {
          userId: myUserId,
          userName,
          roomName: room.name,
        });

        cleanupMedia();
      }
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [
    isCallActive,
    room,
    socket,
    isCaller,
    receiverId,
    callerId,
    currentUser,
    myUserId,
    cleanupMedia,
  ]);

  // ✅ Join Twilio Room with error handling
  const joinRoom = useCallback(
    async (roomName, identity) => {
      if (roomJoinLockRef.current) {
        console.warn("⚠️ Room join already in progress");
        return null;
      }

      roomJoinLockRef.current = true;

      try {
        // Disconnect existing room if any
        if (room) {
          console.log("Disconnecting existing room before joining new one");
          room.disconnect();
          setRoom(null);
        }

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

        // Handle track subscriptions
        const handleTrackSubscribed = (track, participant) => {
          if (track.kind === "audio") {
            const audioEl = track.attach();
            audioEl.autoplay = true;
            audioEl.playsInline = true;

            if (audioContainerRef.current) {
              audioContainerRef.current.appendChild(audioEl);
            } else {
              setTimeout(() => {
                if (audioContainerRef.current) {
                  audioContainerRef.current.appendChild(audioEl);
                }
              }, 300);
            }

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
        };

        const handleTrackUnsubscribed = (track, participant) => {
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
        };

        joinedRoom.on("trackSubscribed", handleTrackSubscribed);
        joinedRoom.on("trackUnsubscribed", handleTrackUnsubscribed);

        // Handle existing participants
        joinedRoom.participants.forEach((participant) => {
          participant.tracks.forEach((publication) => {
            if (publication.track) {
              handleTrackSubscribed(publication.track, participant);
            }
          });
        });

        roomJoinLockRef.current = false;
        return joinedRoom;
      } catch (err) {
        console.error("❌ Failed to join room:", err);
        dispatch(setCallStatus("failed"));
        toast.error("Failed to join call");
        roomJoinLockRef.current = false;
        return null;
      }
    },
    [room, dispatch]
  );

  // ✅ Accept incoming call
  const handleAccept = useCallback(async () => {
    if (!myUserId || !roomName || !currentUser) {
      console.error("Missing required data for accepting call");
      return;
    }

    try {
      // ✅ Set call active FIRST to prevent popup disappearing
      dispatch(setCallActive(true));
      dispatch(setCallStatus("accepted"));

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

        socket.current?.emit("call-accepted", {
          to: callerId,
          roomName,
          fromUserId: myUserId,
          fromUserName: `${currentUser?.first_name || ""}`.trim(),
        });
      } else {
        // If room join fails, revert state
        dispatch(setCallActive(false));
        dispatch(setCallStatus("calling"));
      }
    } catch (err) {
      console.error("❌ Accept call failed:", err);
      toast.error("Failed to accept call");
      dispatch(setCallActive(false));
      dispatch(setCallStatus("failed"));
    }
  }, [myUserId, roomName, currentUser, callerId, joinRoom, socket, dispatch]);

  // ✅ Handle call accepted by receiver
  const handleCallAccepted = useCallback(
    async ({ roomName }) => {
      if (!myUserId || !currentUser) return;

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
    },
    [myUserId, currentUser, joinRoom, socket, dispatch]
  );

  // ✅ Reject call
  const handleReject = useCallback(() => {
    cleanupMedia();

    const targetId = isCaller ? receiverId : callerId;
    if (socket?.current) {
      socket.current.emit("call-rejected", { to: targetId });
    }

    dispatch(clearCallState());
    dispatch(setCallActive(false));
  }, [cleanupMedia, isCaller, receiverId, callerId, socket, dispatch]);

  // ✅ Hang up call
  const handleHangUp = useCallback(() => {
    if (!room) return;

    const totalParticipants = room.participants.size + 1;
    const userName = `${currentUser?.first_name || ""} ${
      currentUser?.last_name || ""
    }`.trim();

    if (totalParticipants > 2) {
      socket.current?.emit("participant-left", {
        userId: myUserId,
        first_name: userName,
        roomName,
      });
    } else {
      socket.current?.emit("call-ended", { roomName });
    }

    cleanupRoom();
    dispatch(setCallActive(false));
  }, [room, currentUser, myUserId, roomName, socket, cleanupRoom, dispatch]);

  // ✅ Screen share
  const startScreenShare = useCallback(async () => {
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
      socket.current?.emit("screen-share-started", { roomName });

      screenTrack.mediaStreamTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Screen share error:", err);
      toast.error("Failed to start screen sharing");
    }
  }, [room, roomName, socket, dispatch]);

  const stopScreenShare = useCallback(() => {
    if (!room) return;

    room.localParticipant.tracks.forEach((publication) => {
      if (publication.track.kind === "video") {
        publication.track.stop();
        room.localParticipant.unpublishTrack(publication.track);
      }
    });

    dispatch(setIsScreenSharing(false));
    socket.current?.emit("screen-share-stopped", { roomName });
  }, [room, roomName, socket, dispatch]);

  // ✅ Toggle mute
  const toggleMute = useCallback(() => {
    if (!localTrack) return;

    const willBeMuted = localTrack.isEnabled;
    if (willBeMuted) {
      localTrack.disable();
    } else {
      localTrack.enable();
    }

    const newMutedState = !localTrack.isEnabled;
    setIsMuted(newMutedState);

    socket.current?.emit("mute-toggle", {
      roomName,
      userId: myUserId,
      isMuted: newMutedState,
    });

    dispatch(setMutedUsers({ userId: myUserId, isMuted: newMutedState }));
  }, [localTrack, roomName, myUserId, socket, dispatch]);

  // ✅ Socket event listeners
  useEffect(() => {
    if (!socket?.current) return;

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
      cleanupRoom();
    };

    const handleCallEnded = () => {
      toast("Call ended");
      cleanupRoom();
    };

    const handleRemoteStartScreenShare = () => {
      dispatch(setIsRemoteSharing(true));
    };

    const handleRemoteStopScreenShare = () => {
      dispatch(setIsRemoteSharing(false));
      setRemoteScreenTrack(null);
    };

    const handleParticipantJoined = ({ userId, first_name, participants }) => {
      if (!userId || userId === myUserId) return;
      dispatch(setActiveGroupParticipants(participants));
    };

    const handleParticipantLeft = ({ userId, first_name, participants }) => {
      if (!userId || userId === myUserId) return;
      dispatch(setActiveGroupParticipants(participants));
      toast.info(`${first_name || "Someone"} left`);
    };

    const handleMuteToggle = ({ userId, isMuted }) => {
      dispatch(setMutedUsers({ userId, isMuted }));
    };

    // Register listeners
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

    // Cleanup listeners
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
  }, [socket?.current, myUserId, dispatch, handleCallAccepted, cleanupRoom]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRoom();
    };
  }, [cleanupRoom]);

  // ✅ Render conditions
  const shouldRender =
    !callData?.isGroup &&
    callType === "audio" &&
    ["calling", "accepted"].includes(callStatus) &&
    callData &&
    myUserId !== null;

  if (!shouldRender) return null;

  const popupContainer = document.body;

  // ✅ Screen share UI
  if (remoteScreenTrack) {
    return ReactDOM.createPortal(
      <GroupScreenShare
        callType="oneOnone"
        remoteScreenTrack={remoteScreenTrack}
        handleHangUp={handleHangUp}
        toggleMute={toggleMute}
        isMuted={localTrack ? !localTrack.isEnabled : false}
        remoteAudioTracks={remoteAudioTracks}
      />,
      popupContainer
    );
  }

  // ✅ Incoming call UI
  if (isReceiver) {
    return (
      <>
        <div ref={audioContainerRef} style={{ display: "none" }} aria-hidden />
        {ReactDOM.createPortal(
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
            toggleMute={toggleMute}
            isMuted={isMuted}
          />,
          popupContainer
        )}
      </>
    );
  }

  // ✅ Outgoing call UI
  if (isCaller) {
    return (
      <>
        <div ref={audioContainerRef} style={{ display: "none" }} aria-hidden />
        {ReactDOM.createPortal(
          <OutgoingAudioCall
            receiverName={receiverName}
            receiverImage={receiverImage}
            callStatus={callStatus}
            handleHangUp={handleHangUp}
            startScreenShare={startScreenShare}
            stopScreenShare={stopScreenShare}
            toggleMute={toggleMute}
            isMuted={isMuted}
          />,
          popupContainer
        )}
      </>
    );
  }

  return null;
};

export default GlobalAudioCallPopup;
