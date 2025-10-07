"use client";

import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import ParticipantCard from "./ParticipantCard";
import "./AcceptedGroupCall.css";

const AcceptedGroupCall = ({
  callDuration,
  activeGroupParticipants = [],
  mutedUsers = {},
  isMuted,
  isScreenSharing,
  toggleMute,
  toggleScreenShare,
  handleHangUp,
  setIsMinimized,
  formatDuration,
  callerId,
  remoteAudioTracks,
}) => {
  // Sort participants so caller is first
  const sortedParticipants = useMemo(() => {
    return [...activeGroupParticipants].sort((a, b) => {
      if (a.userId === callerId) return -1;
      if (b.userId === callerId) return 1;
      return 0;
    });
  }, [activeGroupParticipants, callerId]);

  return (
    <div className="accepted-call-container">
      {/* Header */}
      <div className="accepted-call-header">
        Audio call • {formatDuration(callDuration)}
        <button
          onClick={() => setIsMinimized(true)}
          title="Minimize"
          className="minimize-btn"
        >
          <Icon icon="ic:round-close-fullscreen" className="icon" />
        </button>
      </div>

      {/* Participants Grid */}
      <div className="participants-grid">
        {sortedParticipants.map((user) => (
          <ParticipantCard
            key={user.userId}
            user={user}
            callerId={callerId}
            isUserMuted={mutedUsers[user.userId] ?? user?.isMuted}
            remoteAudioTrack={remoteAudioTracks[`user-${user.userId}`]}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <div className="controls-wrapper">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            className={`control-btn mute-mic-btn ${isMuted ? "active" : ""}`}
          >
            <Icon
              icon={isMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"}
              className="icon"
            />
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
            className={`control-btn screenshare-btn ${isScreenSharing ? "active" : ""}`}
          >
            <Icon
              icon={isScreenSharing ? "mdi:monitor-off" : "mdi:monitor-share"}
              className="icon white-icon"
            />
          </button>

          {/* Hang Up */}
          <button
            onClick={handleHangUp}
            title="Hang Up"
            className="control-btn hangup-btn"
          >
            <Icon icon="mdi:phone-hangup" className="icon white-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptedGroupCall;
