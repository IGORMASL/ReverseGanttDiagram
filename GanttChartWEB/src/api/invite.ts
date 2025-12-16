import api from "./axios";

export type InviteCreateDto = {
  isTeacherInvite: boolean;
  expireHours: number;
  isMultiUse: boolean;
};

export type InviteCreateResponse = {
  inviteId: string;
  link: string;
};

/**
 * POST /api/invite/create?classId=...
 * Создание приглашения в класс.
 */
export async function createInvite(
  classId: string,
  payload: InviteCreateDto
): Promise<InviteCreateResponse> {
  const res = await api.post<InviteCreateResponse>("/invite/create", payload, {
    params: { classId },
  });
  return res.data;
}

/**
 * POST /api/invite/{inviteId}
 * Использование приглашения для присоединения к классу.
 */
export async function useInvite(inviteId: string): Promise<string> {
  const res = await api.post<string>(`/invite/${inviteId}`);
  return res.data;
}


