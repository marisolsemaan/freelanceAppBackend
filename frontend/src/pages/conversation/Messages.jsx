import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import {
  getConversation,
  sendMessage,
  markConversationAsRead,
  createHireOffer,
  updateHireOfferStatus,
  createReview,
} from "../../services/conversationService";

import HireOfferCard from "../../components/messages/HireOfferCard";

import "../../style/messages.css";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [showHireModal, setShowHireModal] =
    useState(false);

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  const [selectedHireOffer, setSelectedHireOffer] =
    useState(null);

  const [hireTitle, setHireTitle] =
    useState("");

  const [hirePrice, setHirePrice] =
    useState("");

  const [hireScope, setHireScope] =
    useState("");

  const [selectedJobPostId, setSelectedJobPostId] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * Existing login flow stores the authenticated user.
   *
   */
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const currentUserId = Number(
    currentUser?.userId
  );

  const userRole =
    typeof currentUser?.role === "string"
      ? currentUser.role.toLowerCase()
      : Number(currentUser?.role) === 1
        ? "client"
        : "worker";

  const isClient =
    userRole === "client";

  const isWorker =
    userRole === "worker";

  /*
   * Load conversation
   */
  const loadConversation = async () => {
    try {
      setLoading(true);

      const response =
        await getConversation(conversationId);

      if (!response?.success) {
        console.error(response?.message);
        return;
      }

      setConversation(response.data);

      await markConversationAsRead(
        conversationId
      );

    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  /*
   * Scroll to newest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation]);

  /*
   * Determine the other participant
   */
  const otherUser = useMemo(() => {
    if (!conversation) {
      return null;
    }

    if (
      Number(conversation.clientId) ===
      currentUserId
    ) {
      return {
        id: conversation.workerId,
        name: conversation.workerFullName,
        role: "worker",
        rating: conversation.workerAvgRating,
      };
    }

    return {
      id: conversation.clientId,
      name: conversation.clientFullName,
      role: "client",
      rating: conversation.clientAvgRating,
    };
  }, [
    conversation,
    currentUserId,
  ]);

  /*
   * Job posts available in this conversation
   */
  const jobPosts =
    conversation?.items
      ?.filter(
        (item) =>
          item.type === "JobPost"
      )
      ?.map(
        (item) => item.jobPost
      ) || [];

  /*
   * Send normal message
   */
  const handleSendMessage = async () => {
    const content =
      message.trim();

    if (!content || sending) {
      return;
    }

    try {
      setSending(true);

      const response =
        await sendMessage(
          conversationId,
          content
        );

      if (!response?.success) {
        alert(
          response?.message ||
          "Unable to send message."
        );
        return;
      }

      setMessage("");

      await loadConversation();

    } catch (error) {
      console.error(
        "Send message error:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * Client opens Hire modal
   */
  const openHireModal = () => {
    setHireTitle("");
    setHirePrice("");
    setHireScope("");
    setSelectedJobPostId("");

    setShowHireModal(true);
  };

  /*
   * Create Hire Offer
   */
  const handleCreateHireOffer =
    async (event) => {
      event.preventDefault();

      if (
        !hireTitle.trim() ||
        !hirePrice ||
        Number(hirePrice) <= 0
      ) {
        return;
      }

      try {
        setActionLoading(true);

        const response =
          await createHireOffer(
            conversationId,
            {
              HireOffer_JobPostId:
                selectedJobPostId
                  ? Number(
                      selectedJobPostId
                    )
                  : null,

              HireOffer_Title:
                hireTitle.trim(),

              HireOffer_Price:
                Number(hirePrice),

              HireOffer_ScopeTerms:
                hireScope.trim() || null,
            }
          );

        if (!response?.success) {
          alert(
            response?.message ||
            "Unable to send hire offer."
          );
          return;
        }

        setShowHireModal(false);

        await loadConversation();

      } catch (error) {
        console.error(
          "Create hire offer error:",
          error
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * Worker accepts offer
   */
  const handleAcceptOffer =
    async (hireOfferId) => {
      try {
        setActionLoading(true);

        const response =
          await updateHireOfferStatus(
            hireOfferId,
            1
          );

        if (!response?.success) {
          alert(
            response?.message ||
            "Unable to accept offer."
          );
          return;
        }

        await loadConversation();

      } catch (error) {
        console.error(
          "Accept offer error:",
          error
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * Worker rejects offer
   */
  const handleRejectOffer =
    async (hireOfferId) => {
      try {
        setActionLoading(true);

        const response =
          await updateHireOfferStatus(
            hireOfferId,
            2
          );

        if (!response?.success) {
          alert(
            response?.message ||
            "Unable to reject offer."
          );
          return;
        }

        await loadConversation();

      } catch (error) {
        console.error(
          "Reject offer error:",
          error
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * Open review modal
   */
  const openReviewModal =
    (hireOfferId) => {
      setSelectedHireOffer(
        hireOfferId
      );

      setReviewRating(0);
      setReviewComment("");

      setShowReviewModal(true);
    };

  /*
   * Submit review
   */
  const handleSubmitReview =
    async (event) => {
      event.preventDefault();

      if (
        !selectedHireOffer ||
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        return;
      }

      try {
        setActionLoading(true);

        const response =
          await createReview({
            Review_HireOfferId:
              selectedHireOffer,

            Review_Rating:
              reviewRating,

            Review_Comment:
              reviewComment.trim() ||
              null,
          });

        if (!response?.success) {
          alert(
            response?.message ||
            "Unable to submit review."
          );
          return;
        }

        setShowReviewModal(false);

      } catch (error) {
        console.error(
          "Review error:",
          error
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="message-page">
        <div className="message-loading">
          <div className="spinner-border text-primary" />
          <span>
            Loading conversation...
          </span>
        </div>
      </main>
    );
  }

  /*
   * Conversation unavailable
   */
  if (!conversation) {
    return (

      <main className="message-page">
        <Navbar />
        <div className="message-empty">
          <i className="bi bi-chat-square-text" />
          <h5>
            Conversation not found
          </h5>

          <button
            className="btn GoBack-btn"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    
    <main className="message-page">
        <Navbar />

      <div className="message-layout">

        <aside className="conversation-sidebar">

          <div className="conversation-sidebar-header">

            <h6>
              Messages
            </h6>

            <div className="role-switcher">

              <button
                className="role-btn active"
                type="button"
              >
                All
              </button>

              <button
                className="role-btn"
                type="button"
              >
                Active
              </button>

              <button
                className="role-btn"
                type="button"
              >
                Archived
              </button>

            </div>

          </div>

          <div className="conversation-list">

            <div className="conversation-list-placeholder">

              <div className="message-mini-avatar">
                {otherUser?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="min-width-0">

                <div className="conversation-preview-name">
                  {otherUser?.name}
                </div>

                <div className="conversation-preview-role">
                  {otherUser?.role}
                </div>

              </div>

            </div>

          </div>

        </aside>


        <section className="conversation-main">

          {/* HEADER */}

          <header className="conversation-header">

            <div className="conversation-user">

              <div className="message-avatar">
                {otherUser?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="min-width-0">

                <div className="conversation-user-name">
                  {otherUser?.name}

                  <i className="bi bi-patch-check-fill text-primary ms-1" />
                </div>

                <div className="conversation-user-meta">

                  <span>
                    {otherUser?.role}
                  </span>

                  <span>·</span>

                  <span>
                    <i className="bi bi-star-fill me-1" />

                    {Number(
                      otherUser?.rating || 0
                    ).toFixed(1)}
                  </span>

                </div>

              </div>

            </div>


            <div className="conversation-header-actions">

              {isClient && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    navigate(
                      `/workers/${otherUser.id}`
                    )
                  }
                >
                  View Profile
                </button>
              )}

              {isWorker && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    navigate(
                      `/clients/${otherUser.id}`
                    )
                  }
                >
                  View Profile
                </button>
              )}

            </div>

          </header>



          <div className="conversation-timeline">

            {conversation.items?.map(
              (item, index) => {


                if (
                  item.type ===
                  "JobPost"
                ) {
                  const job =
                    item.jobPost;

                  return (
                    <div
                      key={`job-${index}`}
                      className="timeline-system-row"
                    >

                      <div className="job-context-card">

                        <div className="job-context-header">

                          <div className="job-context-icon">
                            <i className="bi bi-briefcase-fill" />
                          </div>

                          <div>

                            <div className="job-context-label">
                              Job Post
                            </div>

                            <div className="job-context-date">
                              Connected to conversation
                            </div>

                          </div>

                        </div>

                        <h6>
                          {job?.jobPostTitle}
                        </h6>

                        <div className="job-context-meta">

                          {job?.jobPostProfession && (
                            <span>
                              <i className="bi bi-tools me-1" />
                              {job.jobPostProfession}
                            </span>
                          )}

                          {job?.jobPostCity && (
                            <span>
                              <i className="bi bi-geo-alt me-1" />
                              {job.jobPostCity}
                            </span>
                          )}

                        </div>

                        <div className="job-context-price">
                          ${Number(
                            job?.jobPostPrice || 0
                          ).toFixed(2)}
                        </div>

                      </div>

                    </div>
                  );
                }


                if (
                  item.type ===
                  "Message"
                ) {
                  const msg =
                    item.message;

                  const isMine =
                    Number(
                      msg?.senderId
                    ) ===
                    currentUserId;

                  return (
                    <div
                      key={`message-${msg?.messageId || index}`}
                      className={`message-row ${
                        isMine
                          ? "message-row-me"
                          : ""
                      }`}
                    >

                      <div className="message-wrapper">

                        <div
                          className={`message-bubble ${
                            isMine
                              ? "bubble-me"
                              : "bubble-them"
                          }`}
                        >
                          {msg?.content}
                        </div>

                        <div
                          className={`message-time ${
                            isMine
                              ? "text-end"
                              : ""
                          }`}
                        >
                          {new Date(
                            item.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </div>

                      </div>

                    </div>
                  );
                }


                if (
                  item.type ===
                  "Hire Offer"
                ) {
                  const offer =
                    item.hireOffer;

                  const normalizedOffer =
                    {
                      ...offer,

                      hireOfferId:
                        offer.hireOfferId,

                      senderId:
                        offer.senderId,

                      offerTitle:
                        offer.offerTitle,

                      offerPrice:
                        offer.offerPrice,

                      scopeTerms:
                        offer.scopeTerms,

                      offerStatus:
                        offer.offerStatus,

                      hireOfferWorkerId:
                        offer.hireOfferWorkerId,
                    };

                  return (
                    <div
                      key={`offer-${offer?.hireOfferId || index}`}
                      className="hire-offer-row"
                    >

                      <HireOfferCard
                        offer={
                          normalizedOffer
                        }

                        currentUserId={
                          currentUserId
                        }

                        userRole={
                          userRole
                        }

                        onAccept={
                          handleAcceptOffer
                        }

                        onReject={
                          handleRejectOffer
                        }

                        onRate={
                          openReviewModal
                        }
                      />

                      <div
                        className={`message-time ${
                          offer?.senderId ===
                          currentUserId
                            ? "text-end"
                            : ""
                        }`}
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </div>

                    </div>
                  );
                }

                return null;
              }
            )}

            <div ref={messagesEndRef} />

          </div>

          <div className="message-input-area">

            <button
              type="button"
              className="btn btn-light message-attachment-button"
              disabled
              title="Attachments coming later"
            >
              <i className="bi bi-paperclip" />
            </button>


            <input
              type="text"
              className="form-control message-input"
              placeholder="Type a message..."
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  handleSendMessage();
                }

              }}
            />


            {/* CLIENT ONLY */}

            {isClient && (
              <button
                type="button"
                className="btn btn-outline-primary hire-button"
                onClick={
                  openHireModal
                }
              >
                <i className="bi bi-briefcase me-1" />

                <span className="d-none d-sm-inline">
                  Hire
                </span>
              </button>
            )}


            <button
              type="button"
              className="btn btn-primary send-button"
              disabled={
                !message.trim() ||
                sending
              }
              onClick={
                handleSendMessage
              }
            >
              <i className="bi bi-send-fill" />
            </button>

          </div>

        </section>

      </div>



      {showHireModal && (
        <div
          className="message-modal-backdrop"
          onMouseDown={() =>
            setShowHireModal(false)
          }
        >

          <div
            className="message-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="message-modal-header">

              <div>

                <h5>
                  Send Hire Offer
                </h5>

                <p>
                  Create an offer for{" "}
                  {otherUser?.name}.
                </p>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setShowHireModal(false)
                }
              />

            </div>


            <form
              onSubmit={
                handleCreateHireOffer
              }
            >

              <div className="message-modal-body">

                {/* Job post */}

                {jobPosts.length > 0 && (
                  <div className="mb-3">

                    <label className="message-form-label">
                      Job post
                    </label>

                    <select
                      className="form-select"
                      value={
                        selectedJobPostId
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedJobPostId(
                          event.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        General offer
                      </option>

                      {jobPosts.map(
                        (job) => (
                          <option
                            key={
                              job.jobPostId
                            }
                            value={
                              job.jobPostId
                            }
                          >
                            {
                              job.jobPostTitle
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>
                )}


                {/* Title */}

                <div className="mb-3">

                  <label className="message-form-label">
                    Offer title
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      hireTitle
                    }
                    onChange={(
                      event
                    ) =>
                      setHireTitle(
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Panel upgrade"
                    required
                  />

                </div>


                {/* Price */}

                <div className="mb-3">

                  <label className="message-form-label">
                    Price
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <div className="input-group">

                    <span className="input-group-text">
                      $
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="form-control"
                      value={
                        hirePrice
                      }
                      onChange={(
                        event
                      ) =>
                        setHirePrice(
                          event.target
                            .value
                        )
                      }
                      placeholder="320"
                      required
                    />

                  </div>

                </div>


                {/* Scope */}

                <div className="mb-2">

                  <label className="message-form-label">
                    Scope / terms
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={
                      hireScope
                    }
                    onChange={(
                      event
                    ) =>
                      setHireScope(
                        event.target
                          .value
                      )
                    }
                    placeholder="Describe what is included in the offer..."
                  />

                </div>

              </div>


              <div className="message-modal-footer">

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() =>
                    setShowHireModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Sending..."
                    : "Send Offer"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}



      {showReviewModal && (
        <div
          className="message-modal-backdrop"
          onMouseDown={() =>
            setShowReviewModal(false)
          }
        >

          <div
            className="message-modal review-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="message-modal-header">

              <div>

                <h5>
                  Rate {otherUser?.name}
                </h5>

                <p>
                  Share your experience
                  with this hire.
                </p>

              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setShowReviewModal(
                    false
                  )
                }
              />

            </div>


            <form
              onSubmit={
                handleSubmitReview
              }
            >

              <div className="message-modal-body">

                <div className="rating-selector">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        type="button"
                        key={star}
                        className={`rating-star ${
                          star <=
                          reviewRating
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setReviewRating(
                            star
                          )
                        }
                      >
                        <i className="bi bi-star-fill" />
                      </button>
                    )
                  )}

                </div>

                <div className="rating-text">
                  {reviewRating === 0
                    ? "Select a rating"
                    : `${reviewRating} out of 5`}
                </div>


                <div className="mt-4">

                  <label className="message-form-label">
                    Comment
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={
                      reviewComment
                    }
                    onChange={(
                      event
                    ) =>
                      setReviewComment(
                        event.target
                          .value
                      )
                    }
                    placeholder="Tell them about your experience..."
                  />

                </div>

              </div>


              <div className="message-modal-footer">

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() =>
                    setShowReviewModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    reviewRating === 0 ||
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>

  );
}