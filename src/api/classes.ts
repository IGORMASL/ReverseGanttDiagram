// src/api/classes.ts
import api from "./axios";

// ---- Константы -------------------------------------------------------------

export const DEFAULT_CLASS_COLOR = "#C6D3E1";

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
  color: string;
};

export type ClassView = {
  id: string;
  title: string;
  description: string;
  color?: string;
};

// Детальная информация о классе, включая проекты и участников
export type ClassProject = {
  id: string;
  name: string;
  description?: string;
};

export type ClassMember = {
  id: string; // userId
  fullName: string;
  email: string;
  roleInClass: ClassRole;
};

export type ClassDetails = {
  id: string;
  title: string;
  description: string;
  color: string;
  projects: ClassProject[];
  members: ClassMember[];
};

type ClassDetailsResponse = {
  id: string;
  title: string;
  description: string;
  color?: string;
  projects?: ClassProject[];
  members?: {
    id: string;
    fullName: string;
    email: string;
    classRole: number;
  }[];
};

export type ClassUpdateDto = {
  title: string;
  description: string;
  color: string;
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
    color: item.color ?? DEFAULT_CLASS_COLOR,
  }));
}

/**
 * GET /api/class — все классы (для админа).
 */
export async function getAllClasses(): Promise<ClassView[]> {
  const res = await api.get<ClassView[]>("/class");
  return res.data.map((cls) => ({
    ...cls,
    color: cls.color ?? DEFAULT_CLASS_COLOR,
  }));
}

/**
 * POST /api/class — создание класса.
 */
export async function createClass(payload: ClassCreateDto): Promise<ClassView> {
  const res = await api.post<ClassView>("/class", payload);
  return {
    ...res.data,
    color: res.data.color ?? payload.color ?? DEFAULT_CLASS_COLOR,
  };
}

/**
 * PUT /api/class?classId=... — обновление класса по id.
 * id передаётся как query-параметр classId, в теле — title/description/color.
 * (см. ClassController.Update(Guid classId, ClassDto dto)).
 */
export async function updateClass(id: string, payload: ClassUpdateDto): Promise<ClassView> {
  const res = await api.put<ClassView>("/class", payload, {
    params: { classId: id },
  });
  return {
    ...res.data,
    color: res.data.color ?? payload.color ?? DEFAULT_CLASS_COLOR,
  };
}

/**
 * DELETE /api/class?id=... — удаление класса по id.
 */
export async function deleteClass(id: string): Promise<void> {
  await api.delete("/class", { params: { id } });
}

/**
 * GET /api/class/{id} — данные конкретного класса.
 * Текущий бэкенд отдает только id/title/description.
 */
export async function getClassDetails(id: string): Promise<ClassDetails> {
  const res = await api.get<ClassDetailsResponse>(`/class/${id}`);
  return {
    ...res.data,
    color: res.data.color ?? DEFAULT_CLASS_COLOR,
    projects: res.data.projects ?? [],
    members:
      res.data.members?.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        roleInClass: (m.classRole as ClassRole) ?? 0,
      })) ?? [],
  };
}

/**
 * GET /api/class/members/{classId} — участники класса.
 * Можно использовать отдельно, если нужно обновлять только список участников.
 */
export async function getClassMembers(classId: string): Promise<ClassMember[]> {
  const res = await api.get<{
    id: string;
    fullName: string;
    email: string;
    classRole: number;
  }[]>(`/class/members/${classId}`);

  return res.data.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    email: m.email,
    roleInClass: (m.classRole as ClassRole) ?? 0,
  }));
}

/**
 * POST /api/class/member — добавить участника в класс.
 * Ожидаем, что на бэкенд отправляется classId, email и роль в классе.
 * При необходимости отредактируйте под вашу фактическую реализацию.
 */
export async function addMemberToClass(
  classId: string,
  payload: { email: string; role: ClassRole }
): Promise<void> {
  const memberClassRole = payload.role === 1 ? "Teacher" : "Student";

  await api.put(`/class/members/${classId}`, null, {
    params: {
      memberEmail: payload.email,
      memberClassRole,
    },
  });
}

/**
 * DELETE /api/class/members/{classId}?memberId=... — удалить участника из класса.
 */
export async function deleteMemberFromClass(
  classId: string,
  memberId: string
): Promise<void> {
  await api.delete(`/class/members/${classId}`, {
    params: { memberId },
  });
}
