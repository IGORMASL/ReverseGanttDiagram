/**
 * Хук для работы с деталями класса
 */

import { useState, useEffect } from "react";
import {
  getClassDetails,
  getClassMembers,
  deleteClass,
  updateClass,
  type ClassDetails,
} from "../api/classes";
import {
  getClassProjects,
  getUserClassProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "../api/projects";
import { canManageClass } from "../utils/permissions";
import { getErrorMessage } from "../utils/errorHandling";
import type { CurrentUser } from "../types";

interface UseClassDetailsOptions {
  classId: string | undefined;
  user: CurrentUser | null;
}

export function useClassDetails({ classId, user }: UseClassDetailsOptions) {
  const [details, setDetails] = useState<ClassDetails | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId || !user) return;

      try {
        const [classData, members] = await Promise.all([
          getClassDetails(classId),
          getClassMembers(classId),
        ]);

        const canManageClassValue = canManageClass(user, members);
        setCanManage(canManageClassValue);

        // Загружаем проекты
        let projectsData: Project[] = [];
        try {
          if (canManageClassValue) {
            projectsData = await getClassProjects(classId);
          } else {
            projectsData = await getUserClassProjects(classId);
            console.log("Проекты для студента:", projectsData);
          }
        } catch (err: any) {
          console.error("Ошибка загрузки проектов:", err);
          if (err?.response?.status === 403) {
            console.warn(
              "Доступ запрещен. Убедитесь, что студент добавлен в команду и является участником класса."
            );
          }
          projectsData = [];
        }

        const nextDetails: ClassDetails = {
          ...classData,
          projects: classData.projects ?? [],
          members,
        };

        setProjects(projectsData);
        setDetails(nextDetails);
      } catch (err) {
        console.error("Ошибка загрузки класса:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, user]);

  const handleDeleteClass = async () => {
    if (!details) return;

    try {
      await deleteClass(details.id);
      return true;
    } catch (err) {
      console.error("Ошибка удаления класса:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleUpdateClass = async (data: {
    title: string;
    description: string;
    color: string;
  }) => {
    if (!details) return;

    try {
      const updated = await updateClass(details.id, data);
      setDetails((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              description: updated.description ?? "",
              color: updated.color ?? data.color,
            }
          : prev
      );
      return true;
    } catch (err) {
      console.error("Ошибка при изменении класса:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleCreateProject = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Project["status"];
  }) => {
    if (!classId) return;

    try {
      await createProject({
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        status: data.status,
        classId,
      });

      // Перезагружаем список проектов
      const updatedProjects = await getClassProjects(classId);
      setProjects(updatedProjects);
      return true;
    } catch (err) {
      console.error("Ошибка при создании проекта:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleUpdateProject = async (
    projectId: string,
    data: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      status: Project["status"];
    }
  ) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await updateProject(projectId, {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        status: data.status,
        classId: project.classId,
      });

      // Перезагружаем список проектов
      const updatedProjects = await getClassProjects(project.classId);
      setProjects(updatedProjects);
      return true;
    } catch (err) {
      console.error("Ошибка при изменении проекта:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    } catch (err) {
      console.error("Ошибка при удалении проекта:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  return {
    details,
    setDetails,
    projects,
    loading,
    error,
    canManage,
    handleDeleteClass,
    handleUpdateClass,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
  };
}

