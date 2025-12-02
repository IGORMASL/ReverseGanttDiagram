// src/api/auth.ts
import api from "./axios";

export type AuthResponse = {
  token: string;
  expiresAt: string;
};

// POST /api/Auth/register
export async function registerApi(payload: { fullName: string; email: string; password: string; }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/Auth/register", payload);
  return res.data;
}

// POST /api/Auth/login
export async function loginApi(payload: { email: string; password: string; }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/Auth/login", payload);
  return res.data;
}

// helper: save token & expiry
export function saveToken(token: string, expiresAt?: string) {
  localStorage.setItem("token", token);
  if (expiresAt) localStorage.setItem("tokenExpiry", expiresAt);
}

// helper: clear auth
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("fullName");
  localStorage.removeItem("systemRole");
}
