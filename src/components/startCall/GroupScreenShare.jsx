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
}) => {
    console.log("aaaaaaaa")
  const remoteScreenRef = useRef(null);
  const nodeRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const { activeGroupParticipants, mutedUsers } = useSelector(
    (state) => state.call
  );

  // 🎥 Attach remote screen track
  useEffect(() => {
    if (remoteScreenTrack && remoteScreenRef.current) {
      remoteScreenTrack.attach(remoteScreenRef.current);
      return () => {
        remoteScreenTrack.detach(remoteScreenRef.current);
      };
    }
  }, [remoteScreenTrack]);

  // ✅ Sort participants so leader is always first
  const sortedParticipants = useMemo(() => {
    return [...activeGroupParticipants].sort((a, b) => {
      if (a.userId === callerId) return -1;
      if (b.userId === callerId) return 1;
      return 0;
    });
  }, [activeGroupParticipants, callerId]);

  return (
    <>
      {/* Shared screen video */}
      <video
        autoPlay
        playsInline
        ref={remoteScreenRef}
        muted
        loop
        className={isMinimized ? "video-minimized" : "video-full"}
      />

      {isMinimized ? (
          <div ref={nodeRef} className="mini-container">
            <div className="mini-controls">
              <button
                onClick={() => setIsMinimized(false)}
                className="btn maximize-btn"
                title="Maximize"
              >
                <Icon icon="ic:round-open-in-full" className="icon-sm" />
              </button>
              <button
                onClick={handleHangUp}
                className="btn hangup-btn"
                title="Hang Up"
              >
                <Icon icon="mdi:phone-hangup" className="icon-sm" />
              </button>
            </div>
          </div>
      ) : (
        // 👉 Full screen view with sidebar participants + controls
        <div className="fullscreen-container">
          {/* Participants Sidebar */}
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

          {/* Bottom Controls */}
          <div className="controls-container">
            <div className="controls-box">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                className={`btn mute-btn ${isMuted ? "muted" : ""}`}
              >
                <Icon
                  icon={isMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"}
                  className="icon-md"
                />
              </button>

              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="btn minimize-btn"
              >
                <Icon icon="ic:round-close-fullscreen" className="icon-md" />
              </button>

              {/* Hang Up Button */}
              <button
                onClick={handleHangUp}
                title="Hang Up"
                className="btn hangup-btn"
              >
                <Icon icon="mdi:phone-hangup" className="icon-md" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupScreenShare;
