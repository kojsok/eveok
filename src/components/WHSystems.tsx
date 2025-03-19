"use client";
import { useState } from "react";
import Image from "next/image";
import { wormholeData } from "../data/wormholeData";
import whAnomalies from "../data/wh_anomaly.json"; // Импорт данных аномалий

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
}

interface AnomalyGroup {
  war?: Anomaly[]; // Необязательные поля
  relic?: Anomaly[];
  data?: Anomaly[];
}

type WhAnomalies = {
  [key in "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "thera"]?: AnomalyGroup;
};

// Приводим тип к WhAnomalies
const anomaliesData: WhAnomalies = whAnomalies;

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

// Функция для определения цветовой гаммы классов WH
const getClassColor = (className: string): string => {
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
      return "text-slate-300";
  }
};

export default function WHSystems() {
  const [query, setQuery] = useState("");
  const [systems, setSystems] = useState<WormholeSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    // Очистка строки от пробелов и проверка на пустую строку
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Система не найдена. Введите название системы без пробелов и дополнительных символов *.");
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

  // Функция для получения аномалий по классу WH
  const getAnomaliesForClass = (whClass: string): AnomalyGroup | undefined => {
    const key = `C${Math.abs(Number(whClass))}`.trim().toUpperCase() as keyof WhAnomalies;
    return anomaliesData[key];
  };

  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      <h1 className="text-2xl font-bold mb-4 text-center">WH Systems Search</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter system name...: J105443"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-center text-red-500">{error}</p>}

      {systems.length > 0 ? (
        <div className="space-y-4">
          {systems.map((system) => {
            const staticsArray = system.statics.split(",").map((staticValue) => staticValue.trim());
            const staticsInfo = staticsArray.map(findStatic);
            const classColor = getClassColor(`c${Math.abs(system.class)}`);
            const classLabel = system.class > 0 ? `C-${system.class}` : `C-${Math.abs(system.class)} (разлом)`;
            const anomalies = getAnomaliesForClass(`${Math.abs(system.class)}`);

            return (
              <div
                key={system.solarsystemid}
                className="p-4 bg-gradient-to-r from-[#06091F] to-[#161A31] border border-[rgba(105,113,162,0.16)] rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Левая колонка: информация о системе */}
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-semibold">{system.system}</h2>
                    <p className="text-slate-300">
                      <strong>Класс ВХ:</strong>{" "}
                      <span className={`${classColor} font-bold`}>{classLabel}</span>
                    </p>
                    <p className="text-slate-300">
                      <strong>Обладает статиками в:</strong>{" "}
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
                    <p className="text-slate-300">
                      <strong>Эффект:</strong> {system.effect || "нет эффекта"}
                    </p>
                    <p className="text-slate-300">
                      <strong>Планеты:</strong> {system.planets}
                    </p>
                    <p className="text-slate-300">
                      <strong>Луны:</strong> {system.moons}
                    </p>
                    <p className="text-slate-300">
                      <strong>Звезда:</strong> {system.star}
                    </p>
                    <p className="text-slate-300">
                      <strong>Уровень безопасности:</strong> -1.0
                    </p>
                    <p className="text-slate-300">
                      <strong>Радиус:</strong> 24.5 AE (расстояние системы от центра до последней планеты)
                    </p>
                    <p className="text-slate-300">
                      <strong>ID вх:</strong> {system.solarsystemid}
                    </p>
                  </div>

                  {/* Правая колонка: аномалии */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-400">Аномалии</h3>
                    {anomalies ? (
                      <div className="space-y-4">
                        {Object.entries(anomalies).map(([type, entries]) => {
                          // Замена названий типов на более понятные
                          const typeLabel = type === "war" ? "COMBAT SITE" : type === "relic" ? "RELIC SITE" : "DATA SITE";
                          const typeIcon = type === "war" ? "/wh/combat_site.png" : type === "relic" ? "/wh/relic_site.png" : "/wh/data_site.png";

                          return (
                            <div key={type}>
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
                              <div className="pl-6 space-y-1">
                                {(entries || []).map((anomaly: Anomaly, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-green-400 font-medium">{anomaly.name}</span>
                                    <span className="text-red-500 font-bold">{anomaly.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500">Нет данных об аномалиях</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-300">Введите название системы: J100744</p>
      )}
    </div>
  );
}





// "use client";
// import { useState } from "react";
// import Image from "next/image";
// import { wormholeData } from "../data/wormholeData";
// import whAnomalies from "../data/wh_anomaly.json"; // Импорт данных аномалий

// // Типы данных
// interface WormholeSystem {
//   solarsystemid: number;
//   system: string;
//   class: number;
//   star: string;
//   planets: number;
//   moons: number;
//   effect: string | null;
//   statics: string;
// }

// interface Anomaly {
//   name: string;
//   value: string;
// }

// interface AnomalyGroup {
//   war?: Anomaly[]; // Необязательные поля
//   relic?: Anomaly[];
//   data?: Anomaly[];
// }

// type WhAnomalies = {
//   [key in "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "thera"]?: AnomalyGroup;
// };

// // Приводим тип к WhAnomalies
// const anomaliesData: WhAnomalies = whAnomalies;

// // Функция для получения цвета категории
// const getColorForCategory = (category: string): string => {
//   switch (category) {
//     case "hs":
//       return "text-green-500";
//     case "ls":
//       return "text-orange-500";
//     case "ns":
//       return "text-red-500";
//     case "c1":
//       return "text-sky-500";
//     case "c2":
//       return "text-blue-500";
//     case "c3":
//       return "text-teal-500";
//     case "c4":
//       return "text-orange-500";
//     case "c5":
//       return "text-red-500";
//     case "c6":
//       return "text-purple-500";
//     case "thera":
//       return "text-yellow-500";
//     case "?":
//       return "text-gray-500";
//     default:
//       return "text-slate-300";
//   }
// };

// // Функция для поиска статика в wormholeData
// const findStatic = (staticValue: string): { category: string; color: string } => {
//   for (const entry of wormholeData) {
//     const foundCategory = Object.keys(entry).find(
//       (key) => key !== "category" && entry[key as keyof typeof entry] === staticValue
//     );
//     if (foundCategory) {
//       return {
//         category: foundCategory,
//         color: getColorForCategory(foundCategory),
//       };
//     }
//   }
//   return { category: "Null-sec", color: "text-slate-300" };
// };

// // Функция для определения цветовой гаммы классов WH
// const getClassColor = (className: string): string => {
//   switch (className) {
//     case "c1":
//       return "text-sky-500";
//     case "c2":
//       return "text-blue-500";
//     case "c3":
//       return "text-teal-500";
//     case "c4":
//       return "text-orange-500";
//     case "c5":
//       return "text-red-500";
//     case "c6":
//       return "text-purple-500";
//     default:
//       return "text-slate-300";
//   }
// };

// export default function WHSystems() {
//   const [query, setQuery] = useState("");
//   const [systems, setSystems] = useState<WormholeSystem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/wh-systems?query=${encodeURIComponent(query)}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch data");
//       }
//       const data: WormholeSystem[] = await response.json();
//       setSystems(data);
//     } catch (error) {
//       console.error("Error fetching systems:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Функция для получения аномалий по классу WH
//   const getAnomaliesForClass = (whClass: string): AnomalyGroup | undefined => {
//     const key = `C${Math.abs(Number(whClass))}`.trim().toUpperCase() as keyof WhAnomalies;
//     return anomaliesData[key];
//   };

//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-2xl font-bold mb-4 text-center">WH Systems Search</h1>
//       <div className="flex flex-col sm:flex-row gap-2 mb-4">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Enter system name..."
//           className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         />
//         <button
//           onClick={handleSearch}
//           disabled={loading}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           {loading ? "Searching..." : "Search"}
//         </button>
//       </div>

//       {systems.length > 0 ? (
//         <div className="space-y-4">
//           {systems.map((system) => {
//             const staticsArray = system.statics.split(",").map((staticValue) => staticValue.trim());
//             const staticsInfo = staticsArray.map(findStatic);
//             const classColor = getClassColor(`c${Math.abs(system.class)}`);
//             const classLabel = system.class > 0 ? `C-${system.class}` : `C-${Math.abs(system.class)} (разлом)`;
//             const anomalies = getAnomaliesForClass(`${Math.abs(system.class)}`);

//             return (
//               <div
//                 key={system.solarsystemid}
//                 className="p-4 bg-gradient-to-r from-[#06091F] to-[#161A31] border border-[rgba(105,113,162,0.16)] rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.01]"
//               >
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   {/* Левая колонка: информация о системе */}
//                   <div className="flex-1 space-y-2">
//                     <h2 className="text-xl font-semibold">{system.system}</h2>
//                     <p className="text-slate-300">
//                       <strong>Класс ВХ:</strong>{" "}
//                       <span className={`${classColor} font-bold`}>{classLabel}</span>
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Обладает статиками в:</strong>{" "}
//                       {staticsInfo.map((info, index) => (
//                         <span
//                           key={index}
//                           className={`mr-2 ${info.color}`}
//                           style={{ color: info.color.replace("text-", "#") }}
//                         >
//                           {`${staticsArray[index]} (${info.category})`}
//                         </span>
//                       ))}
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Эффект:</strong> {system.effect || "нет эффекта"}
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Планеты:</strong> {system.planets}
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Луны:</strong> {system.moons}
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Звезда:</strong> {system.star}
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Уровень безопасности:</strong> -1.0
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>Радиус ВХ:</strong> 24.5 AE (орбита от центра системы до последней планеты)
//                     </p>
//                     <p className="text-slate-300">
//                       <strong>ID системы:</strong> {system.solarsystemid}
//                     </p>  

//                   </div>

//                   {/* Правая колонка: аномалии */}
//                   <div className="flex-1 space-y-2">
//                     <h3 className="text-lg font-semibold text-slate-400">Аномалии</h3>
//                     {anomalies ? (
//                       <div className="space-y-4">
//                         {Object.entries(anomalies).map(([type, entries]) => {
//                           // Замена названий типов на более понятные
//                           const typeLabel = type === "war" ? "COMBAT SITE" : type === "relic" ? "RELIC SITE" : "DATA SITE";
//                           const typeIcon = type === "war" ? "/wh/combat_site.png" : type === "relic" ? "/wh/relic_site.png" : "/wh/data_site.png";

//                           return (
//                             <div key={type}>
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Image
//                                   src={typeIcon}
//                                   alt={typeLabel}
//                                   width={24}
//                                   height={24}
//                                   className="rounded"
//                                 />
//                                 <strong className="text-sm uppercase text-slate-400">{typeLabel}</strong>
//                               </div>
//                               <div className="pl-8 space-y-1">
//                                 {(entries || []).map((anomaly: Anomaly, idx: number) => (
//                                   <div key={idx} className="flex items-center gap-2">
//                                     <span className="text-green-400 font-medium">{anomaly.name}</span>
//                                     <span className="text-red-500 font-bold">{anomaly.value}</span>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     ) : (
//                       <p className="text-slate-500">Нет данных об аномалиях</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <p className="text-center text-slate-300">No systems found.</p>
//       )}
//     </div>
//   );
// }

