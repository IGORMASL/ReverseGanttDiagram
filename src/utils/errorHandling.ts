/**
 * Утилиты для обработки ошибок
 */

import { AxiosError } from "axios";

/**
 * Извлекает сообщение об ошибке из ответа API или объекта ошибки
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Если это AxiosError, пытаемся извлечь сообщение из ответа
    if ("response" in error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return (
        axiosError.response?.data?.message ??
        axiosError.response?.data ??
        axiosError.message ??
        "Произошла ошибка"
      );
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
export function isForbiddenError(error: unknown): boolean {
  if ("response" in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}

/**
 * Проверяет, является ли ошибка ошибкой валидации (400)
 */
export function isValidationError(error: unknown): boolean {
  if ("response" in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 400;
  }
  return false;
}

