import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import "./IncomingAudioCall.css";

const IncomingAudioCall = ({
  callerName,
  callerImage,
  isIncomingCall,
  isCallActive,
  callStatus,
  handleAccept,
  handleReject,
  handleHangUp,
  startScreenShare,
  stopScreenShare,
  setIsScreenSharing,
  toggleMute,
  isMuted,
}) => {
  const [callDuration, setCallDuration] = useState(0);

  const { isScreenSharing, isRemoteSharing } = useSelector(
    (state) => state.call
  );

  // ✅ Track call duration
  useEffect(() => {
    let timer;
    if (isCallActive && callStatus === "accepted") {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive, callStatus]);

  // ✅ Format call time (mm:ss)
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ✅ Hide if no active/incoming call
  if (!isIncomingCall && !isCallActive) return null;

  return (
    <div className="incoming-call-container">
      <div className="incoming-call-popup">
        {/* Header */}
        <div className="incoming-call-header">
          <div className="caller-info">
            <img
              src={
                callerImage
                  ? `https://eminenture.live/public/chatting-files/${callerImage}`
                  : "/default-avatar.png"
              }
              alt="Caller"
              className="caller-avatar"
            />
            <div className="caller-details">
              <p className="caller-name">{callerName}</p>
              <p className="caller-status">
                {isCallActive && callStatus === "accepted"
                  ? `In Call • ${formatTime(callDuration)}`
                  : "Incoming Call..."}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="call-controls">
            {/* Accept/Reject for Incoming */}
            {!isCallActive && isIncomingCall && callStatus === "calling" ? (
              <>
                <button
                  onClick={handleAccept}
                  title="Accept"
                  className="control-btn accept-btn"
                >
                  <Icon icon="fluent:call-16-filled" />
                </button>
                <button
                  onClick={handleReject}
                  title="Reject"
                  className="control-btn reject-btn"
                >
                  <Icon icon="mdi:phone-hangup" />
                </button>
              </>
            ) : (
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

                <button
                  onClick={handleHangUp}
                  title="Hang Up"
                  className="control-btn hangup-btn"
                >
                  <Icon icon="mdi:phone-hangup" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingAudioCall;
