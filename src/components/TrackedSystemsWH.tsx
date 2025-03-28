"use client";

import { Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface TrackedSystem {
  system: string;
  classLabel: string;
  staticsInfo: { category: string; color: string }[];
}

interface TrackedSystemsProps {
  trackedSystems: TrackedSystem[];
  setTrackedSystems: React.Dispatch<React.SetStateAction<TrackedSystem[]>>;
  onSystemClick: (systemName: string) => void; // Функция для обработки клика
}

export default function TrackedSystems({ trackedSystems, setTrackedSystems, onSystemClick }: TrackedSystemsProps) {
  // Удаление системы из списка
  const removeTrackedSystem = (index: number) => {
    const updatedSystems = trackedSystems.filter((_, i) => i !== index);
    setTrackedSystems(updatedSystems); // Обновляем состояние
    localStorage.setItem("trackedSystems", JSON.stringify(updatedSystems)); // Обновляем localStorage
  };

  // Функция для получения цвета класса системы
  const getClassColor = (classLabel: string): string => {
    const classNumber = classLabel.match(/C-(\d+)/); // Извлекаем число из строки "C-4"
    if (classNumber) {
      const className = `c${classNumber[1]}`;
      switch (className) {
        case "c1":
          return "text-sky-500";
        case "c2":
          return "text-blue-500";
        case "c3":
          return "text-teal-500";
        case "c4":
          return "text-orange-500";
        case "c5":
          return "text-red-500";
        case "c6":
          return "text-purple-500";
        default:
          return "text-yellow-300";
      }
    }
    return "text-yellow-300";
  };

  return (
    <div className="mt-0 p-4 bg-gradient-to-r from-[#06091F] to-[#161A31] border border-[rgba(105,113,162,0.16)] rounded-lg shadow-md">
      
      <Accordion type="multiple" defaultValue={["item-1"]} className="w-full border-b-0 pb-0 py-0">
        <AccordionItem value="item-1" className="border-b-0 pb-0 py-0">
          <AccordionTrigger className="flex py-1 justify-between items-center text-green-400 font-medium text-sm hover:no-underline">Системы слежения</AccordionTrigger>
          <AccordionContent>
          {/* <h2 className="text-xl font-bold text-slate-300">Системы слежения</h2> */}
            <div className="mt-2 space-y-2">
              {trackedSystems.length > 0 ? (
                trackedSystems.map((system, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#161A31] rounded-md shadow-sm cursor-pointer"
                    onClick={() => onSystemClick(system.system)} // Обработка клика
                  >
                    {/* Левая часть: информация о системе */}
                    <div className="flex flex-col gap-2">
                      {/* Первая строка: J171430 C-4 */}
                      <div className="flex flex-row items-center gap-2">
                        <p className="text-slate-300 font-medium">{system.system}</p>
                        <p
                          className={`text-sm font-bold ${getClassColor(system.classLabel)}`}
                        >
                          {system.classLabel}
                        </p>
                      </div>

                      {/* Вторая строка: Статик в: C3 HS */}
                      <div>
                        {system.staticsInfo && system.staticsInfo.length > 0 ? (
                          <p className="text-slate-300 text-sm">
                            <strong>Статик в:</strong>{" "}
                            {system.staticsInfo.map((info, idx) => (
                              <span
                                key={idx}
                                className={`mr-2 ${info.color}`}
                                style={{ color: info.color.replace("text-", "#") }}
                              >
                                {`${info.category.toUpperCase()}`}
                              </span>
                            ))}
                          </p>
                        ) : (
                          <p className="text-slate-400 text-sm">Нет данных о статиках</p>
                        )}
                      </div>
                    </div>

                    {/* Правая часть: кнопка "Удалить" */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события
                        removeTrackedSystem(index);
                      }}
                      className="text-red-500 hover:text-red-600 ml-auto"
                    >
                      <Trash2 size={16} className="text-red" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Нет отслеживаемых систем</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      
     
    </div>
  );
}

