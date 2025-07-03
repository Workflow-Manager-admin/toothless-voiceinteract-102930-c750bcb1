import React from "react";

// PUBLIC_INTERFACE
export default function ChatMessage({ role, text, isSpeaking }) {
  /**
   * One message block in the chat interface.
   * @param {string} role - "user" or "ai"
   * @param {string} text
   * @param {boolean} isSpeaking - if AI is currently talking this message out
   */
  return (
    <div className={`chat-message ${role} ${isSpeaking ? "speaking" : ""}`}>
      <div className="chat-bubble">
        {role === "user" ? (
          <span className="chat-avatar">🧑‍💬</span>
        ) : (
          <span className="chat-avatar">🐉</span>
        )}
        <span className="chat-text">{text}</span>
      </div>
      {role === "ai" && isSpeaking && (
        <span className="speaking-indicator" aria-label="Speaking">🔈</span>
      )}
    </div>
  );
}
