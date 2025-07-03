import React, { useState } from "react";
import "./App.css";
import ToothlessModel from "./components/ToothlessModel";
import VoiceInput from "./components/VoiceInput";
import AudioPlayer from "./components/AudioPlayer";
import ChatBox from "./components/ChatBox";
import TextInput from "./components/TextInput";
import axios from "axios";

/**
 * Toothless 3D .glb asset (local in /public/models/toothless.glb).
 * For vite/cra/react-scripts, public/ is mounting point for static.
 * Accessible in production and dev as "/models/toothless.glb"
 */
const TOOTHLESS_MODEL_URL = "/models/toothless.glb";

// BACKEND endpoints (configurable with .env REACT_APP_API_BASE; fallback to localhost)
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://vscode-internal-6807-beta.beta01.cloud.kavia.ai:3001");

// Use new unified endpoints
const CHAT_API = `${API_BASE}/chat`;   // Receives prompt, returns AI response
const SPEAK_API = `${API_BASE}/speak`; // Receives text, returns TTS audio

const THEME = {
  accent: "#e09e38",
  primary: "#282c34",
  secondary: "#6d8dad",
};

function useThemeCSS() {
  // PUBLIC_INTERFACE
  /**
   * Applies base theme variables to documentElement (css vars for primary colors)
   */
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--bg-primary", "#fff");
    r.style.setProperty("--bg-secondary", "#f8f9fa");
    r.style.setProperty("--text-primary", THEME.primary);
    r.style.setProperty("--brand-accent", THEME.accent);
    r.style.setProperty("--brand-secondary", THEME.secondary);
    r.style.setProperty("--button-bg", THEME.accent);
    r.style.setProperty("--button-text", "#fff");
    r.style.setProperty("--bubble-bg-ai", THEME.secondary);
    r.style.setProperty("--bubble-bg-user", "#f3f0e8");
    r.style.setProperty("--bubble-text-ai", "#fff");
    r.style.setProperty("--bubble-text-user", "#181818");
  }, []);
}

// PUBLIC_INTERFACE
/**
 * Main app entrypoint: handles state, model loading, chat, TTS playback, and all interactions.
 */
function App() {
  useThemeCSS();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Toothless. Ask me anything!" },
  ]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [aiSpeakingIdx, setAISpeakingIdx] = useState(null); // index in messages
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  /**
   * Sends the user's message to backend, gets AI reply, updates chat, and plays TTS.
   * Uses /chat endpoint for chat and /speak endpoint for TTS, with .env-configurable base.
   */
  async function sendMessage(msgText, isVoice = false) {
    setLoading(true);
    setMessages(msgs => [...msgs, { role: "user", text: msgText }]);
    // Call /chat backend endpoint for AI reply
    let aiText = "";
    let aiMsgIdx = null;
    try {
      const response = await axios.post(
        CHAT_API,
        {
          prompt: msgText,
          chat_history: [
            ...messages,
            { role: "user", text: msgText }
          ].filter(m => m.role && m.text && m.text.trim() !== "")
            .map(m => ({
              role: m.role === "ai" ? "assistant" : m.role, // 'user' or 'assistant'
              content: m.text
            }))
        }
      );
      aiText = response?.data?.reply || "Sorry, Toothless couldn't reply.";
    } catch (e) {
      aiText = "Network error: can't reach Toothless!";
    }

    aiMsgIdx = messages.length + 1;
    setMessages(msgs => [...msgs, { role: "ai", text: aiText }]);
    setAISpeakingIdx(aiMsgIdx);

    // Send AI reply to backend /speak endpoint for TTS (get audio, play)
    let ttsAudioUrl = "";
    try {
      const ttsRes = await axios.post(
        SPEAK_API,
        { text: aiText },
        { responseType: "blob" }
      );
      ttsAudioUrl = URL.createObjectURL(ttsRes.data);
    } catch (e) {
      ttsAudioUrl = "";
    }
    setAudioUrl(ttsAudioUrl || null);
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  function handleVoiceInput(transcript) {
    sendMessage(transcript, true);
  }

  // PUBLIC_INTERFACE
  function handleTextInput(text) {
    sendMessage(text, false);
  }

  // PUBLIC_INTERFACE
  function handleAudioEnded() {
    setAISpeakingIdx(null);
    setAudioUrl(null);
  }

  return (
    <div className="approot">
      <header className="main-header">
        <span className="app-title">
          <span role="img" aria-label="dragon" className="title-dragon">🐉</span>
          Toothless Voice Chat
        </span>
      </header>
      <main className="main-content">
        <div className="model-panel">
          <ToothlessModel
            modelUrl={TOOTHLESS_MODEL_URL}
            isSpeaking={typeof aiSpeakingIdx === "number" && audioUrl}
          />
        </div>
        <section className="chat-section">
          <ChatBox messages={messages} speakingIdx={aiSpeakingIdx} />
          <AudioPlayer audioUrl={audioUrl} onEnded={handleAudioEnded} />
          <div className="chat-controls">
            <VoiceInput onTranscribe={handleVoiceInput} isLoading={loading} />
            <TextInput
              onSend={handleTextInput}
              disabled={loading}
              placeholder="Type a message…"
            />
          </div>
        </section>
      </main>
      <footer className="footer">
        <span>
          Powered by Gemini Pro & ElevenLabs &nbsp;|&nbsp; <a href="https://github.com">Source</a>
        </span>
      </footer>
    </div>
  );
}

export default App;
