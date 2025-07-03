import React, { useState, useRef } from "react";

// PUBLIC_INTERFACE
export default function VoiceInput({ onTranscribe, isLoading }) {
  /**
   * Voice input button using Web Speech API (SpeechRecognition)
   * @param {function} onTranscribe - Callback receives string transcript.
   * @param {boolean} isLoading - disables button if currently processing
   */
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // PUBLIC_INTERFACE
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech Recognition API is not supported in your browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      onTranscribe(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <button
      className={`mic-btn${isListening ? " listening" : ""}`}
      onClick={handleMicClick}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop recording" : "Start recording"}
      disabled={isLoading}
      type="button"
    >
      {isListening ? (
        <span role="img" aria-label="listening" className="mic-anim">🎤</span>
      ) : (
        <span role="img" aria-label="mic">🎙</span>
      )}
      <span className="mic-label">{isListening ? "Listening..." : "Speak"}</span>
    </button>
  );
}
