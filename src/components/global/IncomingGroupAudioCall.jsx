
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import AcceptedGroupCall from "../startCall/AcceptedGroupCall";
import "./IncomingGroupAudioCall.css";

const IncomingGroupAudioCall = ({
  myUserId,
  isCallActive,
  handleAccept,
  handleReject,
  handleHangUp,
  startScreenShare,
  stopScreenShare,
  toggleMute,
  isMuted,
  formatDuration,
  callerId,
  remoteAudioTracks,
}) => {
  const {
    isIncomingCall,
    callData,
    groupId: topGroupId,
    groupName: topGroupName,
    groupImage: topGroupImage,
    activeGroupParticipants,
    isScreenSharing,
    mutedUsers,
  } = useSelector((state) => state.call);

  const groupName = topGroupName || callData?.groupName;
  const groupImage = topGroupImage || callData?.groupImage;

  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [statusText, setStatusText] = useState("Incoming Call...");

  const intervalRef = useRef(null);

  // Browser unload handling
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

  // Start call timer
  useEffect(() => {
    if (isCallActive) {
      setStatusText("In Call");
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

  if (!isIncomingCall) return null;

  // Render AcceptedGroupCall when active
  if (isCallActive) {
    return (
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
    );
  }

  // Render incoming call popup
  return (
    <div className={`igac-container ${isMinimized ? "igac-minimized" : "igac-default"}`}>
      <div className="igac-card">
        <div className="igac-info">
          <img
            src={groupImage ? `https://eminenture.live/public/chatting-files/${groupImage}` : ""}
            alt="Group"
            width={48}
            height={48}
            className="igac-group-image"
          />
          <div className="igac-text">
            <p className="igac-group-name">{groupName}</p>
            <p className="igac-status">{statusText}</p>
          </div>
        </div>
        <div className="igac-actions">
          <button onClick={handleAccept} title="Accept Call" className="igac-btn-accept">
            <Icon icon="mdi:phone" />
          </button>
          <button onClick={handleReject} title="Reject Call" className="igac-btn-reject">
            <Icon icon="mdi:phone-hangup" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingGroupAudioCall;
