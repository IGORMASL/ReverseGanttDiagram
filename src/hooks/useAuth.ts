/**
 * Хук для работы с аутентификацией и профилем пользователя
 */

import { useState, useEffect } from "react";
import { getProfile } from "../api/users";
import type { CurrentUser } from "../types";

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser({
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role === 1 ? 1 : 0,
        });
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
        setError("Не удалось загрузить профиль пользователя");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { user, loading, error };
}

