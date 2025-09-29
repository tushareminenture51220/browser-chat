"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";
import "./videoPlayer.css";

// Helper to format seconds to mm:ss
const formatTime = (seconds) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const VideoPlayer = ({ src, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
    setCurrentTime(videoRef.current.currentTime);
    setProgress(
      (videoRef.current.currentTime / videoRef.current.duration) * 100
    );
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) videoRef.current.volume = value;
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleProgressChange = (e) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current)
      videoRef.current.currentTime = (value / 100) * videoRef.current.duration;
    setProgress(value);
  };

  return (
    <div className="video-overlay">
      <div className="video-container">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          src={src}
          className="video-player"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        {/* Center Play/Pause Button */}
        {!isPlaying && (
          <div className="center-play" onClick={togglePlay}>
            <Play className="center-play-icon" />
          </div>
        )}

        {/* Controls */}
        <div className="video-controls">
          {/* Time Interval */}
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="controls-row">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Progress */}
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleProgressChange}
              className="progress-bar"
            />

            {/* Volume */}
            <button onClick={toggleMute} className="control-btn">
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="volume-bar"
            />

            {/* Maximize */}
            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="control-btn"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
