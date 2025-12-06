import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import Button from "../components/Button";
import Input from "../components/Input";
import ProjectModal from "../components/ProjectModal";
import { ProjectStatusLabels } from "../api/projects";
import { useAuth } from "../hooks/useAuth";
import { useProject } from "../hooks/useProject";
import { isSystemAdmin } from "../utils/permissions";

export default function ProjectPage() {
  const { projectId, classId } = useParams<{ projectId: string; classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
    handleUpdateProject,
    handleDeleteProject,
  } = useProject({ projectId, classId, user });

  // UI состояние
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<string | null>(null);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState("");
  const [showMyTeam, setShowMyTeam] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const isAdmin = isSystemAdmin(user);

  const onCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    try {
      await handleCreateTeam(newTeamName.trim());
      setNewTeamName("");
      alert("Команда создана");
    } catch (err: any) {
      alert(err.message || "Не удалось создать команду");
    } finally {
      setCreatingTeam(false);
    }
  };

  const onAddMember = async () => {
    if (!selectedTeamForMember || !selectedMemberEmail.trim()) return;

    const member = classMembers.find((m) => m.email === selectedMemberEmail.trim());
    if (!member || !member.id) {
      alert("Участник с таким email не найден в классе");
      return;
    }

    try {
      await handleAddMemberToTeam(selectedTeamForMember, member.id);
      setSelectedMemberEmail("");
      setSelectedTeamForMember(null);
      alert("Участник добавлен в команду. Студенту нужно обновить страницу класса, чтобы увидеть проект.");
    } catch (err: any) {
      alert(err.message || "Не удалось добавить участника");
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
      alert("Проект успешно обновлен");
    } catch (err: any) {
      alert(err.message || "Не удалось обновить проект");
    }
  };

  const onDeleteProject = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот проект?")) {
      return;
    }

    setDeletingProject(true);
    try {
      await handleDeleteProject();
      alert("Проект успешно удален");
      navigate(`/classes/${classId}`);
    } catch (err: any) {
      alert(err.message || "Не удалось удалить проект");
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

      <main className="px-8 mx-20 mt-8 mb-10 space-y-8">
        {/* Информация о проекте */}
        <section className="bg-white rounded-2xl px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <button
                onClick={() => navigate(`/classes/${classId}`)}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Назад к классу
              </button>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {project.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">
                {ProjectStatusLabels[project.status]}
              </span>
              {canManage && (
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
              )}
            </div>
          </div>
          {project.description && (
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {project.description}
            </p>
          )}
        </section>

        {/* Для админа/учителя: список команд */}
        {canManage && (
          <section>
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

        {/* Для студента: моя команда */}
        {!canManage && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Моя команда</h3>
              <Button
                type="button"
                className="w-auto px-6 py-2 text-sm"
                onClick={() => setShowMyTeam(!showMyTeam)}
              >
                {showMyTeam ? "Скрыть" : "Показать"}
              </Button>
            </div>

            {showMyTeam && myTeam ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{myTeam.name}</h4>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Участники:</p>
                  {myTeam.members.length === 0 ? (
                    <p className="text-sm text-gray-500">В команде пока нет участников.</p>
                  ) : (
                    <div className="space-y-2">
                      {myTeam.members.map((member, index) => (
                        <div
                          key={member.userId || `my-team-member-${index}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
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
            ) : myTeam ? null : (
              <p className="text-gray-500 text-sm">
                Вы не состоите ни в одной команде этого проекта.
              </p>
            )}

            {/* TODO: Список задач студента */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Мои задачи</h3>
              <p className="text-gray-500 text-sm">Список задач будет реализован позже.</p>
            </div>
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
