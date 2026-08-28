import {useEffect, useState,} from "react";

import { getAuth } from "../../utils/jwtStorage";

import {   updateHireOfferStatus, completeHireOffer,createReview,} from "../../services/conversationService";

import RatingModal from "../rating/RatingModal";

export default function HireOfferCard({ item, onOfferUpdated, conversation,}) {
  const offer = item.hireOffer;

  const auth = getAuth();

  const currentUserId = auth?.userId 

  const isCurrentUserClient =
    Number(currentUserId) ===
    Number(conversation.clientId);

  const isCurrentUserWorker =
    Number(currentUserId) ===
    Number(conversation.workerId);

  const [updating, setUpdating] =useState(false);

  const [error, setError] =useState("");

  const [showRatingModal, setShowRatingModal] = useState(false);

  const [submittingReview, setSubmittingReview] = useState(false);

  const [hasReviewed, setHasReviewed] = useState( Boolean(offer?.hasCurrentUserReviewed) );

  useEffect(()=>{
    if (offer?.hasCurrentUserReviewed== true){
      setHasReviewed(true);
    }
  }, [offer?.hasCurrentUserReviewed]);

  
  if (!offer) {
    return null;
  }

  const offerStatus = String(offer.offerStatus || "") .trim() .toLowerCase(); 
  const isPending = offerStatus === "pending";
  const isAccepted = offerStatus === "accepted";
  const isRejected = offerStatus === "rejected";
  const isCompleted = offerStatus === "completed"; 
  const statusMap = { 
    pending: { label: "Pending", icon: "bi-hourglass-split", className: "pending", },
    accepted: { label: "Accepted", icon: "bi-check-circle-fill", className: "accepted", }, 
    rejected: { label: "Rejected", icon: "bi-x-circle-fill", className: "rejected", }, 
    completed: { label: "Completed", icon: "bi-check-circle-fill", className: "completed",},};

  const status = statusMap[offerStatus] || statusMap.pending;

  console.log("HIRE OFFER DEBUG", {
    currentUserId,
    clientId: conversation.clientId,
    workerId: conversation.workerId,
    offerStatus: offer.offerStatus,
    isCurrentUserClient,
    isCurrentUserWorker,
  });

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");

      const response =
        await updateHireOfferStatus(
          offer.hireOfferId,
          newStatus
        );

      if (!response.success) {
        setError(
          response.message ||
          "Failed to update hire offer."
        );

        return;
      }

      onOfferUpdated?.(
        response.data
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update hire offer."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteOffer = async () => {
    try {
      setUpdating(true);
      setError("");

      const response =
        await completeHireOffer(
          offer.hireOfferId
        );

      if (!response.success) {
        setError(
          response.message ||
          "Failed to complete this hire offer."
        );

        return;
      }

      onOfferUpdated?.(response.data);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to complete this hire offer."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitReview = async ({ rating, comment,}) => {
    try {
      setSubmittingReview(true);
      setError("");

      const response =
        await createReview({
          Review_HireOfferId:
            offer.hireOfferId,

          Review_Rating:
            rating,

          Review_Comment:
            comment,
        });

      if (!response.success) {
        setError(
          response.message ||
          `You already rated "${offer.offerTitle}".`
        );

        return false;
      }
      setHasReviewed(true);
      setShowRatingModal(false);

      await onOfferUpdated?.();

      return true;

    } catch (error) {
      const message =
        error.response?.data?.message;

      setError(
        message ||
        `Unable to submit your review for "${offer.offerTitle}".`
      );

      return false;

    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="hire-offer-timeline-wrapper">

      <div className="hire-offer-card">

        <div className="hire-offer-card-header">

          <div className="hire-offer-card-icon">
            <i className="bi bi-briefcase-fill"></i>
          </div>

          <div>
            <div className="hire-offer-card-label">
              Hire Offer
            </div>

            <div className="hire-offer-card-date">
              {new Date(
                offer.createdAt
              ).toLocaleString()}
            </div>
          </div>

        </div>


        <div className="hire-offer-card-body">

          <h6 className="hire-offer-card-title">
            {offer.offerTitle}
          </h6>


          <div className="hire-offer-price">
            <span>
              Agreed Price
            </span>

            <strong>
              ${Number(
                offer.offerPrice
              ).toFixed(2)}
            </strong>
          </div>


          {offer.scopeTerms && (
            <div className="hire-offer-scope">

              <span className="hire-offer-scope-label">
                Scope / Terms
              </span>

              <p>
                {offer.scopeTerms}
              </p>

            </div>
          )}

        </div>


      <div className="hire-offer-card-footer">

        {isPending && (
          <>
            {isCurrentUserWorker ? (
              <div className="hire-offer-actions">

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={updating}
                  onClick={() =>
                    handleUpdateStatus(2)
                  }
                >
                  Reject
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={updating}
                  onClick={() =>
                    handleUpdateStatus(1)
                  }
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Accept Offer
                    </>
                  )}
                </button>

              </div>
            ) : (
              <div className="hire-offer-client-pending">
                <i className="bi bi-hourglass-split"></i>
                Waiting for worker response
              </div>
            )}
          </>
        )}


        {isAccepted && (
          <div className="hire-offer-actions">

            {isCurrentUserClient ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={updating}
                onClick={handleCompleteOffer}
              >
                {updating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i>
                    Mark as Complete
                  </>
                )}
              </button>
            ) : (
              <div className="hire-offer-status accepted">
                <i className="bi bi-briefcase-check-fill"></i>
                Job in progress
              </div>
            )}

          </div>
        )}


        {isRejected && (
          <div className="hire-offer-status rejected">
            <i className="bi bi-x-circle-fill"></i>
            Rejected
          </div>
        )}


        {isCompleted && (
          <div className="completed-offer-actions">

            <div className="hire-offer-status completed">
              <i className="bi bi-check-circle-fill"></i>
              Completed
            </div>

            <button
              type="button"
              className={`btn ${ hasReviewed ? "btn-outline-secondary" : "btn-outline-primary" }`}
              disabled={hasReviewed || submittingReview}
              onClick={() =>{
                if(hasReviewed) return;
                setError("");
                setShowRatingModal(true)
              }}
            >
              <i className={`bi ${ hasReviewed ? "bi-star-fill" : "bi-star" } me-1`}></i>

              {hasReviewed
                ? "You rated this offer"
                : "Rate"}
            </button>

          </div>
        )}

      </div>

      
      </div>

        <RatingModal
          show={showRatingModal}
          onClose={() => {
            if (submittingReview) return;

            setShowRatingModal(false);
          }}
          onSubmit={handleSubmitReview}
          submitting={submittingReview}
          otherUserName={
            isCurrentUserClient
              ? conversation.workerFullName
              : conversation.clientFullName
          }
          hireOfferTitle={offer.offerTitle}
        />


      {error && (
        <div className="alert alert-danger mt-2 mb-0">
          {error}
        </div>
      )}


    </div>
  );
}