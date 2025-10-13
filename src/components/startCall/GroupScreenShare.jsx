"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import ParticipantCard from "./ParticipantCard";
import "./GroupScreenShare.css";
import ReactDOM from "react-dom";

const GroupScreenShare = ({
  remoteScreenTrack,
  handleHangUp,
  toggleMute,
  isMuted,
  callerId,
  remoteAudioTracks,
  callType = "groupShare",
}) => {
  const remoteScreenRef = useRef(null);
  const nodeRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const { activeGroupParticipants, mutedUsers } = useSelector(
    (state) => state.call
  );

  // Attach remote screen track
  useEffect(() => {
    if (remoteScreenTrack && remoteScreenRef.current) {
      remoteScreenTrack.attach(remoteScreenRef.current);
      return () => remoteScreenTrack.detach(remoteScreenRef.current);
    }
  }, [remoteScreenTrack]);

  const sortedParticipants = useMemo(() => {
    return [...activeGroupParticipants].sort((a, b) => {
      if (a.userId === callerId) return -1;
      if (b.userId === callerId) return 1;
      return 0;
    });
  }, [activeGroupParticipants, callerId]);

  const popup = (
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

      {isMinimized && (
        <div ref={nodeRef} className="mini-container">
          <div className="mini-controls">
            <button
              onClick={() => setIsMinimized(false)}
              className="maximize-btn"
              title="Maximize"
            >
              <Icon icon="ic:round-open-in-full" className="icon-sm" />
            </button>
            <button
              onClick={handleHangUp}
              className="hangup-mini-btn"
              title="Hang Up"
            >
              <Icon icon="mdi:phone-hangup" className="icon-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls — always visible */}
      <div className="controls-container">
        <div className="controls-box">
          {/* Mic Button */}
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

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            title="Minimize"
            className="minimizing-btn"
          >
            <Icon icon="ic:round-close-fullscreen" className="icon-md" />
          </button>

          {/* Hang Up Button */}
          <button onClick={handleHangUp} title="Hang Up" className="hangup-btn">
            <Icon icon="mdi:phone-hangup" className="icon-md" />
          </button>
        </div>
      </div>

      {/* Participants Sidebar — only for group calls */}
      {callType !== "oneOnone" && (
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

  return ReactDOM.createPortal(popup, document.body);
};

export default GroupScreenShare;
