import { Link, useNavigate } from "react-router-dom";
import { useState, type FC } from "react";
import { clearAuth } from "../api/auth";
import logo from "../components/free-icon-gantt-chart-5555321.png";
import { ChevronDown } from "lucide-react";
import { useNotification } from "./NotificationProvider";
import ProfileModal from "./ProfileModal";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  fullName: string;
  systemRole: "User" | "Admin";
  onCreateClass?: () => void;
  onAddClass?: () => void;
  /** Показывать ли кнопку создания/добавления класса (по умолчанию true) */
  showClassAction?: boolean;
}

const HeaderClasses: FC<HeaderProps> = ({
  fullName,
  systemRole,
  onCreateClass,
  onAddClass,
  showClassAction = true,
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleAction = () => {
    if (systemRole === "Admin") {
      onCreateClass?.(); // открыть модалку создания класса
    } else {
      if (onAddClass) {
        onAddClass();
      } else {
        showNotification("Добавить класс (ввести код) будет реализовано позже", "info");
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/auth");
  };

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
      <header className="w-full h-20 border-b border-b-neutral-200 bg-gray-100 px-8 flex items-center justify-between">
        {/* Логотип */}
        <Link to="/classes" className="flex items-center gap-3 hover:opacity-80">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-xl" />
          <h1 className="text-xl font-semibold">Реверсивная диаграмма Ганта</h1>
        </Link>

        {/* Блок действий и профиля */}
        <div className="flex items-center gap-6">
          {showClassAction && (
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-indigo-200 rounded-lg hover:bg-black hover:text-white transition text-sm"
            >
              {systemRole === "Admin" ? "Создать класс" : "Добавить класс"}
            </button>
          )}

          {/* Меню профиля */}
          <div className="relative group">
            <button className="flex items-center gap-2 font-medium cursor-pointer focus:outline-none">
              {user?.fullName || fullName || "Пользователь"}
              <ChevronDown size={16} />
            </button>

            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md
                            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                            pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto
                            transition duration-200">
              <button 
                onClick={handleOpenProfile}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
              >
                Профиль
              </button>
              {/* разделительная полоска */}
              <div className="border-t border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Модальное окно профиля */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={handleCloseProfile}
        initialName={user?.fullName || fullName}
        initialEmail={user?.email || ""}
      />
    </>
  );
};

export default HeaderClasses;
