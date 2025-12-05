import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import Button from "../components/Button";
import Input from "../components/Input";
import CreateInviteModal from "../components/CreateInviteModal";
import ProjectModal from "../components/ProjectModal";
import {
  getClassDetails,
  getClassMembers,
  deleteClass,
  updateClass,
  type ClassDetails,
  type ClassMember,
} from "../api/classes";
import {
  getClassProjects,
  getUserClassProjects,
  createProject,
  updateProject,
  deleteProject,
  ProjectStatusLabels,
  type Project,
} from "../api/projects";
import { getProfile } from "../api/users";
import CreateClassModal from "../components/CreateClassModal";

type CurrentUser = {
  fullName: string;
  email: string;
  role: 0 | 1; // 0 — обычный пользователь, 1 — админ
};

type MembersFilter = "all" | "teachers" | "students";

export default function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [details, setDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<0 | 1>(0);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [membersFilter, setMembersFilter] = useState<MembersFilter>("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isAdmin = user?.role === 1;
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;

      try {
        const profile = await getProfile();
        setUser({
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role === 1 ? 1 : 0,
        });

        const [classData, members] = await Promise.all([
          getClassDetails(classId),
          getClassMembers(classId),
        ]);

        // Определяем, может ли пользователь управлять этим классом:
        //  - системный админ
        //  - или учитель в рамках этого класса (roleInClass === 1 по email)
        const isSystemAdmin = profile.role === 1;
        const isTeacherInClass = members.some(
          (m) => m.email === profile.email && m.roleInClass === 1
        );
        const canManageClass = isSystemAdmin || isTeacherInClass;

        // Для студентов используем getUserClassProjects, для админов/учителей - getClassProjects
        let projectsData: Project[] = [];
        try {
          if (canManageClass) {
            projectsData = await getClassProjects(classId);
          } else {
            projectsData = await getUserClassProjects(classId);
          }
        } catch (err: any) {
          // Если не удалось загрузить проекты, просто оставляем пустой массив
          console.warn("Не удалось загрузить проекты:", err);
          projectsData = [];
        }

        const nextDetails: ClassDetails = {
          ...classData,
          projects: classData.projects ?? [],
          members,
        };

        setProjects(projectsData);
        setCanManage(canManageClass);
        setDetails(nextDetails);
      } catch (err: any) {
        console.error("Ошибка загрузки класса:", err);
        const message =
          err?.response?.data?.message ??
          err?.response?.data ??
          err?.message ??
          "Не удалось загрузить класс";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleDeleteClass = async () => {
    if (!details) return;
    const confirmed = window.confirm("Удалить этот класс? Действие необратимо.");
    if (!confirmed) return;

    try {
      await deleteClass(details.id);
      alert("Класс удалён");
      navigate("/classes");
    } catch (err: any) {
      console.error("Ошибка удаления класса:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось удалить класс";
      alert(message);
    }
  };

  const handleEditSubmit = async ({
    title,
    description,
    color,
  }: {
    title: string;
    description: string;
    color: string;
  }) => {
    if (!details) return;

    try {
      const updated = await updateClass(details.id, { title, description, color });
      setDetails((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              description: updated.description ?? "",
              color: updated.color ?? color,
            }
          : prev
      );
    } catch (err: any) {
      console.error("Ошибка при изменении класса:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось изменить класс";
      throw new Error(message);
    }
  };

  const handleInvite = async () => {
    if (!classId || !inviteEmail.trim()) return;

    setInviteLoading(true);

    // TODO: когда будет готов бэкенд, здесь нужно вызвать
    // await addMemberToClass(classId, { email: inviteEmail.trim(), role: inviteRole })
    // и, при необходимости, обновить список участников ответом сервера.

    // Пока просто обновляем локальное состояние как заглушку.
    setDetails((prev: ClassDetails | null) => {
      if (!prev) return prev;

      const newMember: ClassMember = {
        fullName: inviteEmail.trim(),
        email: inviteEmail.trim(),
        roleInClass: inviteRole,
      };

      return {
        ...prev,
        members: [...prev.members, newMember],
      };
    });

    setInviteEmail("");
    alert("Участник добавлен локально (без запроса к серверу).");
    setInviteLoading(false);
  };

  const handleCreateProject = async ({
    title,
    description,
    startDate,
    endDate,
    status,
  }: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Project["status"];
  }) => {
    if (!classId) return;

    try {
      await createProject({
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status,
        classId,
      });

      // Перезагружаем список проектов
      const updatedProjects = await getClassProjects(classId);
      setProjects(updatedProjects);
    } catch (err: any) {
      console.error("Ошибка при создании проекта:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось создать проект";
      throw new Error(message);
    }
  };

  const handleEditProject = async ({
    title,
    description,
    startDate,
    endDate,
    status,
  }: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: Project["status"];
  }) => {
    if (!editingProject) return;

    try {
      await updateProject(editingProject.id, {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status,
        classId: editingProject.classId,
      });

      // Перезагружаем список проектов
      const updatedProjects = await getClassProjects(editingProject.classId);
      setProjects(updatedProjects);
      setEditingProject(null);
    } catch (err: any) {
      console.error("Ошибка при изменении проекта:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось изменить проект";
      throw new Error(message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm("Удалить этот проект? Действие необратимо.");
    if (!confirmed) return;

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      alert("Проект удалён");
    } catch (err: any) {
      console.error("Ошибка при удалении проекта:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось удалить проект";
      alert(message);
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
                    onClick={handleDeleteClass}
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
              <h3 className="text-2xl font-semibold mr-5  text-gray-900">Проекты</h3>
              {canManage && (
                <button
                  type="button"
                  className="w-auto h-9 px-4 py-2  flex items-center justify-center rounded-xl border border-gray-300 bg-white text-center text-xs leading-none hover:bg-gray-100 transition"
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
              <p className="text-gray-500 text-sm">
                В этом классе пока нет проектов.
              </p>
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
                                onClick={() => handleDeleteProject(project.id)}
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
                          onClick={() =>
                            alert(
                              "Здесь позже можно открыть саму реверсивную диаграмму Ганта для проекта."
                            )
                          }
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
                  Создать ссылку-приглашение
                </button>
              )}
            </div>

            {/* Фильтры участников */}
            <div className=" px-4 py-3 mb-4 mr-20 flex flex-wrap items-center justify-between text-xs md:text-sm">
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
                    setMembersFilter(
                      membersFilter === "teachers" ? "all" : "teachers"
                    )
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
                    setMembersFilter(
                      membersFilter === "students" ? "all" : "students"
                    )
                  }
                />
                <span>Студенты</span>
              </label>
            </div>

            {/* Форма инвайта (оставляем ниже фильтров) */}
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
                  onChange={(e) =>
                    setInviteRole(Number(e.target.value) as 0 | 1)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm"
                >
                  <option value={0}>Студент</option>
                  <option value={1}>Учитель</option>
                </select>
                <Button
                  type="button"
                  className="w-auto px-6 py-2 text-xs md:text-sm font-medium"
                  disabled={inviteLoading}
                  onClick={handleInvite}
                >
                  {inviteLoading ? "Добавление..." : "Добавить участника"}
                </Button>
              </div>
            )}

            {/* Список участников с учётом фильтра */}
            {details.members.length === 0 ? (
              <p className="text-gray-500 text-sm">
                В этом классе пока нет участников.
              </p>
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
                        <p className="font-medium text-sm text-gray-900">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] md:text-xs bg-gray-100 text-gray-700">
                          {member.roleInClass === 1 ? "Учитель" : "Студент"}
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            className="text-[11px] md:text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                            onClick={() =>
                              alert(
                                "Удаление участника можно реализовать отдельным API-вызовом позже."
                              )
                            }
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
        onSubmit={handleEditSubmit}
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
        onSubmit={editingProject ? handleEditProject : handleCreateProject}
      />
    </div>
  );
}


