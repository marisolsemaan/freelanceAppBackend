import api from "./axios";

export const getWorkerProfile = async () => {
  const response = await api.get(`/worker/profile`);
  return response.data;
};

export const updateWorkerProfile = async (profileData) => {
  const response = await api.put("/worker/profile", profileData);
  return response.data;
};

export const getClientProfile = async () => {
  const response = await api.get(`/users/profile`);
  return response.data;
};

export const createProfession = async (title) => {
  const response = await api.post("/lookups/professions", {
    title,
  });

  return response.data;
};

export const getTheClientProfile = async (clientId) => {
  const response =
    await api.get(`/users/${clientId}/profile`);

  return response.data;
};

export const getTheWorkerProfile = async (workerId) => {
  const response =
    await api.get(`/worker/${workerId}/profile`);

  return response.data;
};







