/**
 * Хук для работы с проектом и командами
 */

import { useState, useEffect } from "react";
import {
  getProjectById,
  getUserClassProjects,
  updateProject,
  deleteProject,
  type Project,
} from "../api/projects";
import {
  getProjectTeams,
  createTeam,
  addTeamMember,
  getTeamById,
  type Team,
  type TeamWithMembers,
} from "../api/teams";
import { getClassMembers, type ClassMember } from "../api/classes";
import { canManageClass } from "../utils/permissions";
import { getErrorMessage } from "../utils/errorHandling";
import type { CurrentUser } from "../types";

interface UseProjectOptions {
  projectId: string | undefined;
  classId: string | undefined;
  user: CurrentUser | null;
}

export function useProject({ projectId, classId, user }: UseProjectOptions) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Для админа/учителя
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsWithMembers, setTeamsWithMembers] = useState<
    Map<string, TeamWithMembers>
  >(new Map());
  const [canManage, setCanManage] = useState(false);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);

  // Для студента
  const [myTeam, setMyTeam] = useState<TeamWithMembers | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !classId || !user) return;

      try {
        // Определяем, может ли пользователь управлять проектом
        const members = await getClassMembers(classId);
        const canManageProject = canManageClass(user, members);
        setCanManage(canManageProject);
        setClassMembers(members);

        // Загружаем проект (разные способы для админа/учителя и студента)
        let projectData: Project;
        if (canManageProject) {
          projectData = await getProjectById(projectId);
        } else {
          const userProjects = await getUserClassProjects(classId);
          const foundProject = userProjects.find((p) => p.id === projectId);
          if (!foundProject) {
            throw new Error("Проект не найден или у вас нет доступа к нему");
          }
          projectData = foundProject;
        }
        setProject(projectData);

        // Загружаем команды
        if (canManageProject) {
          try {
            const teamsData = await getProjectTeams(projectId);
            setTeams(teamsData);

            const teamsMembersMap = new Map<string, TeamWithMembers>();
            teamsData.forEach((team) => {
              teamsMembersMap.set(team.id, {
                id: team.id,
                name: team.name,
                projectId: team.projectId,
                members: team.members ?? [],
              });
            });
            setTeamsWithMembers(teamsMembersMap);
          } catch (err) {
            console.warn("Не удалось загрузить команды проекта:", err);
            setTeams([]);
          }
        } else {
          // Для студента загружаем его команду через getTeamById
          if (projectData.teamId) {
            try {
              const teamData = await getTeamById(projectData.teamId);
              setMyTeam(teamData);
            } catch (err) {
              console.warn("Не удалось загрузить команду:", err);
              // Если не удалось загрузить, создаём заглушку
              setMyTeam({
                id: projectData.teamId,
                name: "Моя команда",
                projectId: projectId,
                members: [],
              });
            }
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки проекта:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, classId, user]);

  const refreshTeams = async () => {
    if (!projectId) return;

    try {
      const teamsData = await getProjectTeams(projectId);
      setTeams(teamsData);

      const teamsMembersMap = new Map<string, TeamWithMembers>();
      teamsData.forEach((team) => {
        teamsMembersMap.set(team.id, {
          id: team.id,
          name: team.name,
          projectId: team.projectId,
          members: team.members ?? [],
        });
      });
      setTeamsWithMembers(teamsMembersMap);
    } catch (err) {
      console.warn("Не удалось перезагрузить команды:", err);
    }
  };

  const handleCreateTeam = async (name: string) => {
    if (!projectId || !name.trim()) return;

    try {
      await createTeam({
        name: name.trim(),
        projectId,
      });
      await refreshTeams();
      return true;
    } catch (err) {
      console.error("Ошибка при создании команды:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleAddMemberToTeam = async (teamId: string, userId: string) => {
    try {
      await addTeamMember(teamId, userId);
      await refreshTeams();
      return true;
    } catch (err) {
      console.error("Ошибка при добавлении участника:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleUpdateProject = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 0 | 1 | 2;
  }) => {
    if (!projectId || !classId) return;

    try {
      await updateProject(projectId, {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        classId,
      });

      // Перезагружаем данные проекта
      const updatedProject = await getProjectById(projectId);
      setProject(updatedProject);
      return true;
    } catch (err) {
      console.error("Ошибка при обновлении проекта:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    try {
      await deleteProject(projectId);
      return true;
    } catch (err) {
      console.error("Ошибка при удалении проекта:", err);
      throw new Error(getErrorMessage(err));
    }
  };

  return {
    project,
    loading,
    error,
    teams,
    teamsWithMembers,
    canManage,
    classMembers,
    myTeam,
    handleCreateTeam,
    handleAddMemberToTeam,
    handleUpdateProject,
    handleDeleteProject,
    refreshTeams,
  };
}

