import api from "./axios";

export const getMyJobPosts = async () => {
  const response = await api.get("/client/job-posts");

  return response.data.data;
};

export const createJobPost = async (jobPost) => {
  const response = await api.post("/client/job-posts", jobPost);

  return response.data.data;
};

export const closeJobPost = async (jobPostId) => {
  const response = await api.patch(
    `/client/job-posts/${jobPostId}/close`
  );

  return response.data.data;
};



