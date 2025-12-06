/**
 * Утилиты для проверки прав доступа
 */

import type { CurrentUser, ClassRole } from "../types";
import type { ClassMember } from "../api/classes";

/**
 * Проверяет, является ли пользователь системным админом
 */
export function isSystemAdmin(user: CurrentUser | null): boolean {
  return user?.role === 1;
}

/**
 * Проверяет, является ли пользователь учителем в классе
 */
export function isTeacherInClass(
  userEmail: string,
  members: ClassMember[]
): boolean {
  return members.some(
    (m) => m.email === userEmail && m.roleInClass === 1
  );
}

/**
 * Проверяет, может ли пользователь управлять классом/проектом
 * (системный админ или учитель в классе)
 */
export function canManageClass(
  user: CurrentUser | null,
  members: ClassMember[]
): boolean {
  if (!user) return false;
  return isSystemAdmin(user) || isTeacherInClass(user.email, members);
}

