"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import axios from "axios";
import { useSocket } from "../../../context/SocketContext.jsx";
import {
  setCallActive,
  setCallStatus,
  clearCallState,
  setIsScreenSharing,
  setIsRemoteSharing,
  setActiveGroupParticipants,
  setMutedUsers,
  setMeetingInterval,
} from "../../../redux/audioVideoCall/callSlice.js";

import OutgoingGroupAudioCall from "./OutgoingGroupAudioCall.jsx";
import Video from "twilio-video";
import { toast } from "react-toastify";
import IncomingGroupAudioCall from "./IncomingGroupAudioCall.jsx";
import AcceptedGroupCall from "../startCall/AcceptedGroupCall.jsx";
import { useCallFunctions } from "../../../context/CallFunctionContext.jsx";
import GroupScreenShare from "../startCall/GroupScreenShare.jsx";

const GlobalGroupAudioCallPopup = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { handleRejoinRef } = useCallFunctions();

  const {
    isGroup: globalIsGroup,
    isIncomingCall,
    isOutgoingCall,
    isCallActive,
    callStatus,
    callType,
    callData,
    groupId: topGroupId,
    groupName: topGroupName,
    groupImage: topGroupImage,
    roomName,
    activeGroupParticipants,
    meetingLink,
    meetingStart,
    mutedUsers,
    isScreenSharing,
  } = useSelector((state) => state.call);

  const [myUserId, setMyUserId] = useState(null);
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteScreenTrack, setRemoteScreenTrack] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const acceptLockRef = useRef(false);
  const audioContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const isGroup = globalIsGroup || callData?.isGroup || false;
  const groupId = topGroupId || callData?.groupId;
  const groupName = topGroupName || callData?.groupName;
  const groupImage = topGroupImage || callData?.groupImage;
  const callerId = callData?.callerId || null;

  useEffect(() => {
    const rawUserData = Cookies.get("HRMS_LoggedIn_UserData");
    try {
      const parsed = rawUserData && JSON.parse(rawUserData);
      setUserData(parsed || null);
      setMyUserId(parsed?.id || null);
    } catch (err) {
      console.error("Invalid user data in cookies", err);
      setUserData(null);
      setMyUserId(null);
    }
  }, []);

  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCallActive]);

  const cleanupMedia = () => {
    acceptLockRef.current = false;
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
  };

  const cleanupRoom = () => {
    cleanupMedia();
    dispatch(clearCallState()); // only call when whole meeting ends
  };

  // ✅ Join Twilio Room
  const joinRoom = async (roomName, identity) => {
    try {
      if (room) {
        console.log("Disconnecting existing room before joining a new one");
        room.disconnect();
        setRoom(null);
      }
      const { data } = await axios.post(
        `${import.meta.env.VITE_HRMS_MA_API}/api/twilio/token`,
        { identity, roomName }
      );

      const localAudio = await Video.createLocalAudioTrack();
      localAudio.disable();

      const joinedRoom = await Video.connect(data.token, {
        name: roomName,
        tracks: [localAudio],
        video: false,
      });

      const existingParticipant = joinedRoom.participants.get(
        `user-${myUserId}`
      );
      if (existingParticipant) {
        existingParticipant.disconnect();
      }

      setRoom(joinedRoom);
      setLocalTrack(localAudio);

      // mark as muted in Redux + UI
      setIsMuted(true);
      dispatch(setMutedUsers({ userId: myUserId, isMuted: true }));

      const handleParticipant = (participant) => {
        participant.on("trackSubscribed", (track) => {
          if (track.kind === "audio") {
            // Attach audio for playback
            const audioEl = track.attach();
            audioEl.autoplay = true;
            audioEl.playsInline = true;

            if (audioContainerRef.current) {
              audioContainerRef.current.appendChild(audioEl);
            } else {
              console.warn("audioContainerRef is null, retrying later...");
              setTimeout(() => {
                if (audioContainerRef.current) {
                  audioContainerRef.current.appendChild(audioEl);
                }
              }, 300);
            }

            // ✅ Save track for voice level detection
            setRemoteAudioTracks((prev) => ({
              ...prev,
              [participant.identity]: track,
            }));
          }

          if (track.kind === "video") {
            setRemoteScreenTrack(track);
            dispatch(setIsRemoteSharing(true));
          }
        });

        participant.on("trackUnsubscribed", (track) => {
          if (track.kind === "video") {
            setRemoteScreenTrack(null);
            dispatch(setIsRemoteSharing(false));
          }
        });
      };

      joinedRoom.participants.forEach(handleParticipant);
      joinedRoom.on("participantConnected", handleParticipant);

      return joinedRoom;
    } catch (err) {
      console.error("❌ Failed to join room:", err);
      dispatch(setCallStatus("failed"));
    }
  };

  // ✅ Cleanup
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

  const handleAccept = async () => {
    if (acceptLockRef.current) return;
    acceptLockRef.current = true;

    try {
      const identity = `user-${myUserId}`;
      const joinedRoom = await joinRoom(roomName, identity);

      if (joinedRoom) {
        dispatch(setCallActive(true));
        dispatch(setCallStatus("accepted"));

        socket.current.emit("group-call-accepted", {
          groupId,
          groupName,
          groupImage,
          userId: myUserId,
          name: userData.first_name,
          image: userData?.image,
          roomName,
        });
      }
    } catch (err) {
      console.error("❌ Accept group call failed:", err);
      toast.error("Failed to join group call");
      dispatch(setCallStatus("failed"));
      acceptLockRef.current = false;
    }
  };

  const handleRejoin = async (existingRoomName, rejoinGroupId) => {
    if (!existingRoomName || !myUserId || !rejoinGroupId) {
      console.error("Room name, user ID, or groupId missing for rejoin");
      return;
    }

    try {
      const identity = `user-${myUserId}`;
      const joinedRoom = await joinRoom(existingRoomName, identity);

      if (joinedRoom) {
        dispatch(setCallActive(true));
        dispatch(setCallStatus("accepted"));

        socket.current.emit("group-call-accepted", {
          groupId: rejoinGroupId, // use passed value
          groupName,
          groupImage,
          userId: myUserId,
          name: userData.first_name,
          roomName: existingRoomName,
          image: userData?.image,
        });

        // toast.success("You rejoined the group call successfully!");
      }
    } catch (err) {
      console.error("❌ Failed to rejoin call:", err);
      toast.error("Failed to rejoin the group call");
    }
  };
  handleRejoinRef.current = handleRejoin;

  // ✅ Reject group call
  const handleReject = () => {
    socket.current.emit("group-call-rejected", {
      groupId,
      groupName,
      groupImage,
      userId: myUserId,
      roomName,
    });

    // Just mark this user as inactive, keep isGroup + callType so they can rejoin
    dispatch(setCallActive(false));
    dispatch(setCallStatus("rejected"));
  };

  const handleHangUp = async () => {
    // total participants = remote + self
    const totalParticipants = room?.participants
      ? room.participants.size + 1
      : 1;

    // console.log("Total participants before leaving:", totalParticipants);
    // console.log("Time:", meetingStart);

    // calculate duration from Redux meetingStart
    let formatted = "0:00";

    if (meetingStart) {
      const totalSeconds = Math.floor((Date.now() - meetingStart) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    // console.log("formatted", formatted);

    // If exactly 2 participants (me + 1 other), then after I leave → only 1 remains
    if (totalParticipants === 2 || totalParticipants === 1) {
      try {
        await axios.put(
          `${import.meta.env.VITE_HRMS_MA_API}/api/editGroupCallData`,
          {
            roomName,
            members_joined: totalParticipants, // before leaving
            meeting_interval: formatted, // use real duration
          }
        );

        // save in redux too
        dispatch(setMeetingInterval(formatted));
      } catch (err) {
        console.error("Failed to mark meeting ended:", err);
      }
    }

    // Stop and unpublish video tracks
    room?.localParticipant?.tracks.forEach((publication) => {
      if (publication.track.kind === "video") {
        publication.track.stop();
        room?.localParticipant.unpublishTrack(publication.track);
      }
    });

    if (localTrack) {
      localTrack.stop();
      setLocalTrack(null);
    }

    socket.current.emit("group-call-left", {
      groupId,
      groupName,
      groupImage,
      userId: myUserId,
      roomName,
      name: userData.first_name,
    });

    dispatch(setCallActive(false));
    cleanupMedia();
  };

  // ✅ Screen share
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = new Video.LocalVideoTrack(stream.getTracks()[0]);
      room.localParticipant.publishTrack(screenTrack);

      dispatch(setIsScreenSharing(true));

      // Inform others
      socket.current.emit("group-screen-share-started", {
        groupId,
        userId: myUserId,
        roomName: groupId,
      });

      screenTrack.mediaStreamTrack.onended = () => stopScreenShare();
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

    socket.current.emit("group-screen-share-stopped", {
      groupId,
      userId: myUserId,
      roomName: groupId,
    });
  };

  const formatDuration = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket?.current) return;

    const handleGroupCallAccepted = ({
      userId,
      from,
      participants,
      roomName,
      name,
      image,
    }) => {
      dispatch(setActiveGroupParticipants(participants));

      // Allow both fresh join and rejoin
      if (userId === myUserId || from === myUserId) {
        if (room) {
          room.disconnect();
          setRoom(null);
        }

        dispatch(setCallStatus("accepted"));
        dispatch(setCallActive(true));

        // ✅ Show notification only to others, not self
        if (userId !== myUserId) {
          toast.success(`${name} joined`);
        }

        const identity = `user-${myUserId}`;
        joinRoom(roomName, identity);
      }
    };

    const handleGroupCallLeft = ({ groupId, userId, participants, name }) => {
      dispatch(setActiveGroupParticipants(participants));

      // ✅ Show toast only to other users, not the one who left
      if (userId !== myUserId) {
        toast.info(`${name} left the call`);
      }
    };

    const handleGroupCallEnded = () => {
      // toast("Group call ended");

      if (room) {
        cleanupRoom();
      }
      if (localTrack) {
        localTrack.stop();
        setLocalTrack(null);
      }
      dispatch(clearCallState());
    };

    const handleRemoteStartScreenShare = () => {
      dispatch(setIsRemoteSharing(true));
    };

    const handleRemoteStopScreenShare = () => {
      dispatch(setIsRemoteSharing(false));
      setRemoteScreenTrack(null);
    };

    const handleMuteToggle = ({ userId, isMuted }) => {
      dispatch(setMutedUsers({ userId, isMuted }));
    };

    // 👂 Register listeners
    socket.current.on("group-call-accepted", handleGroupCallAccepted);
    socket.current.on("group-call-left", handleGroupCallLeft);
    socket.current.on("group-call-ended", handleGroupCallEnded);
    socket.current.on("group-mute-toggle", handleMuteToggle);
    socket.current.on(
      "group-remote-start-screen-share",
      handleRemoteStartScreenShare
    );
    socket.current.on(
      "group-remote-stop-screen-share",
      handleRemoteStopScreenShare
    );

    return () => {
      socket.current.off("group-call-accepted", handleGroupCallAccepted);
      socket.current.off("group-call-left", handleGroupCallLeft);
      socket.current.off("group-call-ended", handleGroupCallEnded);
      socket.current.off("group-mute-toggle", handleMuteToggle);
      socket.current.off(
        "group-remote-start-screen-share",
        handleRemoteStartScreenShare
      );
      socket.current.off(
        "group-remote-stop-screen-share",
        handleRemoteStopScreenShare
      );
    };
  }, [socket?.current, room, localTrack, dispatch, myUserId]);

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
      socket.current.emit("group-mute-toggle", {
        groupId,
        userId: myUserId,
        isMuted: newMutedState,
      });

      dispatch(setMutedUsers({ userId: myUserId, isMuted: newMutedState }));
    }
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // ✅ Render
  const shouldRenderGroupCall =
    isGroup &&
    ["group-audio"].includes(callType) &&
    (isIncomingCall || isOutgoingCall || isCallActive);

    if (!shouldRenderGroupCall) return null;

  const sharedProps = {
    myUserId,
    isCallActive,
    handleAccept,
    handleReject,
    handleHangUp,
    startScreenShare,
    stopScreenShare,
    remoteScreenTrack,
    toggleMute,
    setIsMuted,
    isMuted,
    callStarted,
    setCallStarted,
    formatDuration,
    callerId,
    remoteAudioTracks,
  };

  // near top of component render (just before your shouldRenderGroupCall check)
//   console.log("remoteScreenTrack", remoteScreenTrack)
  return (
    <>
      {/* Always-mounted hidden audio container so track.attach() can append safely */}
      <div
        ref={audioContainerRef}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {!remoteScreenTrack && isCallActive && (
        <AcceptedGroupCall
          groupName={groupName}
          callDuration={callDuration}
          activeGroupParticipants={activeGroupParticipants}
          mutedUsers={mutedUsers}
          isMuted={isMuted}
          isScreenSharing={isScreenSharing}
          toggleMute={toggleMute}
          toggleScreenShare={handleToggleScreenShare}
          handleHangUp={handleHangUp}
          setIsMinimized={setIsMinimized}
          formatDuration={formatDuration}
          callerId={callerId}
          remoteAudioTracks={remoteAudioTracks}
        />
      )}

      {remoteScreenTrack && (
        <GroupScreenShare
          remoteScreenTrack={remoteScreenTrack}
          handleHangUp={handleHangUp}
          toggleMute={toggleMute}
          isMuted={localTrack ? !localTrack.isEnabled : false}
          callerId={callerId}
          remoteAudioTracks={remoteAudioTracks}
        />
      )}

      {/* {!shouldRenderGroupCall ? null : remoteScreenTrack ? (
        ""
      ) : isOutgoingCall && ["calling", "accepted"].includes(callStatus) ? (
        <OutgoingGroupAudioCall {...sharedProps} />
      ) : isIncomingCall && ["calling", "accepted"].includes(callStatus) ? (
        <IncomingGroupAudioCall {...sharedProps} />
      ) : null} */}
    </>
  );
};

export default GlobalGroupAudioCallPopup;
