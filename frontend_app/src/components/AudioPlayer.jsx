import React from "react";

// PUBLIC_INTERFACE
export default function AudioPlayer({ audioUrl, onEnded }) {
  /**
   * Plays a given audio URL after receiving from TTS
   * @param {string} audioUrl - URL or blob for playing audio
   * @param {function} onEnded - callback when playback finishes
   */
  if (!audioUrl) return null;
  return (
    <audio
      src={audioUrl}
      autoPlay
      controls
      onEnded={onEnded}
      className="audio-player"
      style={{ width: "100%", marginTop: 8 }}
      aria-label="AI voice playback"
    >
      {"Your browser doesn't support the audio element."}
    </audio>
  );
}
