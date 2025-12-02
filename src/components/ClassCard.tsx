// src/components/ClassCard.tsx
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { ClassRoleLabels } from "../api/classes";
import editLogo from "../components/free-icon-font-edit-3917361.png";

type ClassCardProps = {
  title: string;
  description?: string;
  classRole?: 0 | 1;
  color?: string;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const TEACHER_COLOR = "#BA6B32";
const STUDENT_COLOR = "#48832F";

/**
 * Затемняет HEX-цвет на заданный процент.
 */
function darkenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace("#", "");
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);

  const r = (num >> 16) - amt;
  const g = ((num >> 8) & 0x00ff) - amt;
  const b = (num & 0x0000ff) - amt;

  const clamp = (value: number) => (value < 0 ? 0 : value > 255 ? 255 : value);

  return (
    "#" +
    (
      0x1000000 +
      clamp(r) * 0x10000 +
      clamp(g) * 0x100 +
      clamp(b)
    )
      .toString(16)
      .slice(1)
  );
}

const ClassCard: FC<ClassCardProps> = ({
  title,
  description,
  classRole,
  color = "#4A90E2",
  onClick,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const roleColor =
    classRole === 1
      ? TEACHER_COLOR
      : classRole === 0
      ? STUDENT_COLOR
      : STUDENT_COLOR; // учитель / студент

  const arrowColor = darkenColor(color, 20);

  // Закрываем меню при клике вне кнопки/меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="w-full max-w-[500px] h-[230px] bg-white rounded-xl shadow-md flex">
      <div className="flex flex-col justify-between p-6 flex-1">
        <div>
          <h2 className="font-bold text-[28px] leading-tight text-black break-words">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-600 mt-5 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Кнопка-иконка карандаша в левом нижнем углу с фиксированным позиционированием меню */}
          {(onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center focus:outline-none"
              >
                <img src={editLogo} className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg text-sm overflow-hidden z-20">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      Изменить
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {classRole !== undefined && (
            <div className="flex justify-start">
              <p className="text-lg font-medium" style={{ color: roleColor }}>
                {ClassRoleLabels[classRole]}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClick}
        style={{ backgroundColor: color }}
        className="w-[120px] flex items-center justify-center rounded-r-xl hover:opacity-90 transition"
      >
        <svg width="40" height="40" fill="none">
          <path
            d="M5 12h14"
            stroke={arrowColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 5l7 7-7 7"
            stroke={arrowColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default ClassCard;
