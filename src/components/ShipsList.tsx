"use client";
import type { FC } from "react";
import { useState, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react"; // Используем иконки из Lucide
import Image from "next/image";

// Функция для удаления HTML-тегов из строки
const stripHtmlTags = (htmlString: string | null): string => {
  if (!htmlString) return "Описание отсутствует";
  return htmlString.replace(/<[^>]*>/g, ""); // Удаляем все теги
};

// Типизация данных для JSON-структуры
interface Ship {
  id: number;
  name: { en: string; ru: string };
  description: { en: string | null; ru: string | null }; // Разрешаем null
  basePrice: number | null; // Разрешаем null
  image_url: string;
}
interface Group {
  groupId: number;
  name: { en: string; ru: string };
  description: { en: string | null; ru: string | null }; // Разрешаем null
  subGroups?: Record<string, Group>; // Вложенные группы
  ships?: Ship[]; // Массив кораблей
}
interface ShipsData {
  groupId: number;
  name: { en: string; ru: string };
  subGroups: Record<string, Group>;
}

const ShipsList: FC<{ data: ShipsData }> = ({ data }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Функция для плавного скролла к элементу
  const smoothScrollToElement = (elementId: number) => {
    if (containerRef.current) {
      const element = document.getElementById(`group-${elementId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  // Обработчик переключения состояния группы (раскрытие/свертывание)
  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId); // Закрываем группу
      } else {
        newSet.add(groupId); // Открываем группу
      }
      return newSet;
    });
    smoothScrollToElement(groupId);
  };

  // Рекурсивная функция для отрисовки групп и кораблей
  const renderGroup = (group: Group, level = 0) => {
    const isExpanded = expandedGroups.has(group.groupId);
    return (
      <li
        key={group.groupId}
        id={`group-${group.groupId}`}
        className={`ml-${level * 2} list-none flex flex-col space-y-2`}
      >
        {/* Группа */}
        <div
          className="cursor-pointer font-bold text-lg flex items-center text-slate-300"
          onClick={() => toggleGroup(group.groupId)}
        >
          {/* Используем иконки из Lucide */}
          {isExpanded ? (
            <ChevronDown className="mr-2 text-slate-500" size={16} />
          ) : (
            <ChevronRight className="mr-2 text-slate-500" size={16} />
          )}
          <span className="text-slate-300">{group.name.ru}</span>
        </div>

        {/* Подгруппы и корабли */}
        {isExpanded && (
          <ul className="pl-6 space-y-2">
            {/* Вывод подгрупп */}
            {group.subGroups &&
              Object.values(group.subGroups).map((subGroup) =>
                renderGroup(subGroup, level + 1)
              )}

            {/* Вывод кораблей */}
            {group.ships && (
              <ul className="list-none p-0 space-y-2">
                {group.ships.map((ship) => (
                  <li key={ship.id} className="flex items-center gap-2">
                    {/* Изображение корабля */}
                    <Image
                      src={ship.image_url}
                      alt={ship.name.ru}
                      width={64}
                      height={64}
                      className="rounded-sm bg-slate-800"
                      unoptimized // Если изображения не оптимизируются автоматически
                    />

                    {/* Информация о корабле */}
                    <div className="text-slate-300">
                      <strong className="block text-slate-300">
                        {ship.name.ru}
                      </strong>
                      <span className="text-sm text-slate-500">
                        {stripHtmlTags(ship.description.ru) ?? "Описание отсутствует"}{" "}
                        {/* Очистка HTML-тегов */}
                      </span>
                      <br /> {/* Перенос строки */}
                      <span className="text-sm text-green-400">
                        Базовая цена:{" "}
                        {(ship.basePrice ?? 0).toLocaleString("ru-RU")} ISK{" "}
                        {/* Форматирование цены */}
                      </span>

                      {/* Ссылка "Подробнее" */}
                      <div className="mt-2">
                        <a
                          href={`/ships/${ship.id}`}
                          className="text-blue-400 hover:underline"
                        >
                          Подробнее
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className="max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg"
    >
      <div
        className="w-full max-w-7xl px-4 py-6 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: "80vh" }}
        ref={containerRef}
      >
        {/* Кастомный скролл через CSS */}
        <style jsx>{`
          /* Стилизация скроллбара */
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px; /* Ширина скроллбара */
          }
          /* Фон трека скроллбара */
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(10, 11, 35, 0.2); /* Темная и светлая тема */
            border-radius: 10px; /* Скругление углов */
          }
          /* Ползунок скроллбара */
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(105, 113, 162, 0.4); /* Темная и светлая тема */
            border-radius: 10px; /* Скругление углов */
          }
          /* Эффект при наведении на ползунок */
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(105, 113, 162, 0.6); /* Темная и светлая тема */
          }
          /* Активный ползунок (при перетаскивании) */
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: rgba(105, 113, 162, 0.8); /* Темная и светлая тема */
          }
        `}</style>

        <h1 className="text-2xl font-bold mb-4 text-center text-slate-300">
          {data.name.ru}
        </h1>

        {/* Основной список групп и кораблей */}
        <ul className="space-y-2 w-full">
          {Object.values(data.subGroups).map((group) => renderGroup(group))}
        </ul>
      </div>
    </div>
  );
};

export default ShipsList;
