import { useState, useEffect } from "react";
import { updateProfileName, verifyCurrentPassword, updatePassword } from "../api/users";
import FieldError from "./FieldError";
import { useAuth } from "../hooks/useAuth";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialEmail?: string;
};

export default function ProfileModal({ isOpen, onClose, initialName = "", initialEmail = "" }: ProfileModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"view" | "editName" | "editPassword">("view");
  const { user, setUser } = useAuth();
  
  // Состояния для ошибок полей
  const [nameError, setNameError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Инициализация данных при открытии модального окна или изменении начальных данных
  useEffect(() => {
    if (isOpen) {
      // Используем реальные данные из useAuth если они есть
      setName(user?.fullName || initialName);
      setEmail(user?.email || initialEmail);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("view");
      // Сбрасываем ошибки
      setNameError("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
      setSuccessMessage("");
    }
  }, [isOpen, user, initialName, initialEmail]);

  // Автоматически скрываем success сообщение через 3 секунды
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleNameChange = async () => {
    // Сбрасываем предыдущие ошибки
    setNameError("");
    
    if (!name.trim()) {
      setNameError("Имя не может быть пустым");
      return;
    }

    setLoading(true);
    try {
      await updateProfileName(name);
      setSuccessMessage("Имя успешно изменено");
      
      // Обновляем данные в useAuth
      if (user && setUser) {
        setUser({ ...user, fullName: name });
      }
      
      // Обновляем имя в localStorage чтобы оно отобразилось в хедере
      localStorage.setItem("fullName", name);
      
      setMode("view");
    } catch (err) {
      console.error(err);
      setNameError("Не удалось изменить имя");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Сбрасываем предыдущие ошибки
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (!currentPassword) setCurrentPasswordError("Введите текущий пароль");
      if (!newPassword) setNewPasswordError("Введите новый пароль");
      if (!confirmPassword) setConfirmPasswordError("Подтвердите новый пароль");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Новые пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      setNewPasswordError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);
    try {
      // Проверяем текущий пароль
      const isValid = await verifyCurrentPassword(currentPassword);
      
      if (!isValid || isValid === undefined) {
        setCurrentPasswordError("Неверный текущий пароль");
        return;
      }

      // Меняем пароль
      await updatePassword(newPassword);
      setSuccessMessage("Пароль успешно изменен");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("view");
    } catch (err) {
      console.error("Ошибка при смене пароля:", err);
      setCurrentPasswordError("Не удалось изменить пароль. Проверьте правильность текущего пароля.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMode("view");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    // Сбрасываем ошибки
    setNameError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");
    // Возвращаем исходные данные из useAuth
    setName(user?.fullName || initialName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Профиль</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Success сообщение */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {mode === "view" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Имя</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{name}</span>
                <button
                  onClick={() => setMode("editName")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Изменить
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <div className="text-gray-900">{email}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Пароль</label>
              <div className="flex items-center justify-between">
                <span className="text-gray-900">••••••••</span>
                <button
                  onClick={() => setMode("editPassword")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Изменить
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "editName" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNameChange(); }}>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Новое имя</label>
              <FieldError message={nameError} visible={!!nameError} onHide={() => setNameError("")} />
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите новое имя"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
              >
                {loading ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </form>
        )}

        {mode === "editPassword" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }}>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Текущий пароль</label>
              <FieldError message={currentPasswordError} visible={!!currentPasswordError} onHide={() => setCurrentPasswordError("")} />
              <input
                type="password"
                autoComplete="current-password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  currentPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Введите текущий пароль"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Новый пароль</label>
              <FieldError message={newPasswordError} visible={!!newPasswordError} onHide={() => setNewPasswordError("")} />
              <input
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  newPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Подтвердите новый пароль</label>
              <FieldError message={confirmPasswordError} visible={!!confirmPasswordError} onHide={() => setConfirmPasswordError("")} />
              <input
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
              >
                {loading ? "Сохраняем..." : "Изменить пароль"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
