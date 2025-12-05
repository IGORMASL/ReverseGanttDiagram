import type { FC } from "react";
import { useState } from "react";
import { createInvite, type InviteCreateDto } from "../api/invite";

interface CreateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

const CreateInviteModal: FC<CreateInviteModalProps> = ({
  isOpen,
  onClose,
  classId,
}) => {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [expireHours, setExpireHours] = useState<number>(24);
  const [isMultiUse, setIsMultiUse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!classId) return;

    const payload: InviteCreateDto = {
      isTeacherInvite: role === "teacher",
      expireHours: expireHours > 0 ? expireHours : 1,
      isMultiUse,
    };

    try {
      setLoading(true);
      const data = await createInvite(classId, payload);
      setInviteLink(data.link);
      setInviteCode(data.inviteId);
    } catch (err: any) {
      console.error("Ошибка при создании приглашения:", err);
      const message =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        "Не удалось создать приглашение";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string | null) => {
    if (!text) return;
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        alert("Скопировано в буфер обмена");
      })
      .catch(() => {
        alert("Не удалось скопировать, скопируйте вручную");
      });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Создать ссылку-приглашение</h2>

        {/* Роль */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Для кого приглашение</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`px-3 py-1 rounded-full text-xs border ${
                role === "student"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Студент
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`px-3 py-1 rounded-full text-xs border ${
                role === "teacher"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Учитель
            </button>
          </div>
        </div>

        {/* Время действия */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block">
            Сколько часов действует ссылка
          </label>
          <input
            type="number"
            min={1}
            value={expireHours}
            onChange={(e) => setExpireHours(Number(e.target.value) || 1)}
            className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Тип приглашения */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Тип приглашения</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsMultiUse(false)}
              className={`px-3 py-1 rounded-full text-xs border ${
                !isMultiUse
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Одноразовая
            </button>
            <button
              type="button"
              onClick={() => setIsMultiUse(true)}
              className={`px-3 py-1 rounded-full text-xs border ${
                isMultiUse
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Многопользовательская
            </button>
          </div>
        </div>

        {/* Сгенерированная ссылка / код */}
        {inviteLink && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Ссылка для приглашения</p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
              <button
                type="button"
                className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg hover:bg-black"
                onClick={() => handleCopy(inviteLink)}
              >
                Копировать
              </button>
            </div>
          </div>
        )}

        {inviteCode && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">
              Или вы можете передать только код приглашения:
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={inviteCode}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
              <button
                type="button"
                className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg hover:bg-black"
                onClick={() => handleCopy(inviteCode)}
              >
                Копировать
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition text-sm"
          >
            Закрыть
          </button>
          {!inviteLink && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition text-sm disabled:opacity-50"
            >
              {loading ? "Создаём..." : "Сгенерировать ссылку"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInviteModal;


