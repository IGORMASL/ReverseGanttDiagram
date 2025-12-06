/**
 * Константы приложения
 */

// Цвета по умолчанию
export const DEFAULT_CLASS_COLOR = "#C6D3E1";

// Роли пользователей
export const USER_ROLES = {
  USER: 0,
  ADMIN: 1,
} as const;

// Роли в классе
export const CLASS_ROLES = {
  STUDENT: 0,
  TEACHER: 1,
} as const;

// Статусы проектов
export const PROJECT_STATUS = {
  PLANNED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
} as const;

// Метки статусов проектов
export const PROJECT_STATUS_LABELS: Record<number, string> = {
  0: "Запланировано",
  1: "Выполняется",
  2: "Завершено",
};

// Метки ролей в классе
export const CLASS_ROLE_LABELS: Record<number, string> = {
  0: "Студент",
  1: "Учитель",
};

