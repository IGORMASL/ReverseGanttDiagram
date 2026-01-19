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
  try {
    const res = await api.post("/user/profile/verify-password", { 
      currentPassword 
    });
    
    // Бэкенд может возвращать разные форматы:
    // 1. Просто boolean: true/false
    // 2. Объект с valid: { valid: true }
    // 3. Объект с data: { data: true }
    let result: boolean;
    
    if (typeof res.data === 'boolean') {
      // Просто boolean
      result = res.data;
    } else if (res.data && typeof res.data === 'object') {
      // Объект
      result = res.data.data !== undefined ? res.data.data : res.data.valid;
    } else {
      // Неизвестный формат
      result = false;
    }
    
    return result || false;
  } catch (error) {
    console.error("Ошибка при проверке пароля:", error);
    throw error;
  }
}

// PUT /api/user/profile/password - изменение пароля
export async function updatePassword(newPassword: string): Promise<void> {
  await api.put("/user/profile/password", { newPassword });
}
