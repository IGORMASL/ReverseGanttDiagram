// src/pages/ClassesPage.tsx
import HeaderClasses from "../components/HeaderClasses";
import { useState } from "react";

export default function ClassesPage() {
  // Тестовые данные пользователя
  const [user] = useState({
    fullName: "Иван Иванов",
    role: "Admin" as "User" | "Admin"
  });

  // Пример списка классов
  const [classes] = useState([
    { id: 1, name: "Математика" },
    { id: 2, name: "Физика" },
    { id: 3, name: "История" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <HeaderClasses fullName={user.fullName} role={user.role} />

      {/* Контент страницы */}
      <main className="px-8 py-6">
        <h2 className="text-2xl font-semibold mb-4">Мои классы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            >
              {cls.name}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
