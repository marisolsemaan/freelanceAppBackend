import api from "./axios";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data.response;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.response;
};