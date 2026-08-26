import { timeAgo } from "../../utils/format";

export default function ConversationList({ conversations = [], selectedConversationId,  onSelect,  loading,})
{
  if (loading) {
    return (
      <div className="conversation-list-state">
        Loading conversations...
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="conversation-list-state">
        <i className="bi bi-chat-dots" />
        <p>No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const isActive =
          Number(conversation.conversationId) ===
          Number(selectedConversationId);

        return (
          <button
            key={conversation.conversationId}
            type="button"
            className={`conversation-list-item ${
              isActive ? "active" : ""
            }`}
            onClick={() =>
              onSelect(conversation.conversationId)
            }
          >
            <div className="conversation-avatar">
              {conversation.otherUserFullName
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="conversation-list-content">
              <div className="conversation-list-top">
                <strong>
                  {conversation.otherUserFullName}
                </strong>

                {conversation.lastMessageAt && (
                  <span className="conversation-time">
                    {timeAgo(
                      conversation.lastMessageAt
                    )}
                  </span>
                )}
              </div>

              <div className="conversation-list-bottom d-flex justify-content-between">
                <span className="conversation-last-message">
                  {conversation.lastMessage ||
                    "No messages yet"}
                </span>

                {Number(conversation.unreadCount) > 0 && (
                  <span className="conversation-unread">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}