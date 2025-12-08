// src/api/axios.ts
import axios from "axios";
import { clearAuth } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:5050/api", 
  withCredentials: true, 
});

// Подставляем токен автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Глобальная обработка ответов: если получили 401, считаем токен недействительным
// и перенаправляем пользователя на страницу авторизации.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        clearAuth();
      } catch {
        // ignore
      }
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
