import { useState } from "react";

export default function MessageInput({ onSend, sending,}) {
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || sending) return;

    const success = await onSend(trimmedContent);

    if (success !== false) {
      setContent("");
    }
  };

  return (
    <form
      className="message-input-container"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="form-control"
        placeholder="Type a message..."
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
      />

      <button
        type="submit"
        className="btn btn-primary message-send-btn"
        disabled={!content.trim() || sending}
      >
        {sending ? (
          <span
            className="spinner-border spinner-border-sm"
          />
        ) : (
          <i className="bi bi-send-fill"></i>
        )}
      </button>
    </form>
  );
}