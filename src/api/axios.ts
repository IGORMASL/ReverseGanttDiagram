// src/api/axios.ts
import axios from "axios";

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

export default api;
