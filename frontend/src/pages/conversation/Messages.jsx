import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useParams } from "react-router-dom";

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

import {
  startConversationHub,
  stopConversationHub,
} from "../../services/conversationHub";

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


  useEffect(() => {
    const handleConversationUpdated =
      async (updatedConversationId) => {

        await loadConversations();

        if (
          Number(updatedConversationId) ===
          Number(selectedConversationIdRef.current)
        ) {
          try {
            const response =
              await getConversation(
                updatedConversationId
              );

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


  const handleSendMessage =
    async (content) => {
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