import { getAuth } from "../../utils/jwtStorage";

export default function MessageBubble({ item }) {
  const auth = getAuth();

  const currentUserId =
    auth?.userId ||
    auth?.id ||
    auth?.user?.userId;

  const isMine =
    Number(item.message.senderId) ===
    Number(currentUserId);

  return (
    <div
      className={`message-row ${
        isMine ? "message-row-me" : "message-row-them"
      }`}
    >
      <div className="message-content-wrapper">
        <div
          className={`message-bubble ${
            isMine
              ? "message-bubble-me"
              : "message-bubble-them"
          }`}
        >
          {item.message.content}
        </div>

        <div
          className={`message-time ${
            isMine ? "text-end" : ""
          }`}
        >
          {new Date(item.createdAt).toLocaleTimeString(
            [],
            {
              hour: "numeric",
              minute: "2-digit",
            }
          )}
        </div>
      </div>
    </div>
  );
} 