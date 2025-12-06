/**
 * Хук для работы со списком классов
 */

import { useState, useEffect } from "react";
import type { UserClass, ClassCreateDto } from "../api/classes";
import {
  getUserClasses,
  getAllClasses,
  deleteClass,
  createClass,
  updateClass,
  DEFAULT_CLASS_COLOR,
} from "../api/classes";
import { getErrorMessage } from "../utils/errorHandling";
import type { CurrentUser } from "../types";

export function useClasses(user: CurrentUser | null) {
  const [classes, setClasses] = useState<UserClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        let data: UserClass[];
        if (user.role === 1) {
          // Админ — получаем все классы
          const all = await getAllClasses();
          data = all.map((cls) => ({
            classId: cls.id,
            className: cls.title,
            description: cls.description ?? "",
            color: cls.color ?? DEFAULT_CLASS_COLOR,
            classRole: 1, // Для админа роль не имеет значения
          }));
        } else {
          // Обычный пользователь — только свои классы
          data = await getUserClasses();
        }
        setClasses(data);
      } catch (err) {
        console.error("Ошибка загрузки классов:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const handleDeleteClass = async (classId: string) => {
    try {
      await deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
      return true;
    } catch (err) {
      console.error("Ошибка при удалении класса:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleCreateClass = async (data: ClassCreateDto) => {
    try {
      const newClass = await createClass(data);
      setClasses((prev) => [
        ...prev,
        {
          classId: newClass.id,
          className: newClass.title,
          description: newClass.description ?? "",
          classRole: 1,
          color: newClass.color ?? data.color ?? DEFAULT_CLASS_COLOR,
        },
      ]);
      return true;
    } catch (err) {
      console.error("Ошибка при создании класса:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleUpdateClass = async (
    classId: string,
    data: { title: string; description: string; color: string }
  ) => {
    try {
      const updated = await updateClass(classId, data);
      setClasses((prev) =>
        prev.map((c) =>
          c.classId === updated.id
            ? {
                ...c,
                className: updated.title,
                description: updated.description,
                color: updated.color ?? data.color ?? DEFAULT_CLASS_COLOR,
              }
            : c
        )
      );
      return true;
    } catch (err) {
      console.error("Ошибка при изменении класса:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  return {
    classes,
    loading,
    error,
    handleDeleteClass,
    handleCreateClass,
    handleUpdateClass,
  };
}

