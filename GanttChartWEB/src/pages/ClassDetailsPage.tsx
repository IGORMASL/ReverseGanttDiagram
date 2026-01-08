import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import Button from "../components/Button";
import Input from "../components/Input";
import CreateInviteModal from "../components/CreateInviteModal";
import ProjectModal from "../components/ProjectModal";
import CreateClassModal from "../components/CreateClassModal";
import { ProjectStatusLabels } from "../api/projects";
import { addMemberToClass, getClassMembers, deleteMemberFromClass, type ClassRole, type ClassDetails } from "../api/classes";
import { useAuth } from "../hooks/useAuth";
import { useClassDetails } from "../hooks/useClassDetails";
import { isSystemAdmin } from "../utils/permissions";
import type { Project } from "../api/projects";
import type { MembersFilter } from "../types";
import { useNotification } from "../components/NotificationProvider";
import { getErrorMessage } from "../utils/errorHandling";

export default function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const {
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
  } = useClassDetails({ classId, user });

  // UI состояние
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ClassRole>(0);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [membersFilter, setMembersFilter] = useState<MembersFilter>("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isAdmin = isSystemAdmin(user);

  const onDeleteClass = async () => {
    const confirmed = window.confirm("Удалить этот класс? Действие необратимо.");
    if (!confirmed) return;

    try {
      await handleDeleteClass();
      showNotification("Класс удалён", "success");
      navigate("/classes");
    } catch (err: any) {
      showNotification(err.message || "Не удалось удалить класс", "error");
    }
  };

  const onEditClass = async (data: {
    title: string;
    description: string;
    color: string;
  }) => {
    try {
      await handleUpdateClass(data);
      setEditModalOpen(false);
    } catch (err: any) {
      showNotification(err.message || "Не удалось изменить класс", "error");
    }
  };

  const onInvite = async () => {
    if (!classId) return;

    const email = inviteEmail.trim();
    if (!email) {
      showNotification("Укажите email участника", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Укажите корректный email участника", "error");
      return;
    }

    setInviteLoading(true);
    try {
      await addMemberToClass(classId, {
        email,
        role: inviteRole,
      });

      const members = await getClassMembers(classId);
      setDetails((prev: ClassDetails | null) => (prev ? { ...prev, members } : prev));

      setInviteEmail("");
      showNotification("Участник добавлен в класс", "success");
    } catch (err: any) {
      console.error("Ошибка добавления участника:", err);
      // Если сервер вернул 404 (например, пользователь с таким email не найден),
      // показываем дружелюбное сообщение вместо сырой 404-ошибки.
      if (err && typeof err === "object" && "response" in err && (err as any).response?.status === 404) {
        showNotification("Пользователь с таким email не найден в системе", "error");
      } else {
        const message = getErrorMessage(err) || "Не удалось добавить участника";
        showNotification(message, "error");
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const onCreateProject = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Project["status"];
  }) => {
    try {
      await handleCreateProject(data);
      setProjectModalOpen(false);
    } catch (err: any) {
      showNotification(err.message || "Не удалось создать проект", "error");
    }
  };

  const onDeleteMember = async (memberId: string) => {
    if (!classId) return;
    const confirmed = window.confirm("Удалить участника из класса? Действие необратимо.");
    if (!confirmed) return;

    try {
      await deleteMemberFromClass(classId, memberId);
      const members = await getClassMembers(classId);
      setDetails((prev: ClassDetails | null) => (prev ? { ...prev, members } : prev));
      showNotification("Участник удалён из класса", "success");
    } catch (err: any) {
      console.error("Ошибка удаления участника:", err);
      showNotification(err.message || "Не удалось удалить участника", "error");
    }
  };

  const onEditProject = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Project["status"];
  }) => {
    if (!editingProject) return;

    try {
      await handleUpdateProject(editingProject.id, data);
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      showNotification(err.message || "Не удалось изменить проект", "error");
    }
  };

  const onDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm("Удалить этот проект? Действие необратимо.");
    if (!confirmed) return;

    try {
      await handleDeleteProject(projectId);
      showNotification("Проект удалён", "success");
    } catch (err: any) {
      showNotification(err.message || "Не удалось удалить проект", "error");
    }
  };

  if (!user || !details || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Загрузка данных класса...</p>
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

      <main className="px-8 mx-20 mt-8 mb-10 space-y-8">
        {/* Инфо о классе */}
        <section
          className="rounded-2xl px-8 py-6 shadow-sm"
          style={{ backgroundColor: details.color ?? "#D7E0EB" }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="max-w-6.5xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900">
                {details.title}
              </h2>
              {details.description && (
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {details.description}
                </p>
              )}
            </div>

            {(isAdmin || canManage) && (
              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {isAdmin && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-white text-xs md:text-sm text-red-600 hover:bg-red-50 transition"
                    onClick={onDeleteClass}
                  >
                    Удалить класс
                  </button>
                )}
                {canManage && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-white text-xs md:text-sm text-gray-800 hover:bg-gray-50 transition"
                    onClick={() => setEditModalOpen(true)}
                  >
                    Редактировать
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Две колонки: проекты и участники */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-8 items-start">
          {/* Левая колонка: проекты */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-semibold mr-5 text-gray-900">Проекты</h3>
              {canManage && (
                <button
                  type="button"
                  className="w-auto h-9 px-4 py-2 flex items-center justify-center rounded-xl border border-gray-300 bg-white text-center text-xs leading-none hover:bg-gray-100 transition"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModalOpen(true);
                  }}
                >
                  Добавить проект
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">В этом классе пока нет проектов.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const statusLabel = ProjectStatusLabels[project.status];
                  const statusColor =
                    project.status === 2
                      ? "text-emerald-600"
                      : project.status === 1
                      ? "text-amber-500"
                      : "text-gray-500";

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="max-w-xl flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-base md:text-lg font-semibold text-gray-900">
                            {project.title}
                          </h4>
                          {canManage && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProject(project);
                                  setProjectModalOpen(true);
                                }}
                                className="text-xs text-gray-600 hover:text-gray-900"
                              >
                                Изменить
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteProject(project.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Удалить
                              </button>
                            </div>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                        <span className={`text-xs md:text-sm font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <Button
                          type="button"
                          className="w-full md:w-32 text-sm py-2 bg-[#CBD5E1] text-gray-900 hover:bg-gray-800 hover:text-white"
                          onClick={() => navigate(`/classes/${details.id}/projects/${project.id}`)}
                        >
                          Открыть
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Правая колонка: участники */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-900 mr-5">
                Участники класса
              </h3>
              {canManage && (
                <button
                  type="button"
                  className="w-auto h-9 px-4 py-2 flex items-center justify-center rounded-xl border border-gray-300 bg-white text-center text-xs hover:bg-gray-100 transition"
                  onClick={() => setInviteModalOpen(true)}
                >
                  Создать код-приглашение
                </button>
              )}
            </div>

            {/* Фильтры участников */}
            <div className="px-4 py-3 mb-4 mr-20 flex flex-wrap items-center justify-between text-xs md:text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black"
                  checked={membersFilter === "all"}
                  onChange={() => setMembersFilter("all")}
                />
                <span>Все участники</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black"
                  checked={membersFilter === "teachers"}
                  onChange={() =>
                    setMembersFilter(membersFilter === "teachers" ? "all" : "teachers")
                  }
                />
                <span>Учителя</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black"
                  checked={membersFilter === "students"}
                  onChange={() =>
                    setMembersFilter(membersFilter === "students" ? "all" : "students")
                  }
                />
                <span>Студенты</span>
              </label>
            </div>

            {/* Форма инвайта */}
            {canManage && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-4 mb-4 flex flex-wrap justify-between gap-3 items-center">
                <Input
                  type="email"
                  placeholder="Email участника"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="max-w-[73%]"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(Number(e.target.value) as 0 | 1)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm"
                >
                  <option value={0}>Студент</option>
                  <option value={1}>Учитель</option>
                </select>
                <Button
                  type="button"
                  className="w-auto px-6 py-2 text-xs md:text-sm font-medium"
                  disabled={inviteLoading}
                  onClick={onInvite}
                >
                  {inviteLoading ? "Добавление..." : "Добавить участника"}
                </Button>
              </div>
            )}

            {/* Список участников с учётом фильтра */}
            {details.members.length === 0 ? (
              <p className="text-gray-500 text-sm">В этом классе пока нет участников.</p>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {details.members
                  .filter((m) => {
                    if (membersFilter === "teachers") return m.roleInClass === 1;
                    if (membersFilter === "students") return m.roleInClass === 0;
                    return true;
                  })
                  .map((member, index) => (
                    <div
                      key={`${member.email}-${index}`}
                      className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.fullName}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] md:text-xs bg-gray-100 text-gray-700">
                          {member.roleInClass === 1 ? "Учитель" : "Студент"}
                        </span>
                        {canManage && member.id && (
                          <button
                            type="button"
                            className="text-[11px] md:text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                            onClick={() => onDeleteMember(member.id!)}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateClassModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        initialTitle={details.title}
        initialDescription={details.description ?? ""}
        initialColor={details.color ?? "#C6D3E1"}
        onSubmit={onEditClass}
      />

      <CreateInviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        classId={details.id}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        mode={editingProject ? "edit" : "create"}
        classId={details.id}
        initialProject={editingProject ?? undefined}
        onSubmit={editingProject ? onEditProject : onCreateProject}
      />
    </div>
  );
}
