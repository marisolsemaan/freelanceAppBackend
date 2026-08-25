import { getAuth } from "../../utils/jwtStorage";

export default function ConversationHeader({conversation, onBack,}) {
  const auth = getAuth();

  const currentUserId =
    auth?.userId ||
    auth?.id ||
    auth?.user?.userId;

  const isCurrentUserClient =
    Number(currentUserId) ===
    Number(conversation.clientId);

  const otherUserName = isCurrentUserClient
    ? conversation.workerFullName
    : conversation.clientFullName;

  const otherUserRating = isCurrentUserClient
    ? conversation.workerAvgRating
    : conversation.clientAvgRating;

  const otherUserRole = isCurrentUserClient
    ? "Worker"
    : "Client";

  return (
    <div className="conversation-header">
      <button
        type="button"
        className="conversation-back-btn"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="conversation-header-avatar">
        {otherUserName?.charAt(0)?.toUpperCase()}
      </div>

      <div className="conversation-header-info">
        <div className="conversation-header-name">
          {otherUserName}
        </div>

        <div className="conversation-header-meta">
          <span>{otherUserRole}</span>

          {otherUserRating > 0 && (
            <>
              <span>·</span>

              <span>
                <i className="bi bi-star-fill"></i>
                {" "}
                {Number(otherUserRating).toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
      >
        View Profile
      </button>
    </div>
  );
}