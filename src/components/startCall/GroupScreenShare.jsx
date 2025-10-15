"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import ParticipantCard from "./ParticipantCard";
import "./GroupScreenShare.css";

const GroupScreenShare = ({
  remoteScreenTrack,
  handleHangUp,
  toggleMute,
  isMuted,
  callerId,
  remoteAudioTracks,
  callType = "groupShare",
  receiverId,
  receiverImage,
  callerImage,
  receiverName,
  callerName,
  groupName,
  groupImage,
}) => {
  console.log("image", groupImage)
  const remoteScreenRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");

  const { activeGroupParticipants, mutedUsers } = useSelector(
    (state) => state.call
  );


  // Determine display name and image based on call type
  const displayName = useMemo(() => {
    if (callType === "groupShare" && groupName) {
      return groupName;
    }
    return receiverName || callerName;
  }, [callType, groupName, receiverName, callerName]);

  const displayImage = useMemo(() => {
    if (callType === "groupShare" && groupImage) {
      return groupImage;
    }
    return receiverImage || callerImage;
  }, [callType, groupImage, receiverImage, callerImage]);

  // Attach remote screen track
  useEffect(() => {
    if (remoteScreenTrack && remoteScreenRef.current) {
      remoteScreenTrack.attach(remoteScreenRef.current);
      return () => remoteScreenTrack.detach(remoteScreenRef.current);
    }
  }, [remoteScreenTrack]);

  // Call duration timer
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      setCallDuration(`${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedParticipants = useMemo(() => {
    return [...activeGroupParticipants].sort((a, b) => {
      if (a.userId === callerId) return -1;
      if (b.userId === callerId) return 1;
      return 0;
    });
  }, [activeGroupParticipants, callerId]);

  return (
    <>
      {/* Shared Screen Video */}
      <video
        autoPlay
        playsInline
        ref={remoteScreenRef}
        muted
        loop
        className={`${
          isMinimized
            ? "video-minimized"
            : callType === "oneOnone"
            ? "video-full-one"
            : "video-full"
        }`}
      />

      {/* Minimized header-style popup */}
      {isMinimized && (
        <div className="mini-header-container">
          <div className="mini-left">
            <div className="chat-avatar">
              <img
                src={`https://eminenture.live/public/chatting-files/${displayImage}`}
                alt={displayName}
              />
            </div>
            <div className="mini-user-info">
              <p className="mini-username">{displayName}</p>
              <p className="mini-time">In call. {callDuration}</p>
            </div>
          </div>
          <div className="mini-right">
            <button
              onClick={() => setIsMinimized(false)}
              className="mini-action-btn maximize"
              title="Maximize"
            >
              <Icon icon="ic:round-open-in-full" className="icon-sm" />
            </button>
            <button
              onClick={handleHangUp}
              className="mini-action-btn hangup"
              title="Hang Up"
            >
              <Icon icon="mdi:phone-hangup" className="icon-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Hide controls when minimized */}
      {!isMinimized && (
        <div className="controls-container">
          <div className="controls-box">
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              className={`mute-btn ${isMuted ? "muted" : ""}`}
            >
              <Icon
                icon={isMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"}
                className="icon-md"
              />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize"
              className="minimizing-btn"
            >
              <Icon icon="ic:round-close-fullscreen" className="icon-md" />
            </button>

            <button
              onClick={handleHangUp}
              title="Hang Up"
              className="hangup-btn"
            >
              <Icon icon="mdi:phone-hangup" className="icon-md" />
            </button>
          </div>
        </div>
      )}

      {/* Participants Sidebar */}
      {callType !== "oneOnone" && !isMinimized && (
        <div className="participants-sidebar">
          {sortedParticipants.map((user) => (
            <ParticipantCard
              key={user.userId}
              user={user}
              callerId={callerId}
              isUserMuted={mutedUsers[user.userId] ?? user?.isMuted}
              remoteAudioTrack={remoteAudioTracks[`user-${user.userId}`]}
              variant="sidebar"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default GroupScreenShare;