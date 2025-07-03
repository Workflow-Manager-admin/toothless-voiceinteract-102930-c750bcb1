import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

// PUBLIC_INTERFACE
export default function ChatBox({ messages, speakingIdx }) {
  /**
   * Box listing all chat messages in scrollable view.
   * @param {Array<{role: string, text: string}>} messages - chat log
   * @param {number} speakingIdx - index of ai message currently speaking
   */
  const containerRef = useRef(null);

  // Scroll to bottom when a new message appears
  useEffect(() => {
    const ref = containerRef.current;
    if (ref) ref.scrollTop = ref.scrollHeight;
  }, [messages]);

  return (
    <div className="chatbox-scroll" ref={containerRef}>
      {messages.map((msg, idx) => (
        <ChatMessage
          key={idx}
          role={msg.role}
          text={msg.text}
          isSpeaking={msg.role === "ai" && idx === speakingIdx}
        />
      ))}
    </div>
  );
}
