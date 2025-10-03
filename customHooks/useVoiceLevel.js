import { useEffect, useState } from "react";

export const useVoiceLevel = (audioTrack) => {
    // console.log("audiotrack", audioTrack)
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!audioTrack?.mediaStreamTrack) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStream = new MediaStream();
    mediaStream.addTrack(audioTrack.mediaStreamTrack);

    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let animationFrame;

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg / 255); // 0 to 1
      animationFrame = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      cancelAnimationFrame(animationFrame);
      audioContext.close();
    };
  }, [audioTrack]);
  // console.log("volume", volume)

  return volume;
};
