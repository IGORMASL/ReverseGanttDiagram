import { Link } from "react-router-dom";

interface HeaderProps {
  fullName: string;
  role: "User" | "Admin";
}

export default function HeaderClasses({ fullName, role }: HeaderProps) {

  const getActionButtonLabel = () => {
    return role === "Admin" ? "Создать класс" : "Добавить класс";
  };

  return (
    <header className="w-full h-20 border-b bg-white px-8 flex items-center justify-between">

      {/* Левая часть — лого + название */}
      <Link to="/classes" className="flex items-center gap-3 hover:opacity-80">
        <div className="w-10 h-10 bg-black rounded-xl"></div>
        <h1 className="text-xl font-semibold">
          Реверсивная диаграмма Ганта
        </h1>
      </Link>

      {/* Поиск — строго по центру */}
      <div className="flex-1 flex justify-center px-8">
        <input
          type="text"
          placeholder="Поиск по классам..."
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm 
                     shadow-sm focus:ring-2 focus:ring-black outline-none"
        />
      </div>

      {/* Правая часть — кнопка + профиль */}
      <div className="flex items-center gap-6">

        {/* Кнопка создания/добавления класса */}
        <button
          className="px-4 py-2 border border-black rounded-lg hover:bg-black
                     hover:text-white transition text-sm"
        >
          {getActionButtonLabel()}
        </button>

        {/* Профиль */}
        <div className="relative group cursor-pointer">
          <div className="font-medium">{fullName}</div>

          {/* Выпадающее меню */}
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg 
                          opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
              Профиль
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
              Выйти
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
