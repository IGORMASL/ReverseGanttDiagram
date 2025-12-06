// src/api/projects.ts
import api from "./axios";
import { PROJECT_STATUS_LABELS } from "../constants";

// ---- Типы -----------------------------------------------------------------

export type ProjectStatus = 0 | 1 | 2; // Planned = 0, InProgress = 1, Completed = 2

// Экспортируем метки статусов из constants
export const ProjectStatusLabels = PROJECT_STATUS_LABELS;

export type Project = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  classId: string;
  // Для студентов (из UserClassProjectViewModel)
  teamId?: string;
  solutionId?: string;
};

export type ProjectCreateDto = {
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ProjectStatus;
  classId: string;
};

export type ProjectUpdateDto = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  classId: string;
};

// ---- API ------------------------------------------------------------------

/**
 * GET /api/project/class/{classId} — проекты класса (для админов и учителей).
 */
export async function getClassProjects(classId: string): Promise<Project[]> {
  const res = await api.get<Project[]>(`/project/class/${classId}`);
  return res.data;
}

/**
 * GET /api/project/class/{classId}/user — проекты класса для текущего пользователя (для студентов).
 * Возвращает проекты с teamId и solutionId.
 */
export async function getUserClassProjects(classId: string): Promise<Project[]> {
  const res = await api.get<{
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
    teamId: string;
    solutionId: string;
  }[]>(`/project/class/${classId}/user`);
  
  console.log("Raw response from getUserClassProjects:", res.data);
  
  // Добавляем classId к каждому проекту
  const projects = res.data.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    status: p.status,
    classId,
    teamId: p.teamId,
    solutionId: p.solutionId,
  }));
  
  console.log("Mapped projects:", projects);
  
  return projects;
}

/**
 * POST /api/project — создание проекта.
 * В теле: title, description, startDate, endDate, status, classId.
 */
export async function createProject(payload: ProjectCreateDto): Promise<void> {
  await api.post("/project", payload);
}

/**
 * PUT /api/project?projectId=... — обновление проекта.
 * projectId передаётся как query-параметр, в теле — ProjectUpdateDto.
 */
export async function updateProject(
  projectId: string,
  payload: ProjectUpdateDto
): Promise<void> {
  await api.put("/project", payload, {
    params: { projectId },
  });
}

/**
 * DELETE /api/project?projectId=... — удаление проекта.
 */
export async function deleteProject(projectId: string): Promise<void> {
  await api.delete("/project", {
    params: { projectId },
  });
}

/**
 * GET /api/project/{projectId} — данные конкретного проекта.
 */
export async function getProjectById(projectId: string): Promise<Project> {
  const res = await api.get<Project>(`/project/${projectId}`);
  return res.data;
}

