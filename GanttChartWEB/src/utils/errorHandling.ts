/**
 * Утилиты для обработки ошибок
 */

import { AxiosError } from "axios";

function translateKnownMessage(message: string): string {
  const trimmed = message.trim();

  if (trimmed === "Invalid email or password." || trimmed === "Invalid email or password") {
    return "Неверный email или пароль";
  }

  if (trimmed === "Email is already in use." || trimmed === "Email is already in use") {
    return "Пользователь с таким email уже зарегистрирован";
  }

  return message;
}

/**
 * Извлекает сообщение об ошибке из ответа API или объекта ошибки
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Если это AxiosError, пытаемся извлечь сообщение из ответа
    if ("response" in error) {
      const axiosError = error as AxiosError<
        | { error?: string; message?: string }
        | string
        | undefined
      >;

      const data = axiosError.response?.data;

      // Бэкенд всегда отдает ошибки в формате { error: "..." }
      if (data && typeof data === "object" && "error" in data) {
        const message = (data as { error?: string }).error;
        if (message) {
          return translateKnownMessage(message);
        }
      }

      // На всякий случай поддерживаем поле message или строковый ответ
      if (data && typeof data === "object" && "message" in data) {
        const message = (data as { message?: string }).message;
        if (message) {
          return translateKnownMessage(message);
        }
      }

      if (typeof data === "string") {
        return translateKnownMessage(data);
      }

      // Если сервер не прислал тела с сообщением, не показываем техническое
      // сообщение Axios ("Request failed with status code ..."), а даём
      // нейтральный текст без цифр и англоязычных статусов.
      return "Произошла ошибка";
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Произошла неизвестная ошибка";
}

/**
 * Проверяет, является ли ошибка ошибкой доступа (403)
 */
/*
export function isForbiddenError(error: unknown): boolean {
  if ("response" in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}
*/
/**
 * Проверяет, является ли ошибка ошибкой валидации (400)
 */
/*
export function isValidationError(error: unknown): boolean {
  if ("response" in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 400;
  }
  return false;
}
*/
