import api from "./api";

export const getWorkerProfile = async (workerId) => {
  const response = await api.get(`/worker/${workerId}/profile`);
  return response.data;
};

export const updateWorkerProfile = async (profileData) => {
  const response = await api.put("/worker/profile", profileData);
  return response.data;
};

export const getClientProfile = async (userId) => {
  const response = await api.get(`/users/${userId}/profile`);
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

export const createProfession = async (title) => {
  const response = await api.post("/lookups/professions", {
    title,
  });

  return response.data;
};