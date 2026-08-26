import {useState,} from "react";

import { getAuth } from "../../utils/jwtStorage";

import { updateHireOfferStatus,} from "../../services/conversationService";

export default function HireOfferCard({ item, onOfferUpdated,}) {
  const offer = item.hireOffer;

  const auth = getAuth();

  const currentUserId =
    auth?.userId ||
    auth?.id ||
    auth?.user?.userId;

  const isWorker =
    Number(currentUserId) !== Number(offer.senderId);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!offer) {
    return null;
  }


  const statusMap = {
    0: {
      label: "Pending",
      icon: "bi-hourglass-split",
      className: "pending",
    },

    1: {
      label: "Accepted",
      icon: "bi-check-circle-fill",
      className: "accepted",
    },

    2: {
      label: "Rejected",
      icon: "bi-x-circle-fill",
      className: "rejected",
    },
  };


  const status =
    statusMap[offer.offerStatus] ||
    statusMap[0];


  const handleUpdateStatus = async (
    newStatus
  ) => {
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


  const isPending =
    Number(offer.offerStatus) === 0;


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

          {isPending ? (
            <>
              {isWorker ? (
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
          ) : (
            <div
              className={`hire-offer-status ${status.className}`}
            >
              <i className={`bi ${status.icon}`}></i>

              {status.label}
            </div>
          )}

        </div>

      </div>


      {error && (
        <div className="alert alert-danger mt-2 mb-0">
          {error}
        </div>
      )}

    </div>
  );
}