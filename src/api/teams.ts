// src/api/teams.ts
import api from "./axios";

// ---- Типы -----------------------------------------------------------------

export type Team = {
  id: string;
  name: string;
  projectId: string;
  members?: TeamMember[]; // Участники команды (если есть)
};

export type TeamMember = {
  userId: string;
  fullName: string;
  email: string;
};

export type TeamWithMembers = {
  id: string;
  name: string;
  projectId: string;
  members: TeamMember[];
};

export type TeamCreateDto = {
  name: string;
  projectId: string;
};

// ---- API ------------------------------------------------------------------

/**
 * POST /api/team — создание команды.
 */
export async function createTeam(payload: TeamCreateDto): Promise<void> {
  await api.post("/team", payload);
}

/**
 * GET /api/team/project?projectId=... — получение всех команд проекта (для админа/учителя).
 * Теперь возвращает команды с участниками.
 */
export async function getProjectTeams(projectId: string): Promise<Team[]> {
  const res = await api.get<{
    id: string;
    name: string;
    projectId: string;
    members: {
      id: string; // userId
      fullName: string;
      email: string;
      classRole: number;
    }[];
  }[]>("/team/project", {
    params: { projectId },
  });
  
  return res.data.map((team) => ({
    id: team.id,
    name: team.name,
    projectId: team.projectId,
    members: team.members.map((m) => ({
      userId: m.id,
      fullName: m.fullName,
      email: m.email,
    })),
  }));
}

/**
 * GET /api/team/{teamId} — получение команды с участниками.
 * Доступно для админа, участников команды и учителей класса.
 */
export async function getTeamById(teamId: string): Promise<TeamWithMembers> {
  const res = await api.get<{
    id: string;
    name: string;
    projectId: string;
    members: {
      id: string; // userId
      fullName: string;
      email: string;
    }[];
  }>(`/team/${teamId}`);
  
  return {
    id: res.data.id,
    name: res.data.name,
    projectId: res.data.projectId,
    members: res.data.members.map((m) => ({
      userId: m.id,
      fullName: m.fullName,
      email: m.email,
    })),
  };
}

/**
 * PUT /api/team/members?teamId=...&userId=... — добавление участника в команду.
 */
export async function addTeamMember(teamId: string, userId: string): Promise<void> {
  await api.put("/team/members", null, {
    params: { teamId, userId },
  });
}

