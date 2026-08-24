import "../../style/messages.css";

export default function HireOfferCard({
  offer,
  currentUserId,
  userRole,
  onAccept,
  onReject,
  onRate,
}) {
  const isClient =
    userRole === "client";

  const isWorker =
    userRole === "worker";

  const isPending =
    offer.offerStatus === "Pending" ||
    offer.offerStatus === 0;

  const isAccepted =
    offer.offerStatus === "Accepted" ||
    offer.offerStatus === 1;

  const isRejected =
    offer.offerStatus === "Rejected" ||
    offer.offerStatus === 2;

  /*
   * Hire offers are created by the client.
   * Therefore the client owns/sent the offer.
   *
   * Depending on the exact DTO returned by the API,
   * SenderId or HireOffer_WorkerId may be present.
   */
  const isMine =
    offer.senderId === currentUserId ||
    (
      isClient &&
      offer.hireOfferWorkerId !== currentUserId
    );

  return (
    <div className="hire-offer-card">

      {/* Header */}
      <div className="hire-offer-header">

        <div className="d-flex align-items-center gap-2">
          <div className="hire-offer-icon">
            <i className="bi bi-briefcase-fill" />
          </div>

          <div>
            <div className="hire-offer-label">
              Hire Offer
            </div>

            <div className="hire-offer-subtitle">
              {isMine
                ? "Offer sent"
                : "Offer received"}
            </div>
          </div>
        </div>

        <span className="hire-offer-id">
          #{offer.hireOfferId}
        </span>

      </div>

      {/* Body */}
      <div className="hire-offer-body">

        <h6 className="hire-offer-title">
          {offer.offerTitle}
        </h6>

        <div className="hire-offer-price">
          ${Number(offer.offerPrice).toFixed(2)}
        </div>

        {offer.scopeTerms && (
          <p className="hire-offer-scope">
            {offer.scopeTerms}
          </p>
        )}

        {/* Pending */}
        {isPending && (
          <div className="hire-offer-status pending">
            <i className="bi bi-clock me-1" />
            Pending
          </div>
        )}

        {/* Accepted */}
        {isAccepted && (
          <div className="hire-offer-status accepted">
            <i className="bi bi-check-circle-fill me-1" />
            Accepted
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div className="hire-offer-status rejected">
            <i className="bi bi-x-circle-fill me-1" />
            Rejected
          </div>
        )}

        {/* Worker actions */}
        {isWorker && !isMine && isPending && (
          <div className="hire-offer-actions">

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() =>
                onReject(offer.hireOfferId)
              }
            >
              <i className="bi bi-x-lg me-1" />
              Reject
            </button>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() =>
                onAccept(offer.hireOfferId)
              }
            >
              <i className="bi bi-check-lg me-1" />
              Accept
            </button>

          </div>
        )}

        {/* Accepted hire → rating */}
        {isAccepted && (
          <button
            type="button"
            className="btn btn-sm hire-rate-button"
            onClick={() =>
              onRate(offer.hireOfferId)
            }
          >
            <i className="bi bi-star-fill me-1" />
            Rate
          </button>
        )}

      </div>
    </div>
  );
}