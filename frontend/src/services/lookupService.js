import api from "./axios";

export const getProfessions = async () => {
  const response = await api.get("/lookups/professions");

  return response.data.data;
};

export const getCities = async () => {
  const response = await api.get("/lookups/cities");

  return response.data.data;
};