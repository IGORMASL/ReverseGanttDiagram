import { useEffect, useMemo, useState } from "react";
import {
  TaskStatusLabels,
  TaskTypeLabels,
  type TaskTree,
  type TaskType,
  type TaskStatus,
  type TaskAssignee,
} from "../api/tasks";

type TaskModalMode = "create" | "edit";

type TaskFormValues = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: TaskType;
  status: TaskStatus;
  dependencies: string[];
  assignedUserIds: string[];
  parentTaskId?: string | null;
};

type TaskModalProps = {
  isOpen: boolean;
  mode: TaskModalMode;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => Promise<void> | void;
  initialTask?: TaskTree;
  existingTasks: TaskTree[];
  members: TaskAssignee[];
};

export default function TaskModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  initialTask,
  existingTasks,
  members,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<TaskType>(0);
  const [status, setStatus] = useState<TaskStatus>(0);
  const [loading, setLoading] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen) return;
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? "");
      setStartDate(initialTask.startDate.slice(0, 10));
      setEndDate(initialTask.endDate.slice(0, 10));
      setType(initialTask.type);
      setStatus(initialTask.status);
      setSelectedDependencies(initialTask.dependencies ?? []);
      setSelectedAssignees(initialTask.assignedUsers?.map((u) => u.id) ?? []);
      setParentTaskId(initialTask.parentTaskId ?? null);
    } else {
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
    }
  }, [isOpen, initialTask]);

  const flatTasks = useMemo(() => flattenTasks(existingTasks), [existingTasks]);

  const dependencyOptions = useMemo(() => {
    const selfId = initialTask?.id;
    const currentStart = startDate ? new Date(startDate) : null;

    return flatTasks.filter((t) => {
      if (t.id === selfId) return false;

      // Можно начинать только после задач того же типа
      if (t.type !== type) return false;

      // Если дата начала текущей задачи не выбрана, не фильтруем по времени
      if (!currentStart) return true;

      // Нельзя начинать задачу после той, которая заканчивается позже дедлайна текущей
      const dependencyEnd = new Date(t.endDate);
      return dependencyEnd <= currentStart;
    });
  }, [flatTasks, initialTask?.id, type, startDate]);

  const parentOptions = useMemo(() => {
    const selfId = initialTask?.id;
    return flatTasks.filter((t) => {
      if (t.id === selfId) return false;

      // Для обычной задачи (type === 1) родителем может быть только результат (type === 0)
      if (type === 1) {
        return t.type === 0;
      }

      // Для подзадачи (type === 2) родителем может быть любая не-подзадача (результат или задача)
      if (type === 2) {
        return t.type === 0 || t.type === 1;
      }

      // Для результата (type === 0) родителя быть не должно, но на всякий случай возвращаем false
      return false;
    });
  }, [flatTasks, initialTask?.id, type]);

  const toggleSelection = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Название обязательно");
      return;
    }
    if (!startDate || !endDate) {
      alert("Укажите даты");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Дата начала не может быть позже окончания");
      return;
    }
    setLoading(true);
    try {
      await Promise.resolve(
        onSubmit({
          title: title.trim(),
          description,
          startDate,
          endDate,
          type,
          status,
          dependencies: selectedDependencies,
          assignedUserIds: selectedAssignees,
          parentTaskId,
        })
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить задачу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "create" ? "Добавить задачу" : "Изменить задачу"}
        </h2>

        <input
          type="text"
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Дата окончания</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Тип</label>
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value) as TaskType)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value={0}>{TaskTypeLabels[0]}</option>
              <option value={1}>{TaskTypeLabels[1]}</option>
              <option value={2}>{TaskTypeLabels[2]}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value) as TaskStatus)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
            <select
              value={parentTaskId ?? ""}
              onChange={(e) => setParentTaskId(e.target.value || null)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Без родителя</option>
              {parentOptions.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Можно начинать после</label>
          <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
            {dependencyOptions.length === 0 ? (
              <p className="text-xs text-gray-500 px-3 py-2">Пока нет других задач.</p>
            ) : (
              dependencyOptions.map((task) => (
                <label key={task.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDependencies.includes(task.id)}
                    onChange={() =>
                      setSelectedDependencies((prev) => toggleSelection(prev, task.id))
                    }
                  />
                  <span>{task.title}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-700 mb-2">Исполнители (участники команды)</label>
          <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y">
            {members.length === 0 ? (
              <p className="text-xs text-gray-500 px-3 py-2">В команде пока нет участников.</p>
            ) : (
              members.map((member) => (
                <label key={member.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedAssignees.includes(member.id)}
                    onChange={() =>
                      setSelectedAssignees((prev) => toggleSelection(prev, member.id))
                    }
                  />
                  <span>{member.fullName}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
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
}


