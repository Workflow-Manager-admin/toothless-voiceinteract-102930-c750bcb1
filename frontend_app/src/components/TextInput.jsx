import React, { useState } from "react";

// PUBLIC_INTERFACE
export default function TextInput({ onSend, disabled, placeholder }) {
  /**
   * Fallback text manual input for chat messages
   * @param {function} onSend - callback
   * @param {boolean} disabled
   * @param {string} placeholder
   */
  const [value, setValue] = useState("");
  // PUBLIC_INTERFACE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };
  return (
    <form className="text-chat-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="text-chat-input"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => setValue(e.target.value)}
        aria-label={placeholder}
        autoComplete="off"
      />
      <button type="submit" className="btn-send" disabled={disabled || !value.trim()}>Send</button>
    </form>
  );
}
