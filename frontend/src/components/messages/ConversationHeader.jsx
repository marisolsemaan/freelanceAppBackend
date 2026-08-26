import { useState,} from "react";

import { getAuth } from "../../utils/jwtStorage";

import HireOfferModal from "./HireOfferModal";


export default function ConversationHeader({
  conversation,
  onBack,
  onOfferCreated,
  onRate,
  canRate,
}) {
  const [showHireModal, setShowHireModal] = useState(false);


  const auth = getAuth();

  const currentUserId =
    auth?.userId ||
    auth?.id ||
    auth?.user?.userId;


  const isCurrentUserClient =
    Number(currentUserId) ===
    Number(conversation.clientId);


  const otherUserName =
    isCurrentUserClient
      ? conversation.workerFullName
      : conversation.clientFullName;


  const otherUserRating =
    isCurrentUserClient
      ? conversation.workerAvgRating
      : conversation.clientAvgRating;


  const otherUserRole =
    isCurrentUserClient
      ? "Worker"
      : "Client";


  return (
    <>
      <div className="conversation-header">

        <button
          type="button"
          className="conversation-back-btn"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left"></i>
        </button>


        <div className="conversation-header-avatar">
          {otherUserName
            ?.charAt(0)
            ?.toUpperCase()}
        </div>


        <div className="conversation-header-info">

          <div className="conversation-header-name">
            {otherUserName}
          </div>


          <div className="conversation-header-meta">

            <span>
              {otherUserRole}
            </span>


            {otherUserRating > 0 && (
              <>
                <span>·</span>

                <span>
                  <i className="bi bi-star-fill"></i>
                  {" "}
                  {Number(
                    otherUserRating
                  ).toFixed(1)}
                </span>
              </>
            )}

          </div>

        </div>


        <div className="conversation-header-actions">

          {isCurrentUserClient && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 fw-semibold flex-shrink-0"
              onClick={() =>
                setShowHireModal(true)
              }
            >
              <i className="bi bi-briefcase"></i>

              <span className="d-none d-sm-inline">
                Hire
              </span>
            </button>
          )}

          {canRate && (<button type="button" className="btn btn-outline-primary btn-sm" onClick={onRate}>
              <i className="bi bi-star me-1"></i>
              <span className="d-none d-sm-inline">Rate</span>
          </button>)}


          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
          >
            View Profile
          </button>

        </div>

      </div>


      {showHireModal && (
        <HireOfferModal
          conversationId={
            conversation.conversationId
          }
          onClose={() =>
            setShowHireModal(false)
          }
          onOfferCreated={
            onOfferCreated
          }
        />
      )}

    </>
  );
}