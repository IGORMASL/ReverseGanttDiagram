// src/api/tasks.ts
import api from "./axios";
import { TASK_STATUS_LABELS, TASK_TYPE_LABELS } from "../constants";

export type TaskStatus = 0 | 1 | 2; // Planned = 0, InProgress = 1, Completed = 2
export type TaskType = 0 | 1 | 2; // Result = 0, Task = 1, Subtask = 2

export type TaskAssignee = {
  id: string;
  fullName: string;
  email?: string;
  role?: number;
};

export type TaskTree = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: TaskType;
  status: TaskStatus;
  assignedUsers: TaskAssignee[];
  dependencies: string[];
  subtasks: TaskTree[];
  parentTaskId?: string | null;
};

export const TaskStatusLabels = TASK_STATUS_LABELS;
export const TaskTypeLabels = TASK_TYPE_LABELS;

const normalizeTask = (task: TaskTree): TaskTree => ({
  ...task,
  assignedUsers: task.assignedUsers ?? [],
  dependencies: task.dependencies ?? [],
  subtasks: (task.subtasks ?? []).map(normalizeTask),
});

/**
 * GET /api/task/team/{teamId} — дерево задач команды.
 */
export async function getTeamTasks(teamId: string): Promise<TaskTree[]> {
  const res = await api.get<TaskTree[]>(`/task/team/${teamId}`);
  const tasks = res.data ?? [];
  return tasks.map(normalizeTask);
}


