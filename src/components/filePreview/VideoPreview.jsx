"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import "./videoPreview.css";

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoPreview = ({ attachment_name, is_deleted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef(null);

  if (
    is_deleted ||
    !attachment_name ||
    !/\.(mp4|mov|avi|mkv|webm|flv|wmv|mpeg|mpg|3gp|m4v|ogv|ts|f4v)$/i.test(
      attachment_name
    )
  ) {
    return null;
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / dur) * 100);
  };

  const handleProgressChange = (e) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = (value / 100) * videoRef.current.duration;
    }
    setProgress(value);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleMaximize = () => {
    const videoUrl = `https://eminenture.live/public/chatting-files/${attachment_name}`;
    window.open(videoUrl, "_blank");
  };

  useEffect(() => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
  }, [videoRef.current?.duration]);

  return (
    <div className="video-preview-container">
      {/* Video element */}
      <video
        ref={videoRef}
        src={`https://eminenture.live/public/chatting-files/${attachment_name}`}
        className="video-preview"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
      />

      {/* Maximize Button */}
      <button className="video-maximize-btn" onClick={handleMaximize}>
        <Maximize2 size={18} />
      </button>

      {/* Overlay Play/Pause */}
      <div className="video-play-overlay" onClick={togglePlay}>
        {isPlaying ? <Pause className="video-play-icon" /> : <Play className="video-play-icon" />}
      </div>

      {/* Bottom Control Bar */}
      <div className="video-control-bar">
        {/* Play/Pause */}
        <button className="control-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleProgressChange}
          className="progress-bar"
        />

        {/* Time */}
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume Toggle */}
        <button className="control-btn" onClick={toggleMute}>
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export default VideoPreview;
