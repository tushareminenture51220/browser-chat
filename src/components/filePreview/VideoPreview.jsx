"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Maximize2 } from "lucide-react";
import VideoPlayer from "../filePreview/VideoPlayer";
import "./videoPreview.css";

const VideoPreview = ({ attachment_name, is_deleted }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  if (
    is_deleted ||
    !attachment_name ||
    !/\.(mp4|mov|avi|mkv|webm|flv|wmv|mpeg|mpg|3gp|m4v|ogv|ts|f4v)$/i.test(
      attachment_name
    )
  ) {
    return null;
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-preview-container">
      <video
        src={`https://eminenture.live/public/chatting-files/${attachment_name}`}
        className="video-preview"
        onClick={() => setShowVideoModal(true)}
        onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
      />

      {/* Center Play Button */}
      <div className="video-play-overlay">
        <Icon
          icon="lucide:play-circle"
          className="video-play-icon"
          onClick={() => setShowVideoModal(true)}
        />
      </div>

      {/* Maximize Button */}
      <button
        className="video-maximize-btn"
        onClick={() => setShowVideoModal(true)}
      >
        <Maximize2 size={16} />
      </button>

      {/* Duration */}
      {videoDuration > 0 && (
        <div className="video-duration">{formatTime(videoDuration)}</div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoPlayer
          src={`https://eminenture.live/public/chatting-files/${attachment_name}`}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
};

export default VideoPreview;
