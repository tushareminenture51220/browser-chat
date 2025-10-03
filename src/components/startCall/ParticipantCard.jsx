"use client";

import React from "react";
import { Icon } from "@iconify/react";
import "./ParticipantCard.css";
import { useVoiceLevel } from "../../../customHooks/useVoiceLevel";

const ParticipantCard = ({
  user,
  callerId,
  isUserMuted,
  remoteAudioTrack,
  variant = "grid",
}) => {
  const volume = useVoiceLevel(remoteAudioTrack);
  const effectiveVolume = isUserMuted ? 0 : volume;
  const isLeader = user.userId === callerId;

  return (
    <div
      className={`participant-card ${variant} ${isLeader ? "leader" : ""}`}
      style={{
        boxShadow: isLeader
          ? `0 10px 30px rgba(255,215,0,0.2), 0 4px 12px rgba(255,215,0,0.1)`
          : `0 10px 30px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      {/* Leader crown */}
      {isLeader && variant === "grid" && (
        <Icon icon="mdi:crown" className="crown-icon" />
      )}

      {/* Avatar with rings */}
      <div className={`avatar-wrapper ${variant}`}>
        {[...Array(3)].map((_, idx) => (
          <span
            key={idx}
            className="ring"
            style={{
              transform: `scale(${1 + effectiveVolume * (0.5 + idx * 0.3)})`,
              animation:
                effectiveVolume > 0
                  ? `pulseRing 1.5s ${idx * 0.2}s infinite`
                  : "none",
            }}
          />
        ))}

        <div className="avatar">
          <img
            src={
              user.image
                && `https://eminenture.live/public/chatting-files/${user.image}`
            }
            alt={user.first_name || ""}
          />
        </div>
      </div>

      {/* Name + mic in sidebar layout */}
      <div className={`user-info ${variant}`}>
        <p className="user-name">{user.first_name}</p>
        {variant === "sidebar" && (
          <Icon
            icon={isUserMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"}
            className={`mic-icon ${isUserMuted ? "muted" : "unmuted"}`}
          />
        )}
      </div>

      {/* Mic icon overlay (grid only) */}
      {variant === "grid" && (
        <div className="mic-overlay">
          <Icon
            icon={isUserMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"}
            className={`mic-icon ${isUserMuted ? "muted" : "unmuted"}`}
          />
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;
