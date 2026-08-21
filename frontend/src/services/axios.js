import axios from "axios";
import { getToken, clearAuth } from "../utils/jwtStorage";

const api = axios.create({
  baseURL: "http://localhost:5043/api",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;