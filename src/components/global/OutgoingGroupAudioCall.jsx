"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import AcceptedGroupCall from "../startCall/AcceptedGroupCall";
import "./OutgoingGroupAudioCall.css";

const OutgoingGroupAudioCall = ({
  myUserId,
  isCallActive,
  handleHangUp,
  startScreenShare,
  stopScreenShare,
  remoteScreenTrack,
  toggleMute,
  isMuted,
  formatDuration,
  callerId,
  remoteAudioTracks,
}) => {
  const {
    isOutgoingCall,
    callData,
    groupId: topGroupId,
    groupName: topGroupName,
    groupImage: topGroupImage,
    activeGroupParticipants,
    isScreenSharing,
    mutedUsers,
  } = useSelector((state) => state.call);

  const groupId = topGroupId || callData?.groupId;
  const groupName = topGroupName || callData?.groupName;
  const groupImage = topGroupImage || callData?.groupImage;

  const [statusText, setStatusText] = useState("Calling...");
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    const beforeUnloadHandler = (e) => {
      if (isCallActive) {
        e.preventDefault();
        e.returnValue = "Warning: Call will be disconnected. Are you sure?";
        return e.returnValue;
      }
    };

    const unloadHandler = () => {
      if (isCallActive) {
        handleHangUp(myUserId);
      }
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("unload", unloadHandler);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("unload", unloadHandler);
    };
  }, [isCallActive, myUserId]);

  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCallActive]);

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  if (!isOutgoingCall) return null;

  return (
    <div
      className={`ogac-container ${
        isMinimized
          ? "ogac-minimized"
          : isCallActive
          ? "ogac-fullscreen"
          : "ogac-default"
      }`}
    >
      {isMinimized ? (
        <div className="ogac-minimized-card">
          <img
            src={
              groupImage
                ? `https://api.eminenture.cloud/uploads/files/${groupImage}`
                : ""
            }
            alt="Group"
            width={36}
            height={36}
            className="ogac-group-image"
          />

          <div className="ogac-group-name">{groupName}</div>

          <button
            onClick={() => setIsMinimized(false)}
            title="Maximize"
            className="ogac-btn-maximize"
          >
            <Icon icon="ic:round-open-in-full" />
          </button>

          <button onClick={handleHangUp} title="Hang Up" className="ogac-btn-hangup">
            <Icon icon="mdi:phone-hangup" />
          </button>
        </div>
      ) : isCallActive ? (
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
      ) : (
        <div className="ogac-outgoing-card">
          <div className="ogac-outgoing-header">
            <img
              src={
                groupImage
                  ? `https://api.eminenture.cloud/uploads/files/${groupImage}`
                  : ""
              }
              alt="Group"
              width={48}
              height={48}
              className="ogac-group-image-lg"
            />
            <div className="ogac-outgoing-info">
              <p className="ogac-group-name-lg">{groupName}</p>
              <p className="ogac-status-text">{statusText}</p>
            </div>
          </div>

          <div className="ogac-outgoing-actions">
            <button onClick={handleHangUp} title="Cancel Call" className="ogac-btn-hangup-lg">
              <Icon icon="mdi:phone-hangup" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutgoingGroupAudioCall;
