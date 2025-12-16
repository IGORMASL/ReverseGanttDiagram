import type { FC } from "react";
import { useState } from "react";
import { useInvite } from "../api/invite";
import Button from "./Button";
import { getErrorMessage } from "../utils/errorHandling";

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinClassModal: FC<JoinClassModalProps> = ({ isOpen, onClose }) => {
  const [codeOrLink, setCodeOrLink] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const extractInviteId = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Если это ссылка с параметром ?inv=...
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const param = url.searchParams.get("inv");
        return param || null;
      }
    } catch {
      // ignore parse error, fallback to raw value
    }

    // иначе считаем, что это просто код
    return trimmed;
  };

  const handleJoin = async () => {
    const inviteId = extractInviteId(codeOrLink);
    if (!inviteId) {
      alert("Введите корректную ссылку или код приглашения");
      return;
    }

    try {
      setLoading(true);
      const message = await useInvite(inviteId);
      alert(message || "Вы успешно добавлены в класс");
      onClose();
      // После успешного присоединения достаточно обновить страницу списков классов
      window.location.href = "/classes";
    } catch (err: any) {
      console.error("Ошибка при присоединении к классу по приглашению:", err);
      const message = getErrorMessage(err) || "Не удалось присоединиться к классу";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Добавить класс по приглашению</h2>

        <p className="text-sm text-gray-600 mb-3">
          Вставьте ссылку-приглашение или код, который вы получили от учителя или
          администратора.
        </p>

        <textarea
          className="w-full min-h-[80px] mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
          placeholder="Ссылка или код приглашения"
          value={codeOrLink}
          onChange={(e) => setCodeOrLink(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition text-sm"
          >
            Отмена
          </button>
          <Button
            type="button"
            onClick={handleJoin}
            disabled={loading}
            className="w-auto px-4 py-2 text-sm"
          >
            {loading ? "Присоединяем..." : "Присоединиться"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;


