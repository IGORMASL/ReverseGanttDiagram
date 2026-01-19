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

// PUT /api/user/profile/name - изменение имени пользователя
export async function updateProfileName(newName: string): Promise<void> {
  await api.put("/user/profile/name", { fullName: newName });
}

// POST /api/user/profile/verify-password - проверка текущего пароля
export async function verifyCurrentPassword(currentPassword: string): Promise<boolean> {
  const res = await api.post<{ valid: boolean }>("/user/profile/verify-password", { 
    currentPassword 
  });
  return res.data.valid;
}

// PUT /api/user/profile/password - изменение пароля
export async function updatePassword(newPassword: string): Promise<void> {
  await api.put("/user/profile/password", { newPassword });
}
