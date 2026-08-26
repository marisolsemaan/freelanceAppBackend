import { useEffect, useState, useCallback, useRef,} from "react";

import RatingModal from "../../components/rating/RatingModal";
import {createReview} from "../../services/conversationService";
import { useParams } from "react-router-dom";
import {getAuth} from "../../utils/jwtStorage";
import Navbar from "../../components/layout/Navbar";

import ConversationList from "../../components/messages/ConversationList";
import ConversationHeader from "../../components/messages/ConversationHeader";
import ConversationTimeline from "../../components/messages/ConversationTimeline";
import MessageInput from "../../components/messages/MessageInput";

import {
  getUserConversations,
  getConversation,
  sendMessage,
  markConversationAsRead,
} from "../../services/conversationService";

import { startConversationHub, stopConversationHub,} from "../../services/conversationHub";

import "../../style/messages.css";


export default function Messages() {
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState(null);

  const [
    activeConversation,
    setActiveConversation,
  ] = useState(null);

  const [
    conversationsLoading,
    setConversationsLoading,
  ] = useState(true);

  const [
    conversationLoading,
    setConversationLoading,
  ] = useState(false);

  const [error, setError] = useState("");

  const [sending, setSending] = useState(false);


  const selectedConversationIdRef = useRef(null);

  const [showRatingModal, setShowRatingModal] =
  useState(false);

  const [ratingHireOffer, setRatingHireOffer] =
    useState(null);

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [ratedHireOfferIds, setRatedHireOfferIds] =
    useState([]);

  const acceptedHireOffers =
  activeConversation?.items?.filter(
    (item) =>
      item.type === "HireOffer" &&
      Number(item.hireOffer?.offerStatus) === 1
  ) || [];

  const acceptedHireOffer =
  acceptedHireOffers.length > 0
    ? acceptedHireOffers[
        acceptedHireOffers.length - 1
      ].hireOffer
    : null;

  const auth = getAuth();

  const currentUserId =
    auth?.userId ||
    auth?.id ||
    auth?.user?.userId;

  const canRateAcceptedOffer =
  acceptedHireOffer &&
  !ratedHireOfferIds.includes(
    Number(acceptedHireOffer.hireOfferId)
  );

  const handleOpenRatingModal = () => {
    if (!acceptedHireOffer) return;

    setRatingHireOffer(
      acceptedHireOffer
    );

    setShowRatingModal(true);
  };

    const handleSubmitReview = async ({
    rating,
    comment,
  }) => {
    if (!ratingHireOffer) {
      return false;
    }

    try {
      setSubmittingReview(true);
      setError("");

      const response =
        await createReview({
          Review_HireOfferId:
            ratingHireOffer.hireOfferId,

          Review_Rating:
            rating,

          Review_Comment:
            comment,
        });

      if (!response.success) {
        setError(
          response.message ||
          "Failed to submit review."
        );

        return false;
      }

      setRatedHireOfferIds(
        (current) => [
          ...current,
          Number(
            ratingHireOffer.hireOfferId
          ),
        ]
      );

      setShowRatingModal(false);

      setRatingHireOffer(null);

      return true;

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to submit review."
      );

      return false;

    } finally {

      setSubmittingReview(false);

    }
  };

  useEffect(() => {
    selectedConversationIdRef.current =
    selectedConversationId;
  }, [selectedConversationId]);


  const loadConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      setError("");

      const response =
        await getUserConversations();

      if (!response.success) {
        setError(
          response.message ||
          "Failed to load conversations."
        );

        return;
      }

      setConversations(response.data || []);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load conversations."
      );
    } finally {
      setConversationsLoading(false);
    }
  }, []);


  const handleSelectConversation = useCallback(
    async (conversationId) => {
      try {
        setSelectedConversationId(conversationId);
        setConversationLoading(true);
        setError("");

        const response =
          await getConversation(conversationId);

        if (!response.success) {
          setError(
            response.message ||
            "Failed to load conversation."
          );

          return;
        }

        setActiveConversation(response.data);

        await markConversationAsRead(
          conversationId
        );

        setConversations((current) =>
          current.map((conversation) =>
            Number(conversation.conversationId) ===
            Number(conversationId)
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation
          )
        );

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load conversation."
        );
      } finally {
        setConversationLoading(false);
      }
    },
    []
  );


  useEffect(() => {
    loadConversations();
  }, [loadConversations]);


  useEffect(() => {
    if (!conversationId || !conversations.length) return;

    const conversationExists = conversations.some(
      (conversation) =>
        Number(conversation.conversationId) ===
        Number(conversationId)
    );

    if (
      conversationExists &&
      Number(selectedConversationId) !==
        Number(conversationId)
    ) {
      handleSelectConversation(
        Number(conversationId)
      );
    }

  }, [
    conversationId,
    conversations,
    selectedConversationId,
    handleSelectConversation,
  ]);

  useEffect(() => { const handleConversationUpdated = async (updatedConversationId) => {
      
    await loadConversations();

      if (
        Number(updatedConversationId) ===
        Number(selectedConversationIdRef.current)
      ) {
        try {
          const response =
            await getConversation(updatedConversationId);

          if (response.success) {
            setActiveConversation(response.data);
          }
        } catch (error) {
          console.error(
            "Failed to refresh conversation:",
            error
          );
        }
      }
    };

    startConversationHub(
      handleConversationUpdated
    ).catch((error) => {
      console.error(
        "Failed to connect to SignalR:",
        error
      );
    });

    return () => {
      stopConversationHub();
    };
  }, [loadConversations]);

  const refreshActiveConversation =
    useCallback(
      async (
        updatedOffer,
        conversationIdToRefresh =
          selectedConversationId
      ) => {
        if (!conversationIdToRefresh) {
          return;
        }

        try {
          const response =
            await getConversation(
              conversationIdToRefresh
            );

          if (response.success) {
            setActiveConversation(
              response.data
            );
          }

          await loadConversations();

        } catch (error) {
          console.error(
            "Failed to refresh conversation:",
            error
          );
        }
      },
      [
        selectedConversationId,
        loadConversations,
      ]
  );

  const handleSendMessage = async (content) => {
      if (!selectedConversationId) return false;

      try {
        setSending(true);

        const response = await sendMessage(
          selectedConversationId,
          content
        );

        if (!response.success) {
          setError(
            response.message ||
            "Failed to send message."
          );

          return false;
        }

        return true;

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to send message."
        );

        return false;

      } finally {
        setSending(false);
      }
    };


  const handleBackToList = () => {
    setSelectedConversationId(null);
    setActiveConversation(null);
  };


  return (
    <>
      <Navbar />

      <main className="messages-page">

        <RatingModal
          show={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingHireOffer(null);
          }}
          onSubmit={handleSubmitReview}
          submitting={submittingReview}
          otherUserName={
            activeConversation
              ? Number(currentUserId) ===
                Number(activeConversation.clientId)
                  ? activeConversation.workerFullName
                  : activeConversation.clientFullName
              : ""
          }
        />
        
        <div className="messages-container">

          <aside
            className={`messages-sidebar ${
              selectedConversationId
                ? "conversation-selected"
                : ""
            }`}
          >
            <div className="messages-sidebar-header">
              <h5>Messages</h5>
            </div>

            {error && !selectedConversationId && (
              <div className="alert alert-danger m-3">
                {error}
              </div>
            )}

            <ConversationList
              conversations={conversations}
              selectedConversationId={
                selectedConversationId
              }
              onSelect={
                handleSelectConversation
              }
              loading={conversationsLoading}
            />
          </aside>


          <section
            className={`conversation-panel ${
              selectedConversationId
                ? "conversation-open"
                : ""
            }`}
          >
            {!selectedConversationId && (
              <div className="conversation-placeholder">
                <i className="bi bi-chat-square-text"></i>

                <h5>
                  Select a conversation
                </h5>

                <p>
                  Choose a conversation to start
                  messaging.
                </p>
              </div>
            )}


            {conversationLoading && (
              <div className="conversation-loading">
                <div className="spinner-border" />
              </div>
            )}


            {!conversationLoading &&
              activeConversation && (
                <>
                  <ConversationHeader
                    conversation={
                      activeConversation
                    }
                    onBack={
                      handleBackToList
                    }
                    onRate={
                      handleOpenRatingModal
                    }
                    canRate={
                      canRateAcceptedOffer
                    }
                  />


                  {error && (
                    <div className="alert alert-danger m-3 mb-0">
                      {error}
                    </div>
                  )}


                 <ConversationTimeline
                    items={
                      activeConversation.items
                    }
                    onOfferUpdated={
                      refreshActiveConversation
                    }
                  />


                  <MessageInput
                    onSend={
                      handleSendMessage
                    }
                    sending={sending}
                  />
                </>
              )}
          </section>

        </div>
      </main>
    </>
  );
}