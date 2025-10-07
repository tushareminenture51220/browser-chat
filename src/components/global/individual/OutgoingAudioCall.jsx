"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import "./OutgoingAudioCall.css";

const OutgoingAudioCall = ({
  receiverName,
  receiverImage,
  callStatus,
  handleHangUp,
  startScreenShare,
  stopScreenShare,
  toggleMute,
  isMuted,
}) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const { isRemoteSharing } = useSelector((state) => state.call);

  // ✅ Call duration tracking
  useEffect(() => {
    let timer;
    if (callStatus === "accepted") {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // ✅ Format duration (mm:ss)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="call-popup-container">
      <div className="call-popup">
        <div className="call-header">
          {/* Receiver Info */}
          <div className="caller-info">
            <img
              src={
                receiverImage
                  ? `https://eminenture.live/public/chatting-files/${receiverImage}`
                  : "/default-avatar.png"
              }
              alt="Receiver"
              className="receiver-avatar"
            />
            <div className="caller-text">
              <p className="receiver-name">{receiverName}</p>
              <p className="receiver-status">
                {callStatus === "accepted"
                  ? `In Call • ${formatDuration(callDuration)}`
                  : "Calling..."}
              </p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="call-controls">
            {callStatus === "accepted" && (
              <>
                <button
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  className="control-btn mute-btn"
                >
                  <Icon
                    icon={
                      isMuted ? "ic:baseline-mic-off" : "ic:baseline-mic"
                    }
                  />
                </button>

                {isScreenSharing ? (
                  <button
                    onClick={() => {
                      stopScreenShare();
                      setIsScreenSharing(false);
                    }}
                    title="Stop Sharing"
                    className="control-btn stop-share-btn"
                  >
                    <Icon icon="mdi:stop" />
                  </button>
                ) : (
                  !isRemoteSharing && (
                    <button
                      onClick={() => {
                        startScreenShare();
                        setIsScreenSharing(true);
                      }}
                      title="Share Screen"
                      className="control-btn share-btn"
                    >
                      <Icon icon="mdi:monitor-share" />
                    </button>
                  )
                )}
              </>
            )}

            <button
              onClick={handleHangUp}
              title="Hang Up"
              className="control-btn hangup-btn"
            >
              <Icon icon="mdi:phone-hangup" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutgoingAudioCall;
