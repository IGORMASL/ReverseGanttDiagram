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

// Тип для ответа API (плоский список задач)
type TaskApiResponse = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: TaskType;
  status: TaskStatus;
  parentTaskId?: string | null; // API возвращает ParentTaskId, но JSON сериализуется как parentTaskId
  assignedUsers: TaskAssignee[];
  dependencies: string[];
};

export type TaskCreateDto = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: TaskType;
  status: TaskStatus;
  parentTaskId?: string | null;
  solutionId: string;
  dependencies: string[];
  assignedUsers: string[];
};

export type TaskUpdateDto = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: TaskType;
  status: TaskStatus;
  parentTaskId?: string | null;
  dependencies: string[];
  assignedUsers: string[];
};

export const TaskStatusLabels = TASK_STATUS_LABELS;
export const TaskTypeLabels = TASK_TYPE_LABELS;

/**
 * Преобразует плоский список задач в дерево на основе parentId
 */
function buildTaskTree(tasks: TaskApiResponse[]): TaskTree[] {
  const taskMap = new Map<string, TaskTree>();
  const rootTasks: TaskTree[] = [];

  // Сначала создаём все узлы без связей
  tasks.forEach((task) => {
    const taskNode: TaskTree = {
      id: task.id,
      title: task.title,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      type: task.type,
      status: task.status,
      assignedUsers: task.assignedUsers ?? [],
      dependencies: task.dependencies ?? [],
      subtasks: [],
      parentTaskId: task.parentTaskId ?? null,
    };
    taskMap.set(task.id, taskNode);
  });

  // Затем связываем узлы в дерево
  tasks.forEach((task) => {
    const taskNode = taskMap.get(task.id)!;
    const parentId = task.parentTaskId;

    if (parentId && taskMap.has(parentId)) {
      // Задача имеет родителя - добавляем в subtasks родителя
      const parent = taskMap.get(parentId)!;
      parent.subtasks.push(taskNode);
    } else {
      // Задача без родителя или родитель не найден - добавляем в корень
      rootTasks.push(taskNode);
    }
  });

  return rootTasks;
}

const normalizeTask = (task: TaskTree): TaskTree => ({
  ...task,
  assignedUsers: task.assignedUsers ?? [],
  dependencies: task.dependencies ?? [],
  subtasks: (task.subtasks ?? []).map(normalizeTask),
});

/**
 * GET /api/task/team/{teamId} — получение задач команды (плоский список, преобразуется в дерево).
 */
export async function getTeamTasks(teamId: string): Promise<TaskTree[]> {
  const res = await api.get<any[]>(`/task/team/${teamId}`);
  const tasks = res.data ?? [];
  
  // Нормализуем данные: проверяем оба варианта имени поля (parentTaskId или parentId)
  const normalizedTasks: TaskApiResponse[] = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    type: task.type,
    status: task.status,
    parentTaskId: task.parentTaskId ?? task.parentId ?? null, // Поддержка обоих вариантов
    assignedUsers: task.assignedUsers ?? [],
    dependencies: task.dependencies ?? [],
  }));
  
  const tree = buildTaskTree(normalizedTasks);
  return tree.map(normalizeTask);
}

/**
 * POST /api/task — создание задачи.
 */
export async function createTask(dto: TaskCreateDto): Promise<TaskTree> {
  const res = await api.post<TaskApiResponse>("/task", {
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate,
    type: dto.type,
    status: dto.status,
    parentTaskId: dto.parentTaskId ?? null,
    solutionId: dto.solutionId,
    dependencies: dto.dependencies,
    assignedUsers: dto.assignedUsers,
  });
  
  // Преобразуем в TaskTree
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.description,
    startDate: res.data.startDate,
    endDate: res.data.endDate,
    type: res.data.type,
    status: res.data.status,
    assignedUsers: res.data.assignedUsers ?? [],
    dependencies: res.data.dependencies ?? [],
    subtasks: [],
    parentTaskId: res.data.parentTaskId ?? null,
  };
}

/**
 * PUT /api/task/{taskId} — обновление задачи.
 */
export async function updateTask(taskId: string, dto: TaskUpdateDto): Promise<TaskTree> {
  const res = await api.put<TaskApiResponse>(`/task/${taskId}`, {
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate,
    type: dto.type,
    status: dto.status,
    parentTaskId: dto.parentTaskId ?? null,
    dependencies: dto.dependencies,
    assignedUsers: dto.assignedUsers,
  });
  
  // Преобразуем в TaskTree
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.description,
    startDate: res.data.startDate,
    endDate: res.data.endDate,
    type: res.data.type,
    status: res.data.status,
    assignedUsers: res.data.assignedUsers ?? [],
    dependencies: res.data.dependencies ?? [],
    subtasks: [],
    parentTaskId: res.data.parentTaskId ?? null,
  };
}

/**
 * DELETE /api/task/{taskId} — удаление задачи.
 */
export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/task/${taskId}`);
}

/**
 * GET /api/task/{taskId} — получение задачи по ID.
 */
export async function getTaskById(taskId: string): Promise<TaskTree> {
  const res = await api.get<TaskApiResponse>(`/task/${taskId}`);
  
  // Преобразуем в TaskTree
  return {
    id: res.data.id,
    title: res.data.title,
    description: res.data.description,
    startDate: res.data.startDate,
    endDate: res.data.endDate,
    type: res.data.type,
    status: res.data.status,
    assignedUsers: res.data.assignedUsers ?? [],
    dependencies: res.data.dependencies ?? [],
    subtasks: [],
    parentTaskId: res.data.parentTaskId ?? null,
  };
}


