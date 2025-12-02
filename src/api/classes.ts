// src/api/classes.ts
import api from "./axios";

// ---- Типы -----------------------------------------------------------------

export type ClassRole = 0 | 1;

export const ClassRoleLabels = {
  0: "Студент",
  1: "Учитель",
} as const;

export type UserClass = {
  classId: string;
  className: string;
  description?: string;
  classRole?: ClassRole; // опциональный, так как для админа роли нет
  color?: string;        // цвет кнопки на карточке (только на фронте)
};

export type ClassCreateDto = {
  title: string;
  description: string;
};

export type ClassView = {
  id: string;
  title: string;
  description: string;
};

export type ClassUpdateDto = {
  title: string;
  description: string;
};

// ---- API ------------------------------------------------------------------

/**
 * GET /api/class/user — классы текущего пользователя.
 */
export async function getUserClasses(): Promise<UserClass[]> {
  const res = await api.get<any[]>("/class/user");

  return res.data.map((item) => ({
    classId: item.classId,
    className: item.className,
    description: item.description ?? "",
    classRole: Number(item.role) as ClassRole,
  }));
}

/**
 * GET /api/class — все классы (для админа).
 */
export async function getAllClasses(): Promise<ClassView[]> {
  const res = await api.get<ClassView[]>("/class");
  return res.data;
}

/**
 * POST /api/class — создание класса.
 */
export async function createClass(payload: ClassCreateDto): Promise<ClassView> {
  const res = await api.post<ClassView>("/class", payload);
  return res.data;
}

/**
 * PUT /api/class?id=... — обновление класса по id.
 * id передаётся как query-параметр, в теле только title/description.
 */
export async function updateClass(id: string, payload: ClassUpdateDto): Promise<ClassView> {
  const res = await api.put<ClassView>("/class", payload, {
    params: { id },
  });
  return res.data;
}

/**
 * DELETE /api/class?id=... — удаление класса по id.
 */
export async function deleteClass(id: string): Promise<void> {
  await api.delete("/class", { params: { id } });
}
