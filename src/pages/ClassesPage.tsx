import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderClasses from "../components/HeaderClasses";
import ClassCard from "../components/ClassCard";
import JoinClassModal from "../components/JoinClassModal";
import type { UserClass, ClassView, ClassCreateDto } from "../api/classes";
import {
  getUserClasses,
  getAllClasses,
  deleteClass,
  createClass,
  updateClass,
  DEFAULT_CLASS_COLOR,
} from "../api/classes";
import { getProfile } from "../api/users";
import CreateClassModal from "../components/CreateClassModal";

type CurrentUser = {
  fullName: string;
  role: 0 | 1; // 0 — обычный пользователь, 1 — админ
};

// Вспомогательная функция загрузки классов под конкретного пользователя
async function loadClassesForUser(user: CurrentUser): Promise<UserClass[]> {
  if (user.role === 1) {
    // Админ — получаем все классы
    const all = await getAllClasses();
    return all.map((cls) => ({
      classId: cls.id,
      className: cls.title,
      description: cls.description ?? "",
      color: cls.color ?? DEFAULT_CLASS_COLOR,
      // classRole не задаём — для админа метка роли не нужна
    }));
  }

  // Обычный пользователь — только свои классы
  return await getUserClasses();
}

export default function ClassesPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [classes, setClasses] = useState<UserClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<UserClass | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.role === 1;

  // 1. Загружаем профиль пользователя
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser({
          fullName: profile.fullName,
          role: profile.role === 1 ? 1 : 0,
        });
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      }
    };

    fetchProfile();
  }, []);

  // 2. Загружаем классы, когда профиль уже известен
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        const data = await loadClassesForUser(user);
        setClasses(data);
      } catch (err) {
        console.error("Ошибка загрузки классов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  // Удаление класса
  const handleDeleteClass = async (classId: string) => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить класс?");
    if (!confirmed) return;

    try {
      await deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
      alert("Класс удалён");
    } catch (err: any) {
      console.error("Ошибка при удалении класса:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Ошибка при удалении класса";
      alert(message);
    }
  };

  // Создание нового класса через модальное окно
  const handleCreateSubmit = async ({
    title,
    description,
    color,
  }: {
    title: string;
    description: string;
    color: string;
  }) => {
    try {
      const payload: ClassCreateDto = { title, description, color };
      const newClass: ClassView = await createClass(payload);

      setClasses((prev) => [
        ...prev,
        {
          classId: newClass.id,
          className: newClass.title,
          description: newClass.description ?? "",
          classRole: 1, // Для админа роль не имеет значения
          color: newClass.color ?? color ?? DEFAULT_CLASS_COLOR,
        },
      ]);
    } catch (err: any) {
      console.error("Ошибка при создании класса:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Ошибка при создании класса";
      throw new Error(message);
    }
  };

  // Сохранение изменений существующего класса
  const handleEditSubmit = async ({
    title,
    description,
    color,
  }: {
    title: string;
    description: string;
    color: string;
  }) => {
    if (!editingClass) return;

    try {
      const updated = await updateClass(editingClass.classId, {
        title,
        description,
        color,
      });

      setClasses((prev) =>
        prev.map((c) =>
          c.classId === updated.id
            ? {
                ...c,
                className: updated.title,
                description: updated.description,
                color: updated.color ?? color ?? DEFAULT_CLASS_COLOR,
              }
            : c
        )
      );
    } catch (err: any) {
      console.error("Ошибка при изменении класса:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Ошибка при изменении класса";
      throw new Error(message);
    }
  };

  if (!user) return null; // пока профиль не загружен — ничего не рендерим

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderClasses
        fullName={user.fullName}
        systemRole={isAdmin ? "Admin" : "User"}
        onCreateClass={() => setModalOpen(true)}
        onAddClass={() => setJoinModalOpen(true)}
      />

      {/* Заголовок секции классов */}
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
                      ? { onDelete: () => handleDeleteClass(cls.classId) }
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
