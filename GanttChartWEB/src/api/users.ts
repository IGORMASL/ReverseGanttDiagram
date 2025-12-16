// src/api/users.ts
import api from "./axios";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 0 | 1; // 0 = User, 1 = Admin (system role)
};

// GET /api/user/profile
export async function getProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/user/profile");
  return res.data;
}
