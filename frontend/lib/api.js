import axios from "axios";
import { getToken, clearAuth } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  loginWithGoogle: (idToken) =>
    api.post("/auth/google", { id_token: idToken }),
};

export const todosApi = {
  getAll: () => api.get("/todos/"),
  create: (data) => api.post("/todos/", data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
};

export const aiApi = {
  breakdown: (title) => api.post("/ai/breakdown", { title }),
  suggestTitle: (roughInput) =>
    api.post("/ai/suggest-title", { rough_input: roughInput }),
};

export default api;
