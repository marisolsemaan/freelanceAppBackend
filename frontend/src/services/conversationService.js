import api from "./axios";

// Get all conversations for the logged-in user
export const getUserConversations = async () => {
  const response = await api.get("/api/conversations");

  return response.data;
};

// Get one conversation with its complete ordered timeline
export const getConversation = async (conversationId) => {
  const response = await api.get(
    `/api/conversations/${conversationId}`
  );

  return response.data;
};

// Send normal message
export const sendMessage = async (conversationId, content) => {
  const response = await api.post(
    `/api/conversations/${conversationId}/messages`,
    {
      content,
    }
  );

  return response.data;
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId) => {
  const response = await api.patch(
    `/api/conversations/${conversationId}/read`
  );

  return response.data;
};

// Worker connects to a job post
export const connectToJobPost = async (jobPostId) => {
  const response = await api.post(
    `/api/worker/job-posts/${jobPostId}/connect`
  );

  return response.data;
};

// Client creates a hire offer
export const createHireOffer = async (
  conversationId,
  offer
) => {
  const response = await api.post(
    `/api/conversations/${conversationId}/hire-offers`,
    offer
  );

  return response.data;
};

// Worker accepts/rejects a hire offer
export const updateHireOfferStatus = async (
  hireOfferId,
  status
) => {
  const response = await api.patch(
    `/api/hire-offers/${hireOfferId}/status`,
    {
      hireOffer_Status: status,
    }
  );

  return response.data;
};

// Create review
export const createReview = async (review) => {
  const response = await api.post(
    "/api/reviews",
    review
  );

  return response.data;
};