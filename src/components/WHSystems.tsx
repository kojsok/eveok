




"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"; // ChadCN Accordion
import { wormholeData } from "../data/wormholeData";
import whAnomalies from "../data/wh_anomaly.json"; // Импорт данных аномалий
import whTriggers from "../data/wh_triggers.json"; // Импорт данных триггеров
import { Trash2 } from "lucide-react"; // Импортируем иконку "X" из Lucide
import TrackedSystems from "./TrackedSystemsWH";
import KilledShips from './KilledShips';
import { Swords } from "lucide-react"; // Иконка мечей для убийств
import { Eye, EyeOff } from "lucide-react"; // Иконка глаза



interface TrackedSystem {
  system: string;
  classLabel: string;
  staticsInfo: { category: string; color: string }[]; // Обязательное поле, массив объектов
}

// Типы данных
interface WormholeSystem {
  solarsystemid: number;
  system: string;
  class: number;
  star: string;
  planets: number;
  moons: number;
  effect: string | null;
  statics: string;
}

interface Anomaly {
  name: string;
  value: string;
  price: string;
}

interface AnomalyGroup {
  war?: Anomaly[]; // Необязательные поля
  relic?: Anomaly[];
  data?: Anomaly[];
}

type WhAnomalies = {
  [key in "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "thera"]?: AnomalyGroup;
};

interface TriggerWave {
  Name: string;
  Type: string;
  Distance: string;
}

interface Trigger {
  Name: string;
  Triggers: {
    wave1?: TriggerWave;
    wave2?: TriggerWave;
    wave3?: TriggerWave;
  };
}

// Приводим тип к WhAnomalies
const anomaliesData: WhAnomalies = whAnomalies;

// Функция для получения цвета категории
// Функция для получения цвета категории
const getColorForCategory = (category: string): string => {
  switch (category) {
    case "hs":
      return "text-green-500";
    case "ls":
      return "text-orange-500";
    case "ns":
      return "text-red-500";
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
    case "thera":
      return "text-yellow-500";
    case "?":
      return "text-gray-500";
    default:
      return "text-slate-300";
  }
};

// Функция для поиска статика в wormholeData
// Функция для поиска статика в wormholeData
const findStatic = (staticValue: string): { category: string; color: string } => {
  for (const entry of wormholeData) {
    const foundCategory = Object.keys(entry).find(
      (key) => key !== "category" && entry[key as keyof typeof entry] === staticValue
    );
    if (foundCategory) {
      return {
        category: foundCategory,
        color: getColorForCategory(foundCategory),
      };
    }
  }
  return { category: "Null-sec", color: "text-slate-300" };
};




export default function WHSystems() {
  const [query, setQuery] = useState("");
  const [systems, setSystems] = useState<WormholeSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystemID, setSelectedSystemID] = useState<number | null>(null); // Новое состояние для выбранной системы

  // Состояние для отслеживаемых систем
  const [trackedSystems, setTrackedSystems] = useState<TrackedSystem[]>([]);

  //переключатель аккордиона
  const toggleKillsAccordion = (systemId: number) => {
    setSelectedSystemID(prev => prev === systemId ? null : systemId);
  };

   // Загрузка данных из localStorage при монтировании
   useEffect(() => {
    const systems = JSON.parse(localStorage.getItem("trackedSystems") || "[]");
    setTrackedSystems(systems);
  }, []);

 // Функция для добавления системы в список отслеживания
 const addTrackedSystem = (system: WormholeSystem) => {
  const classLabel =
    system.class === 13
      ? `C-13 (фриг ВХ)`
      : [14, 15, 16, 17, 18].includes(system.class)
        ? `C-${system.class} (дрифтерская будьте предельно аккуратны)`
        : system.class > 0
          ? `C-${system.class}`
          : `C-${Math.abs(system.class)} (разлом)`;

  // Получаем информацию о статиках
  const staticsArray = system.statics.split(",").map((staticValue) => staticValue.trim());
  const staticsInfo = staticsArray.map(findStatic);

  const trackedSystem: TrackedSystem = {
    system: system.system,
    classLabel,
    staticsInfo: staticsInfo || [], // Инициализируем как пустой массив, если статики отсутствуют
  };

  // Проверяем, есть ли система уже в списке
  const isAlreadyTracked = trackedSystems.some((s) => s.system === system.system);
  if (!isAlreadyTracked) {
    setTrackedSystems((prev) => [...prev, trackedSystem]); // Обновляем состояние
    localStorage.setItem("trackedSystems", JSON.stringify([...trackedSystems, trackedSystem])); // Сохраняем в localStorage
  }
};


  // Функция для обработки клика на отслеживаемую систему
// Функция для обработки клика на систему
const handleSystemClick = async (systemName: string) => {
  setQuery(systemName);
  setLoading(true);
  setError(null);
  // Всегда сбрасываем selectedSystemID при клике на систему
  setSelectedSystemID(null);
  try {
    const response = await fetch(`/api/wh-systems?query=${encodeURIComponent(systemName.toLowerCase())}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: WormholeSystem[] = await response.json();
    if (data.length === 0) {
      setError("Система не найдена.");
    } else {
      setSystems(data);
      setError(null);
      // Устанавливаем solarSystemID для выбранной системы
      // setSelectedSystemID(data[0].solarsystemid);

      // Новый код для управления показом убийств
      // const clickedSystemId = data[0].solarsystemid;
      // if (selectedSystemID === clickedSystemId) {
      //   // Если кликаем на ту же систему - скрываем убийства
      //   setSelectedSystemID(null);
      // } else {
      //   // Если кликаем на другую систему - показываем убийства
      //   setSelectedSystemID(clickedSystemId);
      // }

    }
  } catch (error) {
    console.error("Error fetching systems:", error);
    setError("Произошла ошибка при поиске.");
  } finally {
    setLoading(false);
  }
};

  
  const handleSearch = async () => {
    setSelectedSystemID(null); // Сбрасываем выбранную систему перед новым поиском

    // Удаляем символ '*' из строки запроса
    const trimmedQuery = query.replace(/\*/g, '').trim(); // Убираем '*' и лишние пробелы
  
    // Проверка на пустую строку
    if (!trimmedQuery) {
      setError("Система не найдена. Введите название системы в формате JXXXXXX или сообщите нам об ошибке.");
      setSystems([]);
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`/api/wh-systems?query=${encodeURIComponent(trimmedQuery.toLowerCase())}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: WormholeSystem[] = await response.json();
      if (data.length === 0) {
        setError("Система не найдена.");
      } else {
        setSystems(data);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching systems:", error);
      setError("Произошла ошибка при поиске.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery(""); // Очищаем поле ввода
    setSystems([]); // Удаляем найденные системы
    setError(null); // Убираем ошибку
    setSelectedSystemID(null); // Сбрасываем выбранную систему
  };

  // Функция для получения аномалий по классу WH
  const getAnomaliesForClass = (whClass: string): AnomalyGroup | undefined => {
    const key = `C${Math.abs(Number(whClass))}`.trim().toUpperCase() as keyof WhAnomalies;
    return anomaliesData[key];
  };

  // Функция для получения триггеров по имени аномалии
  const getTriggersForAnomaly = (anomalyName: string): Trigger | undefined => {
    return whTriggers.find((trigger) => trigger.Name.trim() === anomalyName.trim());
  };

  // Функция для получения иконки корабля
  const getShipIcon = (shipType: string): string => {
    switch (shipType.trim().toLowerCase()) {
      case "battleship":
        return "/wh/battleship.png";
      case "cruiser":
        return "/wh/cruiser.png";
      case "frigate":
        return "/wh/frigate.png";
      default:
        return "/wh/default_ship.png"; // Заглушка для неизвестных типов
    }
  };

  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      <h1 className="text-2xl font-bold mb-4 text-center">WH Systems Search</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // добавляем ввод по ентер
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Enter system name..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
        />
        <div className="flex gap-2">
          {/* Кнопка Search */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {/* Кнопка Clear с иконкой */}
          <button
            onClick={handleClear}
            className="inline-flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
          >
            <Trash2 size={16} className="text-white" /> {/* Иконка "X" из Lucide */}
          </button>
        </div>
      </div>
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-4">
        
        {/* Левая колонка: Основной контент */}
        <div>
          {systems.length > 0 ? (
            systems.map((system) => {
              const staticsArray = system.statics.split(",").map((staticValue) => staticValue.trim());
              const staticsInfo = staticsArray.map(findStatic);
              const classColor = getColorForCategory(`c${Math.abs(system.class)}`);
              const classLabel =
                system.class === 13
                  ? `C-13 (фриг ВХ)`
                  : [14, 15, 16, 17, 18].includes(system.class)
                    ? `C-${system.class} (дрифтерская будьте предельно аккуратны)`
                    : system.class > 0
                      ? `C-${system.class}`
                      : `C-${Math.abs(system.class)} (разлом)`;
              const anomalies = getAnomaliesForClass(`${Math.abs(system.class)}`);
              return (
                <div
                  key={system.solarsystemid}
                  className="p-4 bg-gradient-to-r from-[#06091F] to-[#161A31] border border-[rgba(105,113,162,0.16)] rounded-lg shadow-md transition-transform duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Левая колонка: информация о системе */}
                    <div className="flex-[2] space-y-2">
                      <h2 className="text-slate-300 text-xl font-semibold">Характеристики системы: {system.system}</h2>
                      <p className="text-slate-300 text-sm">
                        <strong>Класс ВХ:</strong>{" "}
                        <span className={`${classColor} font-bold`}>{classLabel}</span>
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Система имеет статик в:</strong>{" "}
                        {staticsInfo.map((info, index) => (
                          <span
                            key={index}
                            className={`mr-2 ${info.color}`}
                            style={{ color: info.color.replace("text-", "#") }}
                          >
                            {`${staticsArray[index]} (${info.category})`}
                          </span>
                        ))}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Эффект:</strong> {system.effect || "нет эффекта"}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Планеты:</strong> {system.planets}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Луны:</strong> {system.moons}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Звезда:</strong> {system.star}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Уровень безопасности:</strong> -1.0
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Радиус:</strong> 24.5 AE (орбита последней планеты)
                      </p>
                    </div>
                    {/* Средняя колонка: аномалии и триггеры */}
                    <div className="flex-[3] space-y-4">
                      {anomalies ? (
                        Object.entries(anomalies).map(([type, entries], typeIndex) => {
                          const typeLabel =
                            type === "war" ? "COMBAT SITE" : type === "relic" ? "RELIC SITE" : "DATA SITE";
                          const typeIcon =
                            type === "war"
                              ? "/wh/combat_site.png"
                              : type === "relic"
                                ? "/wh/relic_site.png"
                                : "/wh/data_site.png";
                          return (
                            <div key={typeIndex}>
                              {/* Заголовок типа аномалии */}
                              <div className="flex items-center gap-2 mb-2">
                                <Image
                                  src={typeIcon}
                                  alt={typeLabel}
                                  width={24}
                                  height={24}
                                  className="rounded"
                                />
                                <strong className="text-sm uppercase text-slate-400">{typeLabel}</strong>
                              </div>
                              {/* Аккордеон с отступом */}
                              <div className="pl-8">
                                <Accordion type="single" collapsible className="w-full border-b-0 pb-0 py-0">
                                  {(entries || []).map((anomaly: Anomaly, anomalyIndex: number) => {
                                    const triggers = getTriggersForAnomaly(anomaly.name);
                                    return (
                                      <AccordionItem
                                        key={anomalyIndex}
                                        value={`anomaly-${anomalyIndex}`}
                                        className="border-b-0 pb-0 py-0"
                                      >
                                        <AccordionTrigger className="flex py-1 justify-between items-center text-green-400 font-medium text-sm hover:no-underline">
                                          <span>{anomaly.name}</span> {/* Остается слева */}
                                          <div className="flex ml-auto"> {/* Прижимаем этот блок к правому краю */}
                                            <span className="text-cyan-500 font-bold pr-2">
                                              {anomaly.price}
                                            </span>
                                            <span className="text-red-500 font-bold pr-0">
                                              {anomaly.value}
                                            </span>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-6 space-y-1">
                                          <span className="text-yellow-300 text-sm">NPC триггеры следующей волны:</span>
                                          {triggers &&
                                            Object.entries(triggers.Triggers).map(([wave, trigger]) => (
                                              <div key={wave} className="flex items-center gap-2">
                                                <span className="text-slate-400 text-xs">
                                                  {wave.toUpperCase()}
                                                </span>
                                                <Image
                                                  src={getShipIcon(trigger.Type)}
                                                  alt={trigger.Type}
                                                  width={20}
                                                  height={20}
                                                  className="rounded"
                                                />
                                                <span className="text-slate-300 text-sm">
                                                  {trigger.Name.trim()} ({trigger.Type.trim()})
                                                </span>
                                                <span className="text-slate-400 text-xs">
                                                  ({trigger.Distance.trim()})
                                                </span>
                                              </div>
                                            ))}
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  })}
                                </Accordion>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-slate-500">Нет данных об аномалиях</p>
                      )}
                    </div>
                  </div>

                <div className="flex gap-2 mt-4">
                  {/* Кнопка "Отследить систему" */}
                  <button
                    onClick={() => addTrackedSystem(system)}
                    className={`w-full inline-flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium tracking-tight rounded-[10px] border transition-all duration-300 shadow-md hover:shadow-lg ${
                      trackedSystems.some(s => s.system === system.system)
                        ? "text-emerald-400 bg-gradient-to-r from-[#162316] to-[#061F06] border-emerald-500/40 hover:from-[#0F1F0F] hover:to-[#162316]"
                        : "text-white bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]"
                    }`}
                  >
                    {trackedSystems.some(s => s.system === system.system) ? (
                      <>
                        <EyeOff size={16} className="text-emerald-400" />
                        Система отслеживается
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="text-blue-400" />
                        Отследить систему
                      </>
                    )}
                  </button>

                  {/* Кнопка "Показать/Скрыть убийства" */}
                  <button
                    onClick={() => toggleKillsAccordion(system.solarsystemid)}
                    className={`w-full inline-flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium tracking-tight rounded-[10px] border transition-all duration-300 shadow-md hover:shadow-lg ${
                      selectedSystemID === system.solarsystemid
                        ? "text-white bg-gradient-to-r from-[#1F0606] to-[#311616] border-red-500/60 hover:from-[#311616] hover:to-[#1F0606]"
                        : "text-slate-300 bg-gradient-to-r from-[#161A31] to-[#06091F] border-[rgba(105,113,162,0.4)] hover:from-[#06091F] hover:to-[#161A31]"
                    }`}
                  >
                    <Swords 
                      size={16} 
                      className={
                        selectedSystemID === system.solarsystemid 
                          ? "text-red-400" 
                          : "text-slate-400"
                      } 
                    />
                    {selectedSystemID === system.solarsystemid 
                      ? "Скрыть килы" 
                      : "Показать килы"}
                  </button>
                </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-slate-300">Введите название системы: J162226</p>
          )}
        </div>

        {/* Правая колонка: TrackedSystems */}
        <div className="hidden md:block">
          <TrackedSystems
            trackedSystems={trackedSystems}
            setTrackedSystems={setTrackedSystems}
            onSystemClick={handleSystemClick}
          />
        </div>
      </div>
      {/* Отображаем компонент KilledShips, если выбрана система */}
      {selectedSystemID  && (
        // <Accordion type="multiple" defaultValue={[]} className="w-full border-b-0 mt-4">
        //   <AccordionItem value="item-1" className="border-b-0">
        //     <AccordionTrigger className="flex py-0 px-2 justify-center items-center text-red-400 font-semibold text-lg hover:no-underline gap-6">
        //       <span className="text-center">Посмотреть данные по уничтоженным кораблям в системе {selectedSystemID}</span>
        //     </AccordionTrigger>
        //     <AccordionContent className="pt-0 px-4">
              <KilledShips solarSystemID={selectedSystemID} />
        //     </AccordionContent>
        //   </AccordionItem>
        // </Accordion>
      )}
      
    </div>
  );
}

