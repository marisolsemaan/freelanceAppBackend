import api from "./axios";

export const getMyJobPosts = async () => {
  const response = await api.get("/client/job-posts");

  return response.data;
};

export const createJobPost = async (jobPost) => {
  const response = await api.post("/client/job-posts", jobPost);

  return response.data;
};

export const closeJobPost = async (jobPostId) => {
  const response = await api.patch(
    `/client/job-posts/${jobPostId}/close`
  );

  return response.data;
};

export const getProfessions = async () => {
  const response = await api.get("/lookups/professions");

  return response.data;
};

export const getCities = async () => {
  const response = await api.get("/lookups/cities");

  return response.data;
};