import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import ClassCard from "../components/ClassCard";
import JoinClassModal from "../components/JoinClassModal";
import CreateClassModal from "../components/CreateClassModal";
import { useAuth } from "../hooks/useAuth";
import { useClasses } from "../hooks/useClasses";
import type { UserClass } from "../api/classes";

export default function ClassesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { classes, loading: classesLoading, handleDeleteClass, handleCreateClass, handleUpdateClass } = useClasses(user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<UserClass | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const isAdmin = user?.role === 1;
  const loading = authLoading || classesLoading;

  const handleCreateSubmit = async (data: {
    title: string;
    description: string;
    color: string;
  }) => {
    try {
      await handleCreateClass(data);
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Не удалось создать класс");
    }
  };

  const handleEditSubmit = async (data: {
    title: string;
    description: string;
    color: string;
  }) => {
    if (!editingClass) return;

    try {
      await handleUpdateClass(editingClass.classId, data);
      setEditingClass(null);
    } catch (err: any) {
      alert(err.message || "Не удалось изменить класс");
    }
  };

  const handleDelete = async (classId: string) => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить класс?");
    if (!confirmed) return;

    try {
      await handleDeleteClass(classId);
      alert("Класс удалён");
    } catch (err: any) {
      alert(err.message || "Ошибка при удалении класса");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderClasses
        fullName={user.fullName}
        systemRole={isAdmin ? "Admin" : "User"}
        onCreateClass={() => setModalOpen(true)}
        onAddClass={() => setJoinModalOpen(true)}
      />

      <div className="my-14 px-8 ml-[10%]">
        <h2 className="text-4xl font-semibold">Классы</h2>
      </div>

      {loading ? (
        <p className="text-center mt-12 text-gray-500">Загрузка классов...</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-8 mt-8 px-8 mx-20">
          {classes.map((cls) => (
            <ClassCard
              key={cls.classId}
              title={cls.className}
              classRole={!isAdmin ? cls.classRole : undefined}
              description={cls.description}
              color={cls.color ?? "#C6D3E1"}
              onClick={() => navigate(`/classes/${cls.classId}`)}
              {...((user.role === 1 || cls.classRole === 1)
                ? {
                    onEdit: () => setEditingClass(cls),
                    ...(user.role === 1
                      ? { onDelete: () => handleDelete(cls.classId) }
                      : {}),
                  }
                : {})}
            />
          ))}
        </div>
      )}

      <CreateClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="create"
        onSubmit={handleCreateSubmit}
      />

      <CreateClassModal
        isOpen={editingClass !== null}
        onClose={() => setEditingClass(null)}
        mode="edit"
        initialTitle={editingClass?.className ?? ""}
        initialDescription={editingClass?.description ?? ""}
        initialColor={editingClass?.color ?? "#C6D3E1"}
        onSubmit={handleEditSubmit}
      />

      <JoinClassModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </div>
  );
}
