import api from "./axios";

// Get one conversation with its complete timeline
export const getConversation = async (conversationId) => {
  const response = await api.get(
    `/api/conversation/${conversationId}`
  );

  return response.data;
};

// Send normal message
export const sendMessage = async (conversationId, content) => {
  const response = await api.post(
    `/api/conversation/${conversationId}/messages`,
    {
      content,
    }
  );

  return response.data;
};

// Mark conversation messages/offers as read
export const markConversationAsRead = async (conversationId) => {
  const response = await api.patch(
    `/api/conversation/${conversationId}/read`
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
    `/api/conversation/${conversationId}/hire-offers`,
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
    `/api/reviews`,
    review
  );

  return response.data;
};