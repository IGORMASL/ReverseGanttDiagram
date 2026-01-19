import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import Button from "../components/Button";
import Input from "../components/Input";
import ProjectModal from "../components/ProjectModal";
import { ProjectStatusLabels } from "../api/projects";
import { useAuth } from "../hooks/useAuth";
import { useProject } from "../hooks/useProject";
import { isSystemAdmin } from "../utils/permissions";
import GanttChart from "../components/GanttChart";
import {
  TaskStatusLabels,
  TaskTypeLabels,
  type TaskAssignee,
  type TaskTree,
  type TaskType,
  type TaskStatus,
  getTeamTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskApi,
} from "../api/tasks";
import { useNotification } from "../components/NotificationProvider";

export default function ProjectPage() {
  const { projectId, classId } = useParams<{ projectId: string; classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const {
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
    handleDeleteMemberFromTeam,
    handleUpdateProject,
    handleDeleteProject,
  } = useProject({ projectId, classId, user });

  // UI состояние
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<string | null>(null);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<Record<string, TaskTree[]>>({});
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<TaskTree | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskTree | null>(null);

  type TaskPanelMode = "idle" | "view" | "edit";
  const [panelMode, setPanelMode] = useState<TaskPanelMode>("idle");

  // Локальное состояние формы задачи (ранее было в TaskModal)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<TaskType>(0);
  const [status, setStatus] = useState<TaskStatus>(0);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  const isAdmin = isSystemAdmin(user);

  // Автовыбор первой команды для просмотра задач (для учителя/админа)
  useEffect(() => {
    if (canManage && teams.length > 0) {
      const stillExists = selectedTeamId && teams.some((t) => t.id === selectedTeamId);
      if (!stillExists) {
        setSelectedTeamId(teams[0].id);
      }
    }
  }, [canManage, teams, selectedTeamId]);

  const targetTeamId = canManage ? selectedTeamId ?? undefined : myTeam?.id;
  const teamTasks = useMemo(() => {
    if (!targetTeamId) return [];
    return localTasks[targetTeamId] ?? [];
  }, [localTasks, targetTeamId]);

  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Вспомогательные структуры для формы задач (аналогично TaskModal)
  const flattenTasks = (tasks: TaskTree[]): TaskTree[] => {
    const result: TaskTree[] = [];
    const stack = [...tasks];
    while (stack.length) {
      const current = stack.pop()!;
      result.push(current);
      if (current.subtasks && current.subtasks.length > 0) {
        stack.push(...current.subtasks);
      }
    }
    return result;
  };

  const flatTasksForForm = useMemo(() => flattenTasks(teamTasks), [teamTasks]);

  // Приводим дату задачи к формату yyyy-MM-dd по локальному времени
  const formatDateForInput = (value: string) => {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Сортировка задач и подзадач по дате начала, чтобы порядок на диаграмме
  // и в списке был стабильным и логичным (вариант B: всегда по startDate).
  const sortTasksByStart = (list: TaskTree[]): TaskTree[] => {
    return [...list]
      .map((t) => ({
        ...t,
        subtasks: sortTasksByStart(t.subtasks ?? []),
      }))
      .sort((a, b) => {
        const aTime = new Date(a.startDate).getTime();
        const bTime = new Date(b.startDate).getTime();
        return aTime - bTime;
      });
  };

  // Загрузка задач с API при изменении команды
  useEffect(() => {
    if (!targetTeamId) {
      setLocalTasks((prev) => ({ ...prev }));
      return;
    }

    const loadTasks = async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const tasks = await getTeamTasks(targetTeamId);
        setLocalTasks((prev) => ({
          ...prev,
          [targetTeamId]: sortTasksByStart(tasks),
        }));
      } catch (err: any) {
        console.error("Ошибка загрузки задач:", err);
        setTasksError(err.message || "Не удалось загрузить задачи");
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, [targetTeamId]);

  const dependencyOptions = useMemo(() => {
    const selfId = editingTask?.id;

    return flatTasksForForm.filter((t) => {
      if (t.id === selfId) return false;
      if (t.type !== type) return false;
      
      // Зависимости можно выбирать только в пределах одного родительского блока
      if (t.parentTaskId !== parentTaskId) return false;
      
      // Если дата начала текущей задачи не выбрана, не фильтруем по времени
      if (!startDate) return true;
      
      // Нельзя начинать задачу после той, которая заканчивается позже или в тот же день, что и начало текущей
      // Сравниваем только даты без учета времени и часовых поясов
      const dependencyEndDate = t.endDate.slice(0, 10); // Берем только дату из YYYY-MM-DD...
      const currentStartDate = startDate; // Уже в формате YYYY-MM-DD
      return dependencyEndDate < currentStartDate;
    });
  }, [flatTasksForForm, editingTask?.id, type, startDate, parentTaskId]);

  const parentOptions = useMemo(() => {
    const selfId = editingTask?.id;
    return flatTasksForForm.filter((t) => {
      if (t.id === selfId) return false;

      // type === 1 ("задача") — обязательно должен быть родитель типа "результат" (0)
      if (type === 1) {
        return t.type === 0;
      }

      // type === 2 ("подзадача") — родителем может быть только задача (type === 1)
      if (type === 2) {
        return t.type === 1;
      }

      // для результата (type === 0) родителя быть не должно
      return false;
    });
  }, [flatTasksForForm, editingTask?.id, type]);

  // Гарантируем, что при создании/редактировании задачи типа 1 или 2
  // в state всегда актуальный parentTaskId, соответствующий доступным parentOptions.
  useEffect(() => {
    if (type !== 1 && type !== 2) {
      // Для результата родитель не нужен
      if (parentTaskId !== null) {
        setParentTaskId(null);
      }
      return;
    }

    if (parentOptions.length === 0) {
      // Нет доступных родителей — явно держим parentTaskId пустым
      if (parentTaskId !== null) {
        setParentTaskId(null);
      }
      return;
    }

    const existsInOptions = parentTaskId
      ? parentOptions.some((t) => t.id === parentTaskId)
      : false;

    // Если родитель ещё не выбран или текущий id выпал из списка опций,
    // автоматически выбираем первого доступного родителя.
    if (!existsInOptions) {
      setParentTaskId(parentOptions[0].id);
    }
  }, [type, parentOptions, parentTaskId]);

  const toggleSelection = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/*
  const deleteTask = (teamId: string, taskId: string) => {
    setLocalTasks((prev) => {
      const current = prev[teamId] ?? [];
      const removeRecursive = (list: TaskTree[]): TaskTree[] =>
        list
          .filter((t) => t.id !== taskId)
          .map((t) => ({ ...t, subtasks: removeRecursive(t.subtasks ?? []) }));
      return { ...prev, [teamId]: removeRecursive(current) };
    });
  };
*/
  const teamNameForChart = canManage
    ? teams.find((t) => t.id === selectedTeamId)?.name
    : myTeam?.name;

  const openCreateTask = () => {
    if (!targetTeamId) {
      showNotification("Сначала выберите команду", "info");
      return;
    }
    setTaskModalMode("create");
    setEditingTask(null);
    setSelectedTask(null);

    const today = new Date().toISOString().slice(0, 10);
    setTitle("");
    setDescription("");
    setStartDate(today);
    setEndDate(today);
    setType(0);
    setStatus(0);
    setSelectedDependencies([]);
    setSelectedAssignees([]);
    setParentTaskId(null);

    setPanelMode("edit");
  };

  const handleCreateChildTask = (parent: TaskTree) => {
    if (!targetTeamId) {
      showNotification("Сначала выберите команду", "info");
      return;
    }

    setTaskModalMode("create");
    setEditingTask(null);
    setSelectedTask(null);

    const today = formatDateForInput(new Date().toISOString());

    setTitle("");
    setDescription("");
    setStartDate(today);
    setEndDate(today);

    if (parent.type === 0) {
      // Для результата создаём задачу
      setType(1);
    } else if (parent.type === 1) {
      // Для задачи создаём подзадачу
      setType(2);
    }

    setStatus(0);
    setSelectedDependencies([]);
    setSelectedAssignees([]);
    setParentTaskId(parent.id);

    setPanelMode("edit");
  };

  const openEditTask = (task: TaskTree) => {
    setEditingTask(task);
    setTaskModalMode("edit");
    setSelectedTask(task);

    setTitle(task.title);
    setDescription(task.description ?? "");
    setStartDate(formatDateForInput(task.startDate));
    setEndDate(formatDateForInput(task.endDate));
    setType(task.type as TaskType);
    setStatus(task.status as TaskStatus);
    setSelectedDependencies(task.dependencies ?? []);
    setSelectedAssignees(task.assignedUsers?.map((u) => u.id) ?? []);
    setParentTaskId(task.parentTaskId ?? null);

    setPanelMode("edit");
  };

  const currentMembers: TaskAssignee[] = useMemo(() => {
    if (canManage && selectedTeamId) {
      const teamWithMembers = teamsWithMembers.get(selectedTeamId);
      return teamWithMembers?.members?.map((m) => ({
        id: m.userId,
        fullName: m.fullName,
        email: m.email,
      })) ?? [];
    }
    if (!canManage && myTeam) {
      return myTeam.members.map((m) => ({
        id: m.userId,
        fullName: m.fullName,
        email: m.email,
      }));
    }
    return [];
  }, [canManage, selectedTeamId, teamsWithMembers, myTeam]);

  // Получаем solutionId для текущей команды
  const getSolutionId = (): string | null => {
    if (!targetTeamId) return null;
    
    if (canManage) {
      const team = teams.find((t) => t.id === targetTeamId);
      return team?.solutionId ?? null;
    } else {
      return myTeam?.solutionId ?? null;
    }
  };

  // Функция для перезагрузки задач
  const reloadTasks = async () => {
    if (!targetTeamId) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const tasks = await getTeamTasks(targetTeamId);
      setLocalTasks((prev) => ({
        ...prev,
        [targetTeamId]: sortTasksByStart(tasks),
      }));
    } catch (err: any) {
      console.error("Ошибка загрузки задач:", err);
      setTasksError(err.message || "Не удалось загрузить задачи");
    } finally {
      setTasksLoading(false);
    }
  };

  const onSubmitTask = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: number;
    status: number;
    dependencies: string[];
    assignedUserIds: string[];
    parentTaskId?: string | null;
  }): Promise<TaskTree | undefined> => {
    if (!targetTeamId) return;

    const solutionId = getSolutionId();
    if (!solutionId) {
      throw new Error("Не удалось определить решение команды");
    }

    if (taskModalMode === "create") {
      // Создаём задачу через API
      // Добавляем время UTC чтобы избежать проблем с часовыми поясами
      const utcStartDate = data.startDate + 'T00:00:00Z';
      const utcEndDate = data.endDate + 'T00:00:00Z';
      await createTask({
        title: data.title,
        description: data.description,
        startDate: utcStartDate,
        endDate: utcEndDate,
        type: data.type as TaskType,
        status: data.status as TaskStatus,
        parentTaskId: data.parentTaskId ?? null,
        solutionId,
        dependencies: data.dependencies,
        assignedUsers: data.assignedUserIds,
      });

      // Перезагружаем задачи с сервера для получения актуального дерева
      const tasks = await getTeamTasks(targetTeamId);
      setLocalTasks((prev) => ({
        ...prev,
        [targetTeamId]: sortTasksByStart(tasks),
      }));
      
      // Находим созданную задачу в дереве (по title и startDate)
      const findCreatedTask = (list: TaskTree[]): TaskTree | null => {
        for (const task of list) {
          if (task.title === data.title && task.startDate.slice(0, 10) === data.startDate) {
            return task;
          }
          const found = findCreatedTask(task.subtasks ?? []);
          if (found) return found;
        }
        return null;
      };
      
      return findCreatedTask(tasks) ?? undefined;
    } else if (editingTask) {
      // Обновляем задачу через API
      // Для задач и подзадач нельзя менять родителя - используем исходное значение
      const finalParentTaskId = 
        (editingTask.type === 1 || editingTask.type === 2) 
          ? editingTask.parentTaskId ?? null  // Используем исходное значение
          : data.parentTaskId ?? null;        // Для результатов можно менять
      
      await updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        startDate: data.startDate + 'T00:00:00Z',
        endDate: data.endDate + 'T00:00:00Z',
        type: data.type as TaskType,
        status: data.status as TaskStatus,
        parentTaskId: finalParentTaskId,
        dependencies: data.dependencies,
        assignedUsers: data.assignedUserIds,
      });

      // Перезагружаем задачи с сервера для получения актуального дерева
      const tasks = await getTeamTasks(targetTeamId);
      setLocalTasks((prev) => ({
        ...prev,
        [targetTeamId]: sortTasksByStart(tasks),
      }));
      
      // Находим обновлённую задачу в дереве (по id)
      const findUpdatedTask = (list: TaskTree[]): TaskTree | null => {
        for (const task of list) {
          if (task.id === editingTask.id) return task;
          const found = findUpdatedTask(task.subtasks ?? []);
          if (found) return found;
        }
        return null;
      };
      
      return findUpdatedTask(tasks) ?? undefined;
    }
    return undefined;
  };

  const onDeleteTask = async (task: TaskTree) => {
    if (!targetTeamId) return;
    if (!confirm(`Удалить задачу "${task.title}"?`)) return;
    
    try {
      await deleteTaskApi(task.id);
      
      // Обновляем локальное состояние
      setLocalTasks((prev) => {
        const current = prev[targetTeamId] ?? [];
        const removeRecursive = (list: TaskTree[]): TaskTree[] =>
          list
            .filter((t) => t.id !== task.id)
            .map((t) => ({ ...t, subtasks: removeRecursive(t.subtasks ?? []) }));
        return {
          ...prev,
          [targetTeamId]: removeRecursive(current),
        };
      });
      
      setSelectedTask((prev) => (prev && prev.id === task.id ? null : prev));
      if (selectedTask && selectedTask.id === task.id) {
        setPanelMode("idle");
      }
    } catch (err: any) {
      console.error("Ошибка при удалении задачи:", err);
      showNotification(err.message || "Не удалось удалить задачу", "error");
    }
  };

  const handleSelectTask = (task: TaskTree) => {
    setSelectedTask((prev) => {
      if (prev && prev.id === task.id) {
        // Повторный клик по уже выбранной задаче — снимаем выделение
        setEditingTask(null);
        setPanelMode("idle");
        return null;
      }

      // Новый выбор задачи — показываем в правой панели
      setEditingTask(task);
      setPanelMode("view");
      return task;
    });
  };

  const handleTaskSave = async () => {
    if (!title.trim()) {
      showNotification("Название обязательно", "error");
      return;
    }
    if (!startDate || !endDate) {
      showNotification("Укажите даты", "error");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showNotification("Дата начала не может быть позже окончания", "error");
      return;
    }

    // Ограничение задач датами проекта (по календарным дням)
    const projectStart = new Date(formatDateForInput(project!.startDate));
    const projectEnd = new Date(formatDateForInput(project!.endDate));
    const taskStart = new Date(formatDateForInput(startDate));
    const taskEnd = new Date(formatDateForInput(endDate));

    if (taskStart < projectStart || taskEnd > projectEnd) {
      const projectStartStr = project!.startDate.slice(0, 10);
      const projectEndStr = project!.endDate.slice(0, 10);
      showNotification(
        `Даты задачи должны находиться в пределах дат проекта: с ${projectStartStr} по ${projectEndStr}.`,
        "error"
      );
      return;
    }

    // Ограничение дочерних задач датами родительской задачи (по календарным дням)
    if ((type === 1 || type === 2) && parentTaskId) {
      const parentTask = flatTasksForForm.find((t) => t.id === parentTaskId);
      if (parentTask) {
        const parentStart = new Date(formatDateForInput(parentTask.startDate));
        const parentEnd = new Date(formatDateForInput(parentTask.endDate));

        if (taskStart < parentStart || taskEnd > parentEnd) {
          showNotification(
            `Даты задачи должны находиться в пределах дат родительской задачи: с ${new Date(
              parentTask.startDate
            ).toLocaleDateString("ru-RU")} по ${new Date(
              parentTask.endDate
            ).toLocaleDateString("ru-RU")}.`,
            "error"
          );
          return;
        }
      }
    }

    // Валидация родителя в зависимости от типа
    if (type === 1 || type === 2) {
      if (!parentTaskId) {
        if (type === 1) {
          showNotification(
            "Для задачи типа \"задача\" необходимо выбрать родительскую задачу типа \"результат\". Сначала создайте задачу-результат.",
            "error"
          );
        } else if (type === 2) {
          showNotification(
            "Для задачи типа \"подзадача\" необходимо выбрать родительскую задачу типа \"задача\". Сначала создайте обычную задачу.",
            "error"
          );
        } else {
          showNotification("Для задачи этого типа необходимо выбрать родительскую задачу", "error");
        }
        return;
      }
    }

    setSavingTask(true);
    try {
      const result = await onSubmitTask({
        title: title.trim(),
        description,
        startDate,
        endDate,
        type,
        status,
        dependencies: selectedDependencies,
        assignedUserIds: selectedAssignees,
        parentTaskId,
      });

      if (taskModalMode === "edit" && result) {
        // переключаемся обратно в режим просмотра и показываем обновлённую задачу
        setSelectedTask(result);
        setEditingTask(result);
        setPanelMode("view");
      } else {
        // создание новой задачи — возвращаемся в idle, задача появится в списке/диаграмме
        setPanelMode("idle");
        setSelectedTask(null);
      }
    } catch (err) {
      console.error(err);
      showNotification("Не удалось сохранить задачу", "error");
    } finally {
      setSavingTask(false);
    }
  };

  const handleCancelEdit = () => {
    if (taskModalMode === "edit" && selectedTask) {
      setPanelMode("view");
    } else {
      setPanelMode("idle");
      setSelectedTask(null);
    }
  };

  const onCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    try {
      await handleCreateTeam(newTeamName.trim());
      setNewTeamName("");
      showNotification("Команда создана", "success");
    } catch (err: any) {
      showNotification(err.message || "Не удалось создать команду", "error");
    } finally {
      setCreatingTeam(false);
    }
  };

  const onAddMember = async () => {
    if (!selectedTeamForMember || !selectedMemberEmail.trim()) return;

    const member = classMembers.find((m) => m.email === selectedMemberEmail.trim());
    if (!member || !member.id) {
      showNotification("Участник с таким email не найден в классе", "error");
      return;
    }

    try {
      await handleAddMemberToTeam(selectedTeamForMember, member.id);
      setSelectedMemberEmail("");
      setSelectedTeamForMember(null);
      showNotification(
        "Участник добавлен в команду. Студенту нужно обновить страницу класса, чтобы увидеть проект.",
        "success"
      );
    } catch (err: any) {
      showNotification(err.message || "Не удалось добавить участника", "error");
    }
  };

  const onEditProject = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 0 | 1 | 2;
  }) => {
    try {
      await handleUpdateProject(data);
      setProjectModalOpen(false);
      showNotification("Проект успешно обновлён", "success");
    } catch (err: any) {
      showNotification(err.message || "Не удалось обновить проект", "error");
    }
  };

  const onDeleteProject = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот проект?")) {
      return;
    }

    setDeletingProject(true);
    try {
      await handleDeleteProject();
      showNotification("Проект успешно удалён", "success");
      navigate(`/classes/${classId}`);
    } catch (err: any) {
      showNotification(err.message || "Не удалось удалить проект", "error");
    } finally {
      setDeletingProject(false);
    }
  };

  if (!user || !project || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Загрузка данных проекта...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderClasses
        fullName={user.fullName}
        systemRole={isAdmin ? "Admin" : "User"}
        showSearch={false}
        showClassAction={false}
      />

      <main className="px-6 mx-10 mt-8 mb-10 space-y-8">
        {/* Навигация назад к классу */}
        <div className="mb-2">
          <button
            onClick={() => navigate(`/classes/${classId}`)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Назад к классу
          </button>
        </div>

        {/* Информация о проекте (для админа/учителя — отдельная широкая карточка) */}
        {canManage && (
          <section className="bg-white rounded-2xl px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {project.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {ProjectStatusLabels[project.status]}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectModalOpen(true)}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                  >
                    Изменить
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={onDeleteProject}
                      disabled={deletingProject}
                      className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingProject ? "Удаление..." : "Удалить"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {project.description && (
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {project.description}
              </p>
            )}
          </section>
        )}

        {/* Для студента: проект + моя команда в одной строке и диаграмма задач */}
        {!canManage && (
          <section>
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-stretch mb-8">
              {/* Карточка проекта */}
              <section className="bg-white rounded-2xl px-8 py-6 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {project.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {ProjectStatusLabels[project.status]}
                    </span>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </section>

              {/* Блок "Моя команда" */}
              <section>
                {myTeam ? (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{myTeam.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Ваша текущая команда в этом проекте
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        Участников: {myTeam.members.length}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Участники команды</p>
                      {myTeam.members.length === 0 ? (
                        <p className="text-sm text-gray-500">В команде пока нет участников.</p>
                      ) : (
                        <div className="space-y-2">
                          {myTeam.members.map((member, index) => (
                            <div
                              key={member.userId || `my-team-member-${index}`}
                              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {member.fullName}
                                </p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Вы не состоите ни в одной команде этого проекта.
                  </p>
                )}
              </section>
            </div>

            <div className="mt-2 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
              <GanttChart
                tasks={teamTasks}
                loading={tasksLoading}
                error={tasksError}
                onReload={reloadTasks}
                title="Диаграмма задач команды"
                placeholder="У вашей команды пока нет задач."
                onCreateTask={openCreateTask}
                onSelectTask={handleSelectTask}
                onCreateChild={handleCreateChildTask}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
                selectedTaskId={selectedTask?.id}
              />

              {/* Правая панель информации и формы задачи */}
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 min-h-[260px]">
                {panelMode === "idle" && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Выберите задачу в списке или на диаграмме, чтобы увидеть детали.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateTask}
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                    >
                      Добавить задачу
                    </button>
                  </div>
                )}

                {panelMode === "view" && selectedTask && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 break-words">
                          {selectedTask.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${
                              selectedTask.type === 0
                                ? "text-violet-600 border-violet-100 bg-violet-50"
                                : selectedTask.type === 1
                                ? "text-sky-600 border-sky-100 bg-sky-50"
                                : "text-amber-600 border-amber-100 bg-amber-50"
                            }`}
                          >
                            {TaskTypeLabels[selectedTask.type]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {TaskStatusLabels[selectedTask.status]}
                          </span>
                        </div>
                        {selectedTask.description && (
                          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line break-words">
                            {selectedTask.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        <span className="font-medium">Даты: </span>
                        {new Date(selectedTask.startDate).toLocaleDateString("ru-RU")} —
                        {" "}
                        {new Date(selectedTask.endDate).toLocaleDateString("ru-RU")}
                      </p>
                      {selectedTask.assignedUsers?.length > 0 && (
                        <p>
                          <span className="font-medium">Исполнители: </span>
                          {selectedTask.assignedUsers.map((u) => u.fullName).join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditTask(selectedTask)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(selectedTask)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}

                {panelMode === "edit" && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900 break-words">
                      {taskModalMode === "create" ? "Добавить задачу" : "Изменить задачу"}
                    </h4>

                    <input
                      type="text"
                      className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Название"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                      className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm"
                      rows={3}
                      placeholder="Описание"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Дата начала</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Дата окончания</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Тип</label>
                        <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed">
                          {TaskTypeLabels[type]}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Статус</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(Number(e.target.value) as TaskStatus)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        >
                          <option value={0}>{TaskStatusLabels[0]}</option>
                          <option value={1}>{TaskStatusLabels[1]}</option>
                          <option value={2}>{TaskStatusLabels[2]}</option>
                        </select>
                      </div>
                    </div>

                    {(type === 1 || type === 2) && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-1">Родительская задача</label>
                        <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed">
                          {parentTaskId
                            ? parentOptions.find((t) => t.id === parentTaskId)?.title || ""
                            : "Не выбрана"}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">Можно начинать после</label>
                      <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                        {dependencyOptions.length === 0 ? (
                          <p className="text-xs text-gray-500 px-3 py-2">Пока нет других задач.</p>
                        ) : (
                          dependencyOptions.map((task) => (
                            <label
                              key={task.id}
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDependencies.includes(task.id)}
                                onChange={() =>
                                  setSelectedDependencies((prev) =>
                                    toggleSelection(prev, task.id)
                                  )
                                }
                              />
                              <span>{task.title}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm text-gray-700 mb-2">
                        Исполнители (участники команды)
                      </label>
                      <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                        {currentMembers.length === 0 ? (
                          <p className="text-xs text-gray-500 px-3 py-2">
                            В команде пока нет участников.
                          </p>
                        ) : (
                          currentMembers.map((member) => (
                            <label
                              key={member.id}
                              className="flex items-center gap-2 px-3 py-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAssignees.includes(member.id)}
                                onChange={() =>
                                  setSelectedAssignees((prev) =>
                                    toggleSelection(prev, member.id)
                                  )
                                }
                              />
                              <span>{member.fullName}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-xs"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleTaskSave}
                        disabled={savingTask}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition text-xs disabled:opacity-50"
                      >
                        {savingTask
                          ? "Сохраняем..."
                          : taskModalMode === "create"
                          ? "Создать"
                          : "Сохранить"}
                      </button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </section>
        )}

        {/* Диаграмма задач для админа/учителя */}
        {canManage && (
          <section className="space-y-4 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Диаграмма задач</h3>
                <p className="text-sm text-gray-500">
                  Выберите команду, чтобы посмотреть её задачи.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedTeamId ?? ""}
                  onChange={(e) => setSelectedTeamId(e.target.value || null)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]"
                  disabled={teams.length === 0}
                >
                  <option value="">Выберите команду</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {teams.length === 0 ? (
              <p className="text-gray-500 text-sm">Сначала создайте команду, чтобы видеть задачи.</p>
            ) : (
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
                <GanttChart
                  tasks={teamTasks}
                  loading={tasksLoading}
                  error={tasksError}
                  onReload={undefined}
                  title={
                    teamNameForChart
                      ? `Задачи команды «${teamNameForChart}»`
                      : "Диаграмма задач команды"
                  }
                  placeholder="Для выбранной команды пока нет задач."
                  onCreateTask={openCreateTask}
                  onSelectTask={handleSelectTask}
                  onCreateChild={handleCreateChildTask}
                  projectStartDate={project.startDate}
                  projectEndDate={project.endDate}
                  selectedTaskId={selectedTask?.id}
                />

                {/* Правая панель информации и формы задачи */}
                <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 min-h-[260px]">
                  {panelMode === "idle" && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        Выберите задачу в списке или на диаграмме, чтобы увидеть детали.
                      </p>
                      <button
                        type="button"
                        onClick={openCreateTask}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                      >
                        Добавить задачу
                      </button>
                    </div>
                  )}

                  {panelMode === "view" && selectedTask && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 break-words">
                            {selectedTask.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                selectedTask.type === 0
                                  ? "text-violet-600 border-violet-100 bg-violet-50"
                                  : selectedTask.type === 1
                                  ? "text-sky-600 border-sky-100 bg-sky-50"
                                  : "text-amber-600 border-amber-100 bg-amber-50"
                              }`}
                            >
                              {TaskTypeLabels[selectedTask.type]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {TaskStatusLabels[selectedTask.status]}
                            </span>
                          </div>
                          {selectedTask.description && (
                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line break-words">
                              {selectedTask.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          <span className="font-medium">Статус: </span>
                          {TaskStatusLabels[selectedTask.status]}
                          <span className="mx-1">·</span>
                          <span className="font-medium">Дедлайн: </span>
                          {new Date(selectedTask.startDate).toLocaleDateString("ru-RU")} —
                          {" "}
                          {new Date(selectedTask.endDate).toLocaleDateString("ru-RU")}
                        </p>
                        {selectedTask.assignedUsers?.length > 0 && (
                          <p>
                            <span className="font-medium">Исполнители: </span>
                            {selectedTask.assignedUsers.map((u) => u.fullName).join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openEditTask(selectedTask)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(selectedTask)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}

                  {panelMode === "edit" && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900 break-words">
                        {taskModalMode === "create" ? "Добавить задачу" : "Изменить задачу"}
                      </h4>

                      <input
                        type="text"
                        className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="Название"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />

                      <textarea
                        className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm"
                        rows={3}
                        placeholder="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Дата начала</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Дата окончания</label>
                          <input
                            type="date"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Тип</label>
                          <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed">
                            {TaskTypeLabels[type]}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Статус</label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value) as TaskStatus)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                          >
                            <option value={0}>{TaskStatusLabels[0]}</option>
                            <option value={1}>{TaskStatusLabels[1]}</option>
                            <option value={2}>{TaskStatusLabels[2]}</option>
                          </select>
                        </div>
                      </div>

                      {(type === 1 || type === 2) && (
                        <div className="mb-4">
                          <label className="block text-sm text-gray-700 mb-1">Родительская задача</label>
                          <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed">
                            {parentTaskId
                              ? parentOptions.find((t) => t.id === parentTaskId)?.title || ""
                              : "Без родителя"}
                          </div>
                          {taskModalMode === "edit" && (
                            <p className="text-xs text-gray-500 mt-1">
                              Родительскую задачу нельзя изменить после создания
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">Можно начинать после</label>
                        <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                          {dependencyOptions.length === 0 ? (
                            <p className="text-xs text-gray-500 px-3 py-2">Пока нет других задач.</p>
                          ) : (
                            dependencyOptions.map((task) => (
                              <label
                                key={task.id}
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDependencies.includes(task.id)}
                                  onChange={() =>
                                    setSelectedDependencies((prev) =>
                                      toggleSelection(prev, task.id)
                                    )
                                  }
                                />
                                <span>{task.title}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block text-sm text-gray-700 mb-2">
                          Исполнители (участники команды)
                        </label>
                        <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                          {currentMembers.length === 0 ? (
                            <p className="text-xs text-gray-500 px-3 py-2">
                              В команде пока нет участников.
                            </p>
                          ) : (
                            currentMembers.map((member) => (
                              <label
                                key={member.id}
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAssignees.includes(member.id)}
                                  onChange={() =>
                                    setSelectedAssignees((prev) =>
                                      toggleSelection(prev, member.id)
                                    )
                                  }
                                />
                                <span>{member.fullName}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-xs"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={handleTaskSave}
                          disabled={savingTask}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition text-xs disabled:opacity-50"
                        >
                          {savingTask
                            ? "Сохраняем..."
                            : taskModalMode === "create"
                            ? "Создать"
                            : "Сохранить"}
                        </button>
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            )}
          </section>
        )}

        {/* Для админа/учителя: список всех команд ниже диаграммы */}
        {canManage && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Команды проекта</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Название команды"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  className="w-auto px-6 py-2 text-sm"
                  disabled={creatingTeam || !newTeamName.trim()}
                  onClick={onCreateTeam}
                >
                  {creatingTeam ? "Создание..." : "Создать команду"}
                </Button>
              </div>
            </div>

            {teams.length === 0 ? (
              <p className="text-gray-500 text-sm">В этом проекте пока нет команд.</p>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTeamForMember(
                            selectedTeamForMember === team.id ? null : team.id
                          )
                        }
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {selectedTeamForMember === team.id ? "Отмена" : "Добавить участника"}
                      </button>
                    </div>

                    {selectedTeamForMember === team.id && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-3">
                        <select
                          value={selectedMemberEmail}
                          onChange={(e) => setSelectedMemberEmail(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Выберите участника</option>
                          {classMembers
                            .filter((m) => m.roleInClass === 0)
                            .map((m) => (
                              <option key={m.id || m.email} value={m.email}>
                                {m.fullName} ({m.email})
                              </option>
                            ))}
                        </select>
                        <Button
                          type="button"
                          className="w-auto px-4 py-2 text-sm"
                          disabled={!selectedMemberEmail}
                          onClick={onAddMember}
                        >
                          Добавить
                        </Button>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Участники команды:</p>
                      {(() => {
                        const teamWithMembers = teamsWithMembers.get(team.id);
                        const members = teamWithMembers?.members ?? [];
                        return members.length === 0 ? (
                          <p className="text-sm text-gray-500">В команде пока нет участников.</p>
                        ) : (
                          <div className="space-y-2">
                            {members.map((member, index) => (
                              <div
                                key={member.userId || `member-${index}`}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {member.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                                {canManage && member.userId && (
                                  <button
                                    type="button"
                                    className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                                    onClick={async () => {
                                      if (!confirm("Удалить участника из команды?")) return;
                                      try {
                                        await handleDeleteMemberFromTeam(team.id, member.userId);
                                        // Если сейчас просматривается эта команда — перезагрузим её задачи
                                        if (targetTeamId === team.id) {
                                          await reloadTasks();
                                        }
                                      } catch (err: any) {
                                        alert(err.message || "Не удалось удалить участника");
                                      }
                                    }}
                                  >
                                    Удалить
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Модальное окно редактирования проекта */}
      {canManage && (
        <ProjectModal
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          mode="edit"
          classId={classId!}
          initialProject={project}
          onSubmit={onEditProject}
        />
      )}
    </div>
  );
}
