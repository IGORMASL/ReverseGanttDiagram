import type { FC } from "react";
import { useState } from "react";
import { createInvite, type InviteCreateDto } from "../api/invite";
import { getErrorMessage } from "../utils/errorHandling";
import { useNotification } from "./NotificationProvider";

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
  const [copied, setCopied] = useState(false);
  const { showNotification } = useNotification();

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
      setCopied(false);
    } catch (err: any) {
      console.error("Ошибка при создании приглашения:", err);
      const message = getErrorMessage(err) || "Не удалось создать приглашение";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string | null) => {
    if (!text) return;
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // В случае ошибки оставляем поведение без всплывающих окон,
        // пользователь всё равно видит код и может скопировать вручную.
      });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Создать код-приглашение</h2>

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
            Сколько часов действует код приглашения
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

        {inviteCode && (
          <div className="mb-4">
            {copied && (
              <div className="mb-1 text-xs font-medium text-green-600">
                Код скопирован
              </div>
            )}
            
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
          {inviteCode && (
            <button
              type="button"
              onClick={() => {
                setInviteLink(null);
                setInviteCode(null);
                setCopied(false);
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
            >
              Сбросить код
            </button>
          )}
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
              {loading ? "Создаём..." : "Сгенерировать код"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInviteModal;


