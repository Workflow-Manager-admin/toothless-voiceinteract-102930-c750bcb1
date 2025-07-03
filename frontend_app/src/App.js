import React, { useState } from "react";
import "./App.css";
import ToothlessModel from "./components/ToothlessModel";
import VoiceInput from "./components/VoiceInput";
import AudioPlayer from "./components/AudioPlayer";
import ChatBox from "./components/ChatBox";
import TextInput from "./components/TextInput";
import axios from "axios";

// Toothless 3D .glb asset URL (for now, use online file. Place local if available in public/)
const TOOTHLESS_MODEL_URL =
  "https://cdn.jsdelivr.net/gh/benjaminnicholasloftus/toothless-glb-sample@main/toothless.glb";

// BACKEND endpoints (change URL if using proxy or for prod)
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://vscode-internal-6807-beta.beta01.cloud.kavia.ai:3001";


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
function App() {
  useThemeCSS();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Toothless. Ask me anything!" },
  ]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [aiSpeakingIdx, setAISpeakingIdx] = useState(null); // index in messages
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  async function sendMessage(msgText, isVoice = false) {
    setLoading(true);
    setMessages(msgs => [...msgs, { role: "user", text: msgText }]);
    // Call Gemini Pro backend
    let aiText = "";
    let aiMsgIdx = null;
    try {
      const response = await axios.post(`${API_BASE}/api/ai-chat`, {
        prompt: msgText,
        chat_history: messages
          .filter(m => m.role !== "ai" || m.text.trim() !== "")
          .map(m => ({ role: m.role, content: m.text })),
      });
      aiText = response?.data?.reply || "Sorry, Toothless couldn't reply.";
    } catch (e) {
      aiText = "Network error: can't reach Toothless!";
    }
    aiMsgIdx = messages.length + 1; // after user+ previous ai msgs
    setMessages(msgs => [...msgs, { role: "ai", text: aiText }]);
    setAISpeakingIdx(aiMsgIdx);

    // Fetch TTS only for last ai message
    let ttsAudioUrl = "";
    try {
      const ttsRes = await axios.post(
        `${API_BASE}/api/tts-speak`,
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
          <ToothlessModel modelUrl={TOOTHLESS_MODEL_URL} />
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
