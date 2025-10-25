"use client";
import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import "./AudioPlayer.css";

const AudioPlayer = ({ id, attachment_name }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <div className="audio-player">
      <button onClick={togglePlay} className="play-button">
        {isPlaying ? (
          <Icon icon="lucide:pause" className="icon" />
        ) : (
          <Icon icon="lucide:play" className="icon" />
        )}
      </button>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        id={`audio-${id}`}
        src={`https://api.eminenture.cloud/uploads/files/${attachment_name}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)} // reset when song ends
        className="hidden-audio"
      />
    </div>
  );
};

export default AudioPlayer;
