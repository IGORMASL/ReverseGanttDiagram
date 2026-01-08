import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNotification } from "./NotificationProvider";

type ClassModalMode = "create" | "edit";

type ClassModalFormValues = {
  title: string;
  description: string;
  color: string;
};

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ClassModalMode;
  initialTitle?: string;
  initialDescription?: string;
  initialColor?: string;
  onSubmit: (data: ClassModalFormValues) => Promise<void> | void;
}

const DEFAULT_COLOR = "#C6D3E1";

const CreateClassModal: FC<ClassModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialTitle,
  initialDescription,
  initialColor = DEFAULT_COLOR,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Обновляем локальное состояние при открытии / смене редактируемого класса
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle ?? "");
      setDescription(initialDescription ?? "");
      setColor(initialColor ?? DEFAULT_COLOR);
    }
  }, [isOpen, initialTitle, initialDescription, initialColor]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      showNotification("Название класса обязательно", "error");
      return;
    }

    setLoading(true);
    try {
      await Promise.resolve(onSubmit({ title, description, color }));
      onClose();
    } catch (err: any) {
      console.error("Ошибка при сохранении класса:", err);
      const message =
        err?.message ??
        "Ошибка при сохранении класса";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "create" ? "Создать новый класс" : "Изменить класс"}
        </h2>

        <input
          type="text"
          placeholder="Название класса"
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Описание"
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Выбор цвета класса */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <label className="text-sm text-gray-700">Цвет класса</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">{color}</span>
          </div>
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
            {loading
              ? "Сохраняем..."
              : mode === "create"
              ? "Создать"
              : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;
