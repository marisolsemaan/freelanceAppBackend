import api from "./axios";

// Get all conversations for the logged-in user
export const getUserConversations = async () => {
  const response = await api.get("/conversations");

  const result= response.data;

  return {
    ...result,
    data: result.data.map((conversation) => ({
      conversationId: conversation.conversation_Id,
      otherUserId: conversation.otherUser_Id,
      otherUserFullName: conversation.otherUser_FullName,
      otherUserRole: conversation.otherUser_Role,
      lastMessageAt: conversation.conversation_LastMessageAt,
      lastMessage: conversation.lastMessage,
      lastActivityType: conversation.lastActivityType,
      unreadCount: conversation.unreadCount,
    })),
  };
};

// Get one conversation with its complete ordered timeline
export const getConversation = async (conversationId) => {
  const response = await api.get(
    `/conversations/${conversationId}`
  );

  return response.data;
};

// Send normal message
export const sendMessage = async (conversationId, content) => {
  const response = await api.post(
    `/conversations/${conversationId}/messages`,
    {
      content,
    }
  );

  return response.data;
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId) => {
  const response = await api.patch(
    `/conversations/${conversationId}/read`
  );

  return response.data;
};

// Worker connects to a job post
export const connectToJobPost = async (jobPostId) => {
  const response = await api.post(
    `/worker/job-posts/${jobPostId}/connect`
  );

  return response.data;
};

// Client creates a hire offer
export const createHireOffer = async (
  conversationId,
  offer
) => {
  const response = await api.post(
    `/conversations/${conversationId}/hire-offer`,
    offer
  );

  return response.data;
};

// Worker accepts/rejects a hire offer
export const updateHireOfferStatus = async ( hireOfferId, status) => {
  const response = await api.patch(
    `/worker/hire-offers/${hireOfferId}/status`,
    {
      hireOffer_Status: status,
    }
  );

  return response.data;
};

export const getClientJobPostTitles =
  async () => {
    const response = await api.get(
      "/client/job-posts/titles"
    );

    return response.data;
  };

// Create review
export const createReview = async (review) => {
  const response = await api.post(
    "/ratings",
    review
  );

  return response.data;
};

export const completeHireOffer = async ( hireOfferId) => {
  const response = await api.patch(
    `/client/hire-offers/${hireOfferId}/complete`
  );

  return response.data;
};