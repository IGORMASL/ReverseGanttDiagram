import { Link, useNavigate } from "react-router-dom";
import type { FC } from "react";
import { clearAuth } from "../api/auth";
import logo from "../components/free-icon-gantt-chart-5555321.png";
import { ChevronDown } from "lucide-react";

interface HeaderProps {
  fullName: string;
  systemRole: "User" | "Admin";
  onCreateClass?: () => void;
  onAddClass?: () => void;
  /** Показывать ли поиск по классам (по умолчанию true) */
  showSearch?: boolean;
  /** Показывать ли кнопку создания/добавления класса (по умолчанию true) */
  showClassAction?: boolean;
}

const HeaderClasses: FC<HeaderProps> = ({
  fullName,
  systemRole,
  onCreateClass,
  onAddClass,
  showSearch = true,
  showClassAction = true,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (systemRole === "Admin") {
      onCreateClass?.(); // открыть модалку создания класса
    } else {
      if (onAddClass) {
        onAddClass();
      } else {
        alert("Добавить класс (ввести код/ссылку) — реализовать позже.");
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/auth");
  };

  const handleSearch = () => {
    // TODO: реализовать поиск по классам
    alert("Поиск будет реализован позже");
  };

  return (
    <header className="w-full h-20 border-b border-b-neutral-200 bg-gray-100 px-8 flex items-center justify-between">
      {/* Логотип */}
      <Link to="/classes" className="flex items-center gap-3 hover:opacity-80">
        <img src={logo} alt="logo" className="w-10 h-10 rounded-xl" />
        <h1 className="text-xl font-semibold">Реверсивная диаграмма Ганта</h1>
      </Link>

      {/* Поиск (опционально) */}
      {showSearch && (
        <div className="flex-1 flex justify-start px-8 mx-20">
          <div className="flex items-center gap-3 w-full max-w-md">
            <input
              type="text"
              placeholder="Поиск по классам..."
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm
                         focus:ring-2 focus:ring-black outline-none transition"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-black hover:text-white
                         border border-gray-300 shadow-sm transition text-sm"
            >
              Найти
            </button>
          </div>
        </div>
      )}

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
            {fullName || "Пользователь"}
            <ChevronDown size={16} />
          </button>

          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md
                          opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                          pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto
                          transition duration-200">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
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
  );
};

export default HeaderClasses;
