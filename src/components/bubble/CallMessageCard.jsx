import React, { useState, useEffect, useRef } from "react";
import { Phone, Zap } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import "./CallMessageCard.css";
import { useSocket } from "../../../context/SocketContext";
import {
  clearCallState,
  setActiveGroupParticipants,
  setCallActive,
  setCallStatus,
  setIsRemoteSharing,
  setMeetingStart,
  setMutedUsers,
} from "../../../redux/audioVideoCall/callSlice";
import Video from "twilio-video";
import { toast } from "react-toastify";
import axios from "axios";
import { useCallFunctions } from "../../../context/CallFunctionContext";

const CallMessageCard = ({ msg }) => {
  const { roomName, meeting_interval, meeting_ended, mode } = msg;
  const { meetingStart, isCallActive } = useSelector((state) => state.call);
  const { loggedInUser } = useSelector((state) => state.usersData);
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteScreenTrack, setRemoteScreenTrack] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [elapsed, setElapsed] = useState("0:00");

  const audioContainerRef = useRef(null);
  const { handleRejoinRef } = useCallFunctions();
  const dispatch = useDispatch();
  const socket = useSocket();
  // Animate mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Run timer when call is live
  useEffect(() => {
    let intervalId;
    if (meetingStart && !meeting_ended) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - meetingStart) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [meetingStart, meeting_ended]);

  const handleJoinClick = () => {
    if (handleRejoinRef?.current && roomName) {
      handleRejoinRef.current(roomName, msg.group_id);
    } else {
      console.warn("handleRejoin not available or roomName missing");
    }
  };

  return (
    <div className="call-message-wrapper">
      <div
        className={`call-message-card ${isVisible ? "visible" : ""} ${
          isHovered ? "hovered" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="card-header">
          <div className="header-left">
            <div
              className={`icon-wrapper ${
                mode === "audio" ? "audio-bg" : "video-bg"
              } ${isHovered ? "pulse" : ""}`}
            >
              {mode === "audio" ? (
                <Phone size={20} className="audio-icon" />
              ) : (
                <Phone size={20} className="video-icon" />
              )}
            </div>
            <span className="call-title">{mode} call</span>
          </div>
        </div>

        {/* Room info */}
        <div className="room-info">
          {roomName && (
            <div className="room-line">
              <Zap size={16} className="zap-icon" />
              {/* <span className="room-label">Room:</span> */}
              <span className="room-name">{roomName}</span>
            </div>
          )}
        </div>

        {/* Join Meeting button */}
        {roomName && !meeting_ended && (
          <button
            onClick={handleJoinClick}
            className={`join-btn ${
              mode === "audio" ? "audio-btn" : "video-btn"
            } ${isHovered ? "btn-hover" : ""}`}
          >
            <span>Join Meeting</span>
            <svg
              className={`arrow-icon ${isHovered ? "arrow-hover" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        )}

        {/* Footer */}
        {meeting_ended && (
          <div className="meeting-ended">
            <span>Meeting has ended</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallMessageCard;
