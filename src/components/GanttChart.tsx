import { useEffect, useMemo, useRef, useState } from "react";
import {
  TaskStatusLabels,
  TaskTypeLabels,
  type TaskTree,
} from "../api/tasks";

type GanttChartProps = {
  tasks: TaskTree[];
  loading?: boolean;
  error?: string | null;
  onReload?: () => void;
  title?: string;
  placeholder?: string;
  onCreateTask?: () => void;
  onSelectTask?: (task: TaskTree) => void;
  projectStartDate?: string;
  projectEndDate?: string;
  selectedTaskId?: string;
};

type FlattenedTask = TaskTree & { level: number };

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const ROW_HEIGHT = 72;
const GRID_WIDTH = 280;

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(start: Date, end: Date) {
  // Количество целых дней между датами: [start, end)
  // Например: 9–10 дек = 1 день, 9–16 дек = 7 дней.
  return Math.max(1, (end.getTime() - start.getTime()) / MS_IN_DAY);
}

function durationInDays(start: Date, end: Date) {
  // Визуальная длительность бара: [start, end] включительно.
  // 9–9 = 1 клетка, 9–10 = 2 клетки (бар от линии start до линии end+1 день).
  return Math.max(1, (end.getTime() - start.getTime()) / MS_IN_DAY + 1);
}

function flattenTasks(
  tasks: TaskTree[],
  level = 0,
  seen: Set<string> = new Set()
): FlattenedTask[] {
  return tasks.flatMap((task) => {
    if (seen.has(task.id)) return [];
    seen.add(task.id);
    const current: FlattenedTask = { ...task, level };
    const children = task.subtasks
      ? flattenTasks(task.subtasks ?? [], level + 1, seen)
      : [];
    return [current, ...children];
  });
}

function buildVisible(
  tasks: TaskTree[],
  collapsed: Set<string>,
  level = 0,
  seen: Set<string> = new Set()
): FlattenedTask[] {
  return tasks.flatMap((task) => {
    if (seen.has(task.id)) return [];
    seen.add(task.id);
    const current: FlattenedTask = { ...task, level };
    if (collapsed.has(task.id)) {
      return [current];
    }
    const children = task.subtasks
      ? buildVisible(task.subtasks ?? [], collapsed, level + 1, seen)
      : [];
    return [current, ...children];
  });
}

export default function GanttChart({
  tasks,
  loading = false,
  error = null,
  onReload,
  title = "Диаграмма Гантта",
  placeholder = "Задач пока нет",
  onCreateTask,
  onSelectTask,
  projectStartDate,
  projectEndDate,
  selectedTaskId,
}: GanttChartProps) {
  const flatTasksAll = useMemo(() => flattenTasks(tasks), [tasks]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [timelineWidth, setTimelineWidth] = useState(1000);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);

  const flatTasks = useMemo(() => buildVisible(tasks, collapsed, 0), [tasks, collapsed]);

  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        const el = timelineRef.current;
        const width = el.scrollWidth || el.offsetWidth || 1000;
        setTimelineWidth(width);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [flatTasks.length, tasks]);

  useEffect(() => {
    const header = headerScrollRef.current;
    const body = timelineScrollRef.current;
    if (!header || !body) return;

    const handleScroll = () => {
      if (header.scrollLeft !== body.scrollLeft) {
        header.scrollLeft = body.scrollLeft;
      }
    };

    body.addEventListener("scroll", handleScroll);
    return () => body.removeEventListener("scroll", handleScroll);
  }, [flatTasks.length, tasks]);

  const toggleCollapse = (taskId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const { minDate, maxDate, totalDays } = useMemo(() => {
    // Если заданы даты проекта – строим диаграмму строго в их рамках
    if (projectStartDate && projectEndDate) {
      const projectStart = startOfDay(new Date(projectStartDate));
      const projectEnd = startOfDay(new Date(projectEndDate));
      const days = Math.max(1, diffInDays(projectStart, projectEnd));
      return { minDate: projectStart, maxDate: projectEnd, totalDays: days };
    }

    if (flatTasks.length === 0) {
      const today = startOfDay(new Date());
      return { minDate: today, maxDate: today, totalDays: 1 };
    }

    const start = flatTasks
      .map((t) => startOfDay(new Date(t.startDate)))
      .reduce((acc, curr) => (curr < acc ? curr : acc));
    const end = flatTasks
      .map((t) => startOfDay(new Date(t.endDate)))
      .reduce((acc, curr) => (curr > acc ? curr : acc));
    const paddingDays = 10;
    const paddedStart = new Date(start.getTime() - paddingDays * MS_IN_DAY);
    const paddedEnd = new Date(end.getTime() + paddingDays * MS_IN_DAY);

    return {
      minDate: paddedStart,
      maxDate: paddedEnd,
      totalDays: diffInDays(paddedStart, paddedEnd),
    };
  }, [flatTasks, projectStartDate, projectEndDate]);

  const ticks = useMemo(() => {
    const days = Math.max(1, totalDays);
    return Array.from({ length: days + 1 }, (_, idx) => {
      const date = new Date(minDate.getTime() + idx * MS_IN_DAY);
      return { label: formatDate(date), offsetPercent: (idx / days) * 100 };
    });
  }, [minDate, totalDays]);

  // Цвета баров по типу задачи:
  // 0 — результат, 1 — задача, 2 — подзадача
  const barColorByType = (type: number) => {
    switch (type) {
      case 0:
        return "bg-[#E5ACF7]"; // фиолетовый для результата
      case 1:
        return "bg-[#ACE9F7]"; // голубой для задачи
      case 2:
        return "bg-[#F7DDAC]"; // жёлтый для подзадачи
      default:
        return "bg-gray-300";
    }
  };

  const barRingByType = (type: number) => {
    switch (type) {
      case 0:
        return "ring-2 ring-[#C06EDB]"; // более насыщенный фиолетовый
      case 1:
        return "ring-2 ring-[#3BAAD1]"; // более насыщенный голубой
      case 2:
        return "ring-2 ring-[#E0A44A]"; // более насыщенный жёлтый
      default:
        return "ring-2 ring-gray-400";
    }
  };

  const typeTone = (type: number) => {
    switch (type) {
      case 0:
        return "text-violet-600 border-violet-100 bg-violet-50";
      case 1:
        return "text-sky-600 border-sky-100 bg-sky-50";
      case 2:
        return "text-amber-600 border-amber-100 bg-amber-50";
      default:
        return "text-gray-600 border-gray-100 bg-gray-50";
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {formatDate(minDate)} — {formatDate(maxDate)} · {totalDays} дн.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error ? (
            <span className="text-sm text-red-500">Ошибка: {error}</span>
          ) : null}
          {onCreateTask && (
            <button
              type="button"
              onClick={onCreateTask}
              className="text-sm px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900"
            >
              Добавить задачу
            </button>
          )}
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Обновить
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Загрузка задач...</p>
      ) : flatTasks.length === 0 ? (
        <p className="text-gray-500 text-sm">{placeholder}</p>
      ) : (
        <div className="overflow-x-hidden overflow-y-auto border border-gray-100 rounded-xl min-h-[360px] pb-4">
          {/* Заголовок грид + шкала */}
          <div
            className="grid border-b border-gray-100 bg-white"
            style={{ gridTemplateColumns: `${GRID_WIDTH}px 1fr` }}
          >
            <div className="flex items-center gap-3 text-xs text-gray-600 px-4 py-3">
              <button
                type="button"
                className="text-xs text-gray-600 hover:text-gray-900 underline"
                onClick={() =>
                  setCollapsed((prev) =>
                    prev.size ? new Set<string>() : new Set(flatTasksAll.map((t) => t.id))
                  )
                }
              >
                {collapsed.size ? "Развернуть все" : "Свернуть все"}
              </button>
              <span className="text-[11px] text-gray-500">Задача</span>
            </div>
            <div className="overflow-hidden" ref={headerScrollRef}>
              <div className="relative h-10 px-4 min-w-[1200px]">
                {/* Вертикальная сетка дат */}
                <div className="absolute inset-0">
                  {ticks.map((tick) => (
                    <div
                      key={`grid-${tick.offsetPercent}`}
                      className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${tick.offsetPercent}%` }}
                    />
                  ))}
                </div>
                {/* Подписи дат в середине интервала между линиями */}
                <div className="absolute inset-0 flex items-center text-[11px] text-gray-500">
                  {ticks.slice(0, -1).map((tick, index) => {
                    const next = ticks[index + 1];
                    const mid = (tick.offsetPercent + next.offsetPercent) / 2;
                    return (
                      <span
                        key={`label-${tick.offsetPercent}`}
                        className="absolute -translate-x-1/2"
                        style={{ left: `${mid}%` }}
                      >
                        {tick.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Тело: две независимые колонки (левая фикс, правая таймлайн). Бары не залезают на список. */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `${GRID_WIDTH}px 1fr`,
            }}
          >
            {/* Левая колонка с иерархией */}
            <div className="pb-4">
              {flatTasks.map((task) => {
                const start = new Date(task.startDate);
                const end = new Date(task.endDate);
                const hasChildren = task.subtasks && task.subtasks.length > 0;
                const isSelected = selectedTaskId === task.id;

                return (
                  <div
                    key={`grid-${task.id}`}
                    className={
                      "flex flex-col justify-center pl-2 pr-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 " +
                      (isSelected ? "bg-gray-100 border-l-4 border-l-black" : "bg-white")
                    }
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => onSelectTask && onSelectTask(task)}
                  >
                    <div className="flex items-center gap-2">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleCollapse(task.id)}
                          className="w-4 h-4 flex items-center justify-center text-gray-600 hover:text-gray-900"
                          aria-label="toggle-subtasks"
                        >
                          {collapsed.has(task.id) ? "▶" : "▼"}
                        </button>
                      ) : (
                        <span className="w-4 h-4" />
                      )}
                      <span
                        className="text-sm font-medium text-gray-900 truncate"
                        style={{ marginLeft: task.level === 0 ? 0 : task.level * 4 }}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${typeTone(
                          task.type
                        )}`}
                      >
                        {TaskTypeLabels[task.type]}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 ml-2 space-y-0.5">
                      <p>
                        <span className="font-medium">{TaskStatusLabels[task.status]}</span>
                        <span className="mx-1">·</span>
                        <span>
                          {start.toLocaleDateString("ru-RU")} — {end.toLocaleDateString("ru-RU")}
                        </span>
                      </p>
                      {task.assignedUsers?.length ? (
                        <p className="truncate">
                          <span className="font-medium">Исполнители: </span>
                          {task.assignedUsers.map((u) => u.fullName).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Правая колонка: таймлайн, по горизонтали скролл, по вертикали без собственного скролла */}
            <div className="relative overflow-x-auto overflow-y-hidden" ref={timelineScrollRef}>
              <div
                className="relative min-w-[1200px]"
                ref={timelineRef}
                style={{ height: flatTasks.length * ROW_HEIGHT + 40 }}
              >
                {/* Вертикальная сетка дат */}
                <div className="absolute inset-0 pointer-events-none">
                  {ticks.map((tick) => (
                    <div
                      key={`gridline-${tick.offsetPercent}`}
                      className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${tick.offsetPercent}%` }}
                    />
                  ))}
                </div>

                {/* Бары задач */}
                <div className="relative w-full h-full">
                  {flatTasks.map((task, idx) => {
                    const start = startOfDay(new Date(task.startDate));
                    const end = startOfDay(new Date(task.endDate));
                    const leftPercent =
                      ((start.getTime() - minDate.getTime()) / MS_IN_DAY / totalDays) * 100;
                    const widthPercent = (durationInDays(start, end) / totalDays) * 100;

                    const safeLeft = Math.max(0, Math.min(100, leftPercent));
                    const safeWidth = Math.max(0, Math.min(widthPercent, 100 - safeLeft));

                    const isSelected = selectedTaskId === task.id;

                    const tooltipLines = [
                      task.title,
                      `${formatDate(start)} — ${formatDate(end)}`,
                      TaskStatusLabels[task.status],
                      task.assignedUsers?.length
                        ? task.assignedUsers.map((u) => u.fullName).join(", ")
                        : "",
                    ].filter(Boolean);

                    return (
                      <div
                        key={`bar-${task.id}`}
                        className="absolute px-4 cursor-pointer"
                        style={{
                          top: idx * ROW_HEIGHT + (ROW_HEIGHT - 36) / 2,
                          left: 0,
                          right: 0,
                        }}
                        onClick={() => onSelectTask && onSelectTask(task)}
                        title={tooltipLines.join("\n")}
                      >
                        <div className="relative h-9 w-full">
                          {/* Цветной фон бара по типу задачи */}
                          <div
                            className={`absolute top-1 bottom-1 rounded-md shadow-sm ${barColorByType(
                              task.type
                            )} ${isSelected ? barRingByType(task.type) : ""}`}
                            style={{
                              left: `${safeLeft}%`,
                              width: `${safeWidth}%`,
                            }}
                          ></div>

                          {/* Текст поверх бара: только название задачи */}
                          <div
                            className="absolute inset-0 flex items-center px-3 text-[11px] text-slate-800 pointer-events-none"
                            style={{
                              left: `${safeLeft}%`,
                              width: `${safeWidth}%`,
                            }}
                          >
                            <span className="flex-1 truncate font-medium">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Стрелки зависимостей */}
                {flatTasks.length > 0 && (
                  <svg
                    className="pointer-events-none absolute inset-0"
                    viewBox={`0 0 ${timelineWidth} ${flatTasks.length * ROW_HEIGHT}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                      >
                        <path d="M0,0 L7,3.5 L0,7 z" fill="#94a3b8" />
                      </marker>
                    </defs>
                    {flatTasks.map((task, idx) => {
                      if (!task.dependencies?.length) return null;

                      const start = startOfDay(new Date(task.startDate));
                      const leftPercent =
                        ((start.getTime() - minDate.getTime()) / MS_IN_DAY / totalDays) * 100;

                      // Отображаем стрелки в той же "внутренней" области, что и бары (с учётом горизонтальных отступов)
                      const paddingX = 32; // соответствует суммарному горизонтальному паддингу (px-4) контейнера баров
                      const innerWidth = Math.max(1, timelineWidth - paddingX);
                      const clampPercent = (percent: number) =>
                        Math.max(0, Math.min(100, percent));
                      const toInnerX = (percent: number) =>
                        (paddingX / 2) + (clampPercent(percent) / 100) * innerWidth;

                      return task.dependencies.map((depId) => {
                        const sourceIndex = flatTasks.findIndex((t) => t.id === depId);
                        if (sourceIndex === -1) return null;
                        const source = flatTasks[sourceIndex];
                        const sourceStart = startOfDay(new Date(source.startDate));
                        const sourceEnd = startOfDay(new Date(source.endDate));
                        const sourceLeft =
                          ((sourceStart.getTime() - minDate.getTime()) / MS_IN_DAY / totalDays) *
                          100;
                        const sourceWidth =
                          (durationInDays(sourceStart, sourceEnd) / totalDays) * 100;

                        // Правая внешняя граница бара-источника
                        const sourceRightPercent = clampPercent(sourceLeft + sourceWidth);
                        const x1 = toInnerX(sourceRightPercent);
                        const y1 = sourceIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
                        // Левая внешняя граница бара-приёмника
                        const targetLeftPercent = clampPercent(leftPercent);
                        const x2 = toInnerX(targetLeftPercent);
                        const y2 = idx * ROW_HEIGHT + ROW_HEIGHT / 2;

                        // Форма стрелки с 4 изгибами:
                        // 1) от правого края исходного бара вправо,
                        // 2) вниз до середины между барами,
                        // 3) влево до уровня перед целевым баром,
                        // 4) вниз до уровня целевого бара и влево к его левому краю.

                        // Разводим параллельные стрелки веером по горизонтали:
                        // чем выше индекс зависимости в task.dependencies, тем больше отступ.
                        const depIndex = task.dependencies.findIndex((id) => id === depId);
                        const layer = depIndex >= 0 ? depIndex : 0;
                        const baseOffsetPx = 20;
                        const offsetStepPx = 10;
                        const offsetPx = baseOffsetPx + layer * offsetStepPx;

                        const xOut = x1 + offsetPx; // выход вправо от первого бара
                        const xIn = x2 - offsetPx; // подход слева к целевому бару
                        const midY = (y1 + y2) / 2; // середина по вертикали между барами

                        return (
                          <path
                            key={`${task.id}-${depId}`}
                            d={`M ${x1} ${y1} L ${xOut} ${y1} L ${xOut} ${midY} L ${xIn} ${midY} L ${xIn} ${y2} L ${x2} ${y2}`}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.6"
                            markerEnd="url(#arrow)"
                          />
                        );
                      });
                    })}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


