import { useEffect, useState } from "react";

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

import "../../style/messages.css";

export default function Messages() {
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

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
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
  };

  const handleSelectConversation =
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
            conversation.conversationId ===
            conversationId
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
    };

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

        // Reload the conversation so the backend
        // remains the source of truth for the timeline.
        const conversationResponse =
          await getConversation(
            selectedConversationId
          );

        if (conversationResponse.success) {
          setActiveConversation(
            conversationResponse.data
          );
        }

        // Refresh the sidebar so the last message
        // preview and LastMessageAt stay correct.
        await loadConversations();

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