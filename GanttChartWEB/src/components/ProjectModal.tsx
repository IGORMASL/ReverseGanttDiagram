import type { FC } from "react";
import { useEffect, useState } from "react";
import { type ProjectStatus, ProjectStatusLabels, type Project } from "../api/projects";
import { getErrorMessage } from "../utils/errorHandling";
import { useNotification } from "./NotificationProvider";

type ProjectModalMode = "create" | "edit";

type ProjectModalFormValues = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
};

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ProjectModalMode;
  classId: string;
  initialProject?: Project;
  onSubmit: (data: ProjectModalFormValues) => Promise<void> | void;
}

const ProjectModal: FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  mode,
  //classId,
  initialProject,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(0);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Обновляем локальное состояние при открытии / смене редактируемого проекта
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialProject) {
        setTitle(initialProject.title);
        setDescription(initialProject.description ?? "");
        // Преобразуем даты из ISO строк в формат для input[type="date"]
        const start = new Date(initialProject.startDate);
        const end = new Date(initialProject.endDate);
        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        setStatus(initialProject.status);
      } else {
        setTitle("");
        setDescription("");
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);
        setEndDate(today);
        setStatus(0);
      }
    }
  }, [isOpen, mode, initialProject]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      showNotification("Название проекта обязательно", "error");
      return;
    }

    if (!startDate || !endDate) {
      showNotification("Даты начала и окончания обязательны", "error");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showNotification("Дата начала не может быть позже даты окончания", "error");
      return;
    }

    setLoading(true);
    try {
      await Promise.resolve(onSubmit({ title, description, startDate, endDate, status }));
      onClose();
    } catch (err: any) {
      console.error("Ошибка при сохранении проекта:", err);
      const message = getErrorMessage(err) || "Ошибка при сохранении проекта";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "create" ? "Создать новый проект" : "Изменить проект"}
        </h2>

        <input
          type="text"
          placeholder="Название проекта"
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Описание"
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">Дата начала</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">Дата окончания</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-700 mb-1">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value) as ProjectStatus)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value={0}>{ProjectStatusLabels[0]}</option>
            <option value={1}>{ProjectStatusLabels[1]}</option>
            <option value={2}>{ProjectStatusLabels[2]}</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Сохраняем..." : mode === "create" ? "Создать" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;

