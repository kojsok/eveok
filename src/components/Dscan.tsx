"use client";
import { shipList } from "@/lib/ArrayShipsOnly";
import shipsAndGroupsData from "@/data/ShipsAndGroups.json"; // Импортируем файл ShipsAndGroups.json
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Copy, Trash2, RefreshCw } from "lucide-react";

interface ShipResult {
  name: string;
  count: number;
}

interface GroupResult {
  groupName: string;
  count: number;
}

const Dscan = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<ShipResult[]>([]);
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);

  // Функция для поиска названия корабля с точным совпадением
  const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
    const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
    if (threeWordMatch) {
      const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
      if (shipList.includes(shipNameCandidate)) {
        return shipNameCandidate;
      }
    }
    const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
    if (twoWordMatch) {
      const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
      if (shipList.includes(shipNameCandidate)) {
        return shipNameCandidate;
      }
    }
    const oneWordMatch = line.match(/([^\s*]+)\*/);
    if (oneWordMatch) {
      const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
      if (shipList.includes(shipNameCandidate)) {
        return shipNameCandidate;
      }
    }
    return null;
  };

  // Функция для получения groupName по имени корабля из ShipsAndGroups.json
  const getGroupNameByShipName = (shipName: string): string | undefined => {
    const shipData = shipsAndGroupsData.find((item) => item.shipName === shipName);
    return shipData?.groupName;
  };

  // Основная функция анализа D-Scan
  const handleParseDscan = async () => {
    try {
      setError(null);
      const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) {
        throw new Error("Введите данные D-Scan.");
      }

      const shipCounts: { [key: string]: number } = {};
      const groupCounts: { [key: string]: number } = {};

      for (const line of lines) {
        const shipName = parseShipNameWithExactMatch(line, shipList);
        if (shipName) {
          shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;

          // Получаем groupName для корабля
          const groupName = getGroupNameByShipName(shipName);
          if (groupName) {
            groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
          }
        }
      }

      // Формируем результаты кораблей
      const resultArray = Object.entries(shipCounts)
        .map(([name, count]): ShipResult => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Сортировка по убыванию

      // Формируем результаты групп
      const groupArray = Object.entries(groupCounts)
        .map(([groupName, count]): GroupResult => ({ groupName, count }))
        .sort((a, b) => b.count - a.count); // Сортировка по убыванию

      setResults(resultArray);
      setGroups(groupArray);

      if (resultArray.length === 0) {
        throw new Error("Корабли не найдены.");
      }

      const fullid = uuidv4();
      const id = fullid.slice(0, 8);
      setResultId(id);

      const response = await fetch("/api/dscan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data: resultArray }),
      });

      if (!response.ok) {
        throw new Error("Не удалось сохранить данные.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла неизвестная ошибка.");
      }
    }
  };

  const redirectToResult = () => {
    if (resultId) {
      window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
    }
  };

  return (
    <div className="p-4 bg-slate-900 text-slate-300 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Введите результат D-Scan"
        rows={10}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
      />
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        <button
          onClick={handleParseDscan}
          className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          Проанализировать
        </button>
        <button
          onClick={() => {
            setInputValue("");
            setResults([]);
            setGroups([]);
            setResultId(null);
          }}
          className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
          <Trash2 className="h-4 w-4" />
          Очистить
        </button>
        {resultId && (
          <button
            onClick={redirectToResult}
            className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
          >
            <Copy className="h-4 w-4" />
            Поделиться
          </button>
        )}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {/* Общее количество кораблей */}
      {results.length > 0 && (
        <p className="mt-4 text-2xl font-semibold text-center">
          Всего кораблей:{" "}
          <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
        </p>
      )}
      {/* Две колонки: Корабли и Группы */}
      {(results.length > 0 || groups.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Колонка Корабли */}
          <div className="flex flex-col items-center max-w-[300px] mx-auto">
          <h2 className="text-xl font-bold mb-2 text-center items-center">Корабли:</h2>
          <div className="flex flex-col items-end">
           
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-slate-800  w-96 px-4 py-1 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
                >
                  <h3 className="text-base font-semibold text-slate-300">{result.name}</h3>
                  <span className="text-base font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
                    {result.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
          
          {/* Колонка Группы */}
          <div className="flex flex-col items-center max-w-[300px] mx-auto">
          <h2 className="text-xl font-bold mb-2 text-center">Группы:</h2>
          <div className="flex flex-col items-start">
            
            <div className="space-y-2">
              {groups.map((group, index) => (
                <div
                  key={index}
                  className="bg-slate-800 w-96 px-4 py-1 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
                >
                  <h3 className="text-base font-semibold text-slate-300">{group.groupName}</h3>
                  <span className="text-base font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
                    {group.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Dscan;


//!теперь как надо но группы на русском языке
// "use client";
// import { shipList } from "@/lib/ArrayShipsOnly";
// import shipsAndGroupsData from "@/data/ShipsAndGroups.json"; // Импортируем файл ShipsAndGroups.json
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Copy, Trash2, RefreshCw } from "lucide-react";

// interface ShipResult {
//   name: string;
//   count: number;
// }

// interface GroupResult {
//   groupName: string;
//   count: number;
// }

// const Dscan = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [results, setResults] = useState<ShipResult[]>([]);
//   const [groups, setGroups] = useState<GroupResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [resultId, setResultId] = useState<string | null>(null);

//   // Функция для поиска названия корабля с точным совпадением
//   const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//       const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//       const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//       const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     return null;
//   };

//   // Функция для получения groupName по имени корабля из ShipsAndGroups.json
//   const getGroupNameByShipName = (shipName: string): string | undefined => {
//     const shipData = shipsAndGroupsData.find((item) => item.shipName === shipName);
//     return shipData?.groupName;
//   };

//   // Основная функция анализа D-Scan
//   const handleParseDscan = async () => {
//     try {
//       setError(null);
//       const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//       if (!lines.length) {
//         throw new Error("Введите данные D-Scan.");
//       }

//       const shipCounts: { [key: string]: number } = {};
//       const groupCounts: { [key: string]: number } = {};

//       for (const line of lines) {
//         const shipName = parseShipNameWithExactMatch(line, shipList);
//         if (shipName) {
//           shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;

//           // Получаем groupName для корабля
//           const groupName = getGroupNameByShipName(shipName);
//           if (groupName) {
//             groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
//           }
//         }
//       }

//       // Формируем результаты кораблей
//       const resultArray = Object.entries(shipCounts)
//         .map(([name, count]): ShipResult => ({ name, count }))
//         .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//       // Формируем результаты групп
//       const groupArray = Object.entries(groupCounts)
//         .map(([groupName, count]): GroupResult => ({ groupName, count }))
//         .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//       setResults(resultArray);
//       setGroups(groupArray);

//       if (resultArray.length === 0) {
//         throw new Error("Корабли не найдены.");
//       }

//       const id = uuidv4();
//       setResultId(id);

//       const response = await fetch("/api/dscan/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, data: resultArray }),
//       });

//       if (!response.ok) {
//         throw new Error("Не удалось сохранить данные.");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     }
//   };

//   const redirectToResult = () => {
//     if (resultId) {
//       window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
//     }
//   };

//   return (
//     <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//       <textarea
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         placeholder="Введите результат D-Scan"
//         rows={10}
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//       />
//       <div className="flex flex-wrap gap-4 mt-2 justify-center">
//         <button
//           onClick={handleParseDscan}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Проанализировать
//         </button>
//         <button
//           onClick={() => {
//             setInputValue("");
//             setResults([]);
//             setGroups([]);
//             setResultId(null);
//           }}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <Trash2 className="h-4 w-4" />
//           Очистить
//         </button>
//         {resultId && (
//           <button
//             onClick={redirectToResult}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//           >
//             <Copy className="h-4 w-4" />
//             Поделиться
//           </button>
//         )}
//       </div>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {/* Общее количество кораблей */}
//       {results.length > 0 && (
//         <p className="mt-4 text-2xl font-semibold text-center">
//           Всего кораблей:{" "}
//           <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//         </p>
//       )}
//       {/* Результаты анализа */}
//       {results.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {results.map((result, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {result.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Результаты групп */}
//       {groups.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <h2 className="text-xl font-bold mb-2">Группы:</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {groups.map((group, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{group.groupName}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {group.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Динамическая ссылка */}
//       {resultId && (
//         <div className="mt-6 flex flex-col items-center">
//           <p className="text-sm text-slate-400">Ссылка на результат:</p>
//           <a
//             href={`${window.location.origin}/dscan/result/${resultId}`}
//             className="text-blue-500 underline break-all mt-1"
//           >
//             {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//           </a>
//         </div>
//       )}
//       {/* Инструкция */}
//       <div className="text-slate-300 mt-8">
//         <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//         <p className="text-slate-300">В игре откройте окно D-Scan (Alt+D)</p>
//         <p className="text-slate-300">
//           Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//         </p>
//         <p className="text-slate-300">
//           Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//         </p>
//         <p className="text-slate-300">
//           Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//         </p>
//         <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//       </div>
//     </div>
//   );
// };

// export default Dscan;


//!работает но выводит с кэшем корабли и группы но также делает запросы к серверу по группам
// "use client";
// import { shipList } from "@/lib/ArrayShipsOnly";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Copy, Trash2, RefreshCw } from "lucide-react";

// interface ShipResult {
//   name: string;
//   count: number;
// }

// interface GroupResult {
//   groupName: string;
//   count: number;
// }

// const Dscan = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [results, setResults] = useState<ShipResult[]>([]);
//   const [groups, setGroups] = useState<GroupResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [resultId, setResultId] = useState<string | null>(null);

//   // Кэши для хранения groupID и названий групп
//   const [groupIDCache, setGroupIDCache] = useState<{ [key: string]: number }>({});
//   const [groupNameCache, setGroupNameCache] = useState<{ [key: number]: string }>({});

//   // Функция для поиска названия корабля с точным совпадением
//   const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//       const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//       const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//       const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     return null;
//   };

//   // Функция для получения groupID по имени корабля с кэшированием
//   const getGroupID = async (shipName: string): Promise<number | undefined> => {
//     if (groupIDCache[shipName]) {
//       return groupIDCache[shipName];
//     }

//     try {
//       const response = await fetch(`/api/market-items?search=${encodeURIComponent(shipName)}&limit=1`);
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные market-items.");
//       }
//       const data = await response.json();
//       if (data.length > 0) {
//         const groupID = data[0].groupID;
//         setGroupIDCache((prev) => ({ ...prev, [shipName]: groupID }));
//         return groupID;
//       }
//     } catch (err) {
//       console.error("Ошибка при получении groupID:", err);
//     }
//     return undefined;
//   };

//   // Функция для получения названия группы по groupID с кэшированием
//   const getGroupName = async (groupID: number): Promise<string | undefined> => {
//     if (groupNameCache[groupID]) {
//       return groupNameCache[groupID];
//     }

//     try {
//       const response = await fetch("/api/groups");
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные filtered_groups.");
//       }
//       const data = await response.json();
//       const group = data.find((item: any) => item.id === groupID);
//       const groupName = group?.name.ru || group?.name.en || undefined;
//       if (groupName) {
//         setGroupNameCache((prev) => ({ ...prev, [groupID]: groupName }));
//       }
//       return groupName;
//     } catch (err) {
//       console.error("Ошибка при получении названия группы:", err);
//     }
//     return undefined;
//   };

//   // Основная функция анализа D-Scan
//   const handleParseDscan = async () => {
//     try {
//       setError(null);
//       const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//       if (!lines.length) {
//         throw new Error("Введите данные D-Scan.");
//       }

//       const shipCounts: { [key: string]: number } = {};
//       const groupCounts: { [key: number]: number } = {};

//       for (const line of lines) {
//         const shipName = parseShipNameWithExactMatch(line, shipList);
//         if (shipName) {
//           shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;

//           // Получаем groupID для корабля
//           const groupID = await getGroupID(shipName);
//           if (groupID !== undefined) {
//             groupCounts[groupID] = (groupCounts[groupID] || 0) + 1;
//           }
//         }
//       }

//       // Формируем результаты кораблей
//       const resultArray = Object.entries(shipCounts)
//         .map(([name, count]): ShipResult => ({ name, count }))
//         .sort((a, b) => b.count - a.count);

//       // Формируем результаты групп
//       const groupArray: GroupResult[] = [];
//       for (const [groupID, count] of Object.entries(groupCounts)) {
//         const groupName = await getGroupName(parseInt(groupID));
//         if (groupName) {
//           groupArray.push({ groupName, count });
//         }
//       }
//       groupArray.sort((a, b) => b.count - a.count);

//       setResults(resultArray);
//       setGroups(groupArray);

//       if (resultArray.length === 0) {
//         throw new Error("Корабли не найдены.");
//       }

//       const id = uuidv4();
//       setResultId(id);

//       const response = await fetch("/api/dscan/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, data: resultArray }),
//       });

//       if (!response.ok) {
//         throw new Error("Не удалось сохранить данные.");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     }
//   };

//   const redirectToResult = () => {
//     if (resultId) {
//       window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
//     }
//   };

//   return (
//     <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//       <textarea
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         placeholder="Введите результат D-Scan"
//         rows={10}
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//       />
//       <div className="flex flex-wrap gap-4 mt-2 justify-center">
//         <button
//           onClick={handleParseDscan}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Проанализировать
//         </button>
//         <button
//           onClick={() => {
//             setInputValue("");
//             setResults([]);
//             setGroups([]);
//             setResultId(null);
//           }}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <Trash2 className="h-4 w-4" />
//           Очистить
//         </button>
//         {resultId && (
//           <button
//             onClick={redirectToResult}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//           >
//             <Copy className="h-4 w-4" />
//             Поделиться
//           </button>
//         )}
//       </div>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {/* Общее количество кораблей */}
//       {results.length > 0 && (
//         <p className="mt-4 text-2xl font-semibold text-center">
//           Всего кораблей:{" "}
//           <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//         </p>
//       )}
//       {/* Результаты анализа */}
//       {results.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {results.map((result, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {result.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Результаты групп */}
//       {groups.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <h2 className="text-xl font-bold mb-2">Группы:</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {groups.map((group, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{group.groupName}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {group.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Динамическая ссылка */}
//       {resultId && (
//         <div className="mt-6 flex flex-col items-center">
//           <p className="text-sm text-slate-400">Ссылка на результат:</p>
//           <a
//             href={`${window.location.origin}/dscan/result/${resultId}`}
//             className="text-blue-500 underline break-all mt-1"
//           >
//             {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//           </a>
//         </div>
//       )}
//       {/* Инструкция */}
//       <div className="text-slate-300 mt-8">
//         <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//         <p className="text-slate-300">В игре откройте окно D-Scan (Alt+D)</p>
//         <p className="text-slate-300">
//           Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//         </p>
//         <p className="text-slate-300">
//           Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//         </p>
//         <p className="text-slate-300">
//           Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//         </p>
//         <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//       </div>
//     </div>
//   );
// };

// export default Dscan;



//!работает но долго ищет и делает на каждый корабль запрос для каждого корабля
// "use client";
// import { shipList } from "@/lib/ArrayShipsOnly";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Copy, Trash2, RefreshCw } from "lucide-react";

// interface ShipResult {
//   name: string;
//   count: number;
//   groupID?: number; // Добавляем поле для groupID
// }

// interface GroupResult {
//   groupName: string;
//   count: number;
// }

// const Dscan = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [results, setResults] = useState<ShipResult[]>([]);
//   const [groups, setGroups] = useState<GroupResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [resultId, setResultId] = useState<string | null>(null);

//   // Функция для поиска названия корабля с точным совпадением
//   const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//       const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//       const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//       const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     return null;
//   };

//   // Функция для получения groupID по имени корабля
//   const fetchGroupID = async (shipName: string): Promise<number | undefined> => {
//     try {
//       const response = await fetch(`/api/market-items?search=${encodeURIComponent(shipName)}&limit=1`);
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные market-items.");
//       }
//       const data = await response.json();
//       if (data.length > 0) {
//         return data[0].groupID;
//       }
//     } catch (err) {
//       console.error("Ошибка при получении groupID:", err);
//     }
//     return undefined;
//   };

//   // Функция для получения названия группы по groupID
//   const fetchGroupName = async (groupID: number): Promise<string | undefined> => {
//     try {
//       const response = await fetch("/api/groups"); // Предполагаем, что есть API для filtered_groups.json
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные filtered_groups.");
//       }
//       const data = await response.json();
//       const group = data.find((item: any) => item.id === groupID);
//       return group?.name.ru || group?.name.en || undefined;
//     } catch (err) {
//       console.error("Ошибка при получении названия группы:", err);
//     }
//     return undefined;
//   };

//   // Основная функция анализа D-Scan
//   const handleParseDscan = async () => {
//     try {
//       setError(null);
//       const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//       if (!lines.length) {
//         throw new Error("Введите данные D-Scan.");
//       }
  
//       const shipCounts: { [key: string]: number } = {};
//       const groupCounts: { [key: number]: number } = {}; // Используем groupID как ключ
  
//       for (const line of lines) {
//         const shipName = parseShipNameWithExactMatch(line, shipList);
//         if (shipName) {
//           shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
  
//           // Получаем groupID для корабля
//           const groupID = await fetchGroupID(shipName);
//           if (groupID !== undefined) {
//             groupCounts[groupID] = (groupCounts[groupID] || 0) + 1;
//           }
//         }
//       }
  
//       // Формируем результаты кораблей
//       const resultArray = Object.entries(shipCounts)
//         .map(([name, count]): ShipResult => ({ name, count }))
//         .sort((a, b) => b.count - a.count);
  
//       // Формируем результаты групп
//       const groupArray: GroupResult[] = [];
//       for (const [groupID, count] of Object.entries(groupCounts)) {
//         const groupName = await fetchGroupName(parseInt(groupID));
//         if (groupName) {
//           groupArray.push({ groupName, count });
//         }
//       }
//       groupArray.sort((a, b) => b.count - a.count); // Сортировка по убыванию
  
//       setResults(resultArray);
//       setGroups(groupArray);
  
//       if (resultArray.length === 0) {
//         throw new Error("Корабли не найдены.");
//       }
  
//       const id = uuidv4();
//       setResultId(id);
  
//       const response = await fetch("/api/dscan/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, data: resultArray }),
//       });
  
//       if (!response.ok) {
//         throw new Error("Не удалось сохранить данные.");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     }
//   };

//   const redirectToResult = () => {
//     if (resultId) {
//       window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
//     }
//   };

//   return (
//     <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//       <textarea
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         placeholder="Введите результат D-Scan"
//         rows={10}
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//       />
//       <div className="flex flex-wrap gap-4 mt-2 justify-center">
//         <button
//           onClick={handleParseDscan}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Проанализировать
//         </button>
//         <button
//           onClick={() => {
//             setInputValue("");
//             setResults([]);
//             setGroups([]);
//             setResultId(null);
//           }}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <Trash2 className="h-4 w-4" />
//           Очистить
//         </button>
//         {resultId && (
//           <button
//             onClick={redirectToResult}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//           >
//             <Copy className="h-4 w-4" />
//             Поделиться
//           </button>
//         )}
//       </div>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {/* Общее количество кораблей */}
//       {results.length > 0 && (
//         <p className="mt-4 text-2xl font-semibold text-center">
//           Всего кораблей:{" "}
//           <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//         </p>
//       )}
//       {/* Результаты анализа */}
//       {results.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {results.map((result, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {result.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Результаты групп */}
//       {groups.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <h2 className="text-xl font-bold mb-2">Группы:</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {groups.map((group, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{group.groupName}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {group.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Динамическая ссылка */}
//       {resultId && (
//         <div className="mt-6 flex flex-col items-center">
//           <p className="text-sm text-slate-400">Ссылка на результат:</p>
//           <a
//             href={`${window.location.origin}/dscan/result/${resultId}`}
//             className="text-blue-500 underline break-all mt-1"
//           >
//             {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//           </a>
//         </div>
//       )}
//       {/* Инструкция */}
//       <div className="text-slate-300 mt-8">
//         <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//         <p className="text-slate-300">В игре откройте окно D-Scan (Alt+D)</p>
//         <p className="text-slate-300">
//           Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//         </p>
//         <p className="text-slate-300">
//           Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//         </p>
//         <p className="text-slate-300">
//           Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//         </p>
//         <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//       </div>
//     </div>
//   );
// };

// export default Dscan;




// "use client";
// import { shipList } from "@/lib/ArrayShipsOnly";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Copy, Trash2, RefreshCw } from "lucide-react";

// interface ShipResult {
//   name: string;
//   count: number;
//   groupID?: number; // Добавляем поле для groupID
// }

// interface GroupResult {
//   groupName: string;
//   count: number;
// }

// const Dscan = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [results, setResults] = useState<ShipResult[]>([]);
//   const [groups, setGroups] = useState<GroupResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [resultId, setResultId] = useState<string | null>(null);

//   // Функция для поиска названия корабля с точным совпадением
//   const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//       const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//       const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//       const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//       if (shipList.includes(shipNameCandidate)) {
//         return shipNameCandidate;
//       }
//     }
//     return null;
//   };

//   // Функция для получения groupID по имени корабля
//   const fetchGroupID = async (shipName: string): Promise<number | undefined> => {
//     try {
//       const response = await fetch(`/api/market-items?search=${encodeURIComponent(shipName)}&limit=1`);
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные market-items.");
//       }
//       const data = await response.json();
//       if (data.length > 0) {
//         return data[0].groupID;
//       }
//     } catch (err) {
//       console.error("Ошибка при получении groupID:", err);
//     }
//     return undefined;
//   };

//   // Функция для получения названия группы по groupID
//   const fetchGroupName = async (groupID: number): Promise<string | undefined> => {
//     try {
//       const response = await fetch("/api/groups"); // Предполагаем, что есть API для filtered_groups.json
//       if (!response.ok) {
//         throw new Error("Не удалось получить данные filtered_groups.");
//       }
//       const data = await response.json();
//       const group = data.find((item: any) => item.id === groupID);
//       return group?.name.ru || group?.name.en || undefined;
//     } catch (err) {
//       console.error("Ошибка при получении названия группы:", err);
//     }
//     return undefined;
//   };

//   // Основная функция анализа D-Scan
//   const handleParseDscan = async () => {
//     try {
//       setError(null);
//       const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//       if (!lines.length) {
//         throw new Error("Введите данные D-Scan.");
//       }

//       const shipCounts: { [key: string]: number } = {};
//       const groupCounts: { [key: string]: number } = {};

//       for (const line of lines) {
//         const shipName = parseShipNameWithExactMatch(line, shipList);
//         if (shipName) {
//           shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;

//           // Получаем groupID для корабля
//           const groupID = await fetchGroupID(shipName);
//           if (groupID !== undefined) {
//             const groupName = await fetchGroupName(groupID);
//             if (groupName) {
//               groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
//             }
//           }
//         }
//       }

//       // Формируем результаты кораблей
//       const resultArray = Object.entries(shipCounts)
//         .map(([name, count]): ShipResult => ({ name, count }))
//         .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//       // Формируем результаты групп
//       const groupArray = Object.entries(groupCounts)
//         .map(([groupName, count]): GroupResult => ({ groupName, count }))
//         .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//       setResults(resultArray);
//       setGroups(groupArray);

//       if (resultArray.length === 0) {
//         throw new Error("Корабли не найдены.");
//       }

//       const id = uuidv4();
//       setResultId(id);

//       const response = await fetch("/api/dscan/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, data: resultArray }),
//       });

//       if (!response.ok) {
//         throw new Error("Не удалось сохранить данные.");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     }
//   };

//   const redirectToResult = () => {
//     if (resultId) {
//       window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
//     }
//   };

//   return (
//     <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//       <textarea
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         placeholder="Введите результат D-Scan"
//         rows={10}
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//       />
//       <div className="flex flex-wrap gap-4 mt-2 justify-center">
//         <button
//           onClick={handleParseDscan}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Проанализировать
//         </button>
//         <button
//           onClick={() => {
//             setInputValue("");
//             setResults([]);
//             setGroups([]);
//             setResultId(null);
//           }}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <Trash2 className="h-4 w-4" />
//           Очистить
//         </button>
//         {resultId && (
//           <button
//             onClick={redirectToResult}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//           >
//             <Copy className="h-4 w-4" />
//             Поделиться
//           </button>
//         )}
//       </div>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//       {/* Общее количество кораблей */}
//       {results.length > 0 && (
//         <p className="mt-4 text-2xl font-semibold text-center">
//           Всего кораблей:{" "}
//           <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//         </p>
//       )}
//       {/* Результаты анализа */}
//       {results.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {results.map((result, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {result.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Результаты групп */}
//       {groups.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <h2 className="text-xl font-bold mb-2">Группы:</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {groups.map((group, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{group.groupName}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {group.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* Динамическая ссылка */}
//       {resultId && (
//         <div className="mt-6 flex flex-col items-center">
//           <p className="text-sm text-slate-400">Ссылка на результат:</p>
//           <a
//             href={`${window.location.origin}/dscan/result/${resultId}`}
//             className="text-blue-500 underline break-all mt-1"
//           >
//             {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//           </a>
//         </div>
//       )}
//       {/* Инструкция */}
//       <div className="text-slate-300 mt-8">
//         <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//         <p className="text-slate-300">В игре откройте окно D-Scan (Alt+D)</p>
//         <p className="text-slate-300">
//           Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//         </p>
//         <p className="text-slate-300">
//           Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//         </p>
//         <p className="text-slate-300">
//           Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//         </p>
//         <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//       </div>
//     </div>
//   );
// };

// export default Dscan;




//!работает вообще не трогать изначальный исходник который работал только с кораблями
// "use client";
// import { shipList } from "@/lib/ArrayShipsOnly";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { Copy, Trash2, RefreshCw } from "lucide-react"; // Импортируем иконки


// interface ShipResult {
//   name: string;
//   count: number;
// }

// // Функция для поиска названия корабля с точным совпадением
// const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//   const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//   if (threeWordMatch) {
//     const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//     if (shipList.includes(shipNameCandidate)) {
//       return shipNameCandidate;
//     }
//   }
//   const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//   if (twoWordMatch) {
//     const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//     if (shipList.includes(shipNameCandidate)) {
//       return shipNameCandidate;
//     }
//   }
//   const oneWordMatch = line.match(/([^\s*]+)\*/);
//   if (oneWordMatch) {
//     const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//     if (shipList.includes(shipNameCandidate)) {
//       return shipNameCandidate;
//     }
//   }
//   return null;
// };

// const Dscan = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [results, setResults] = useState<ShipResult[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [resultId, setResultId] = useState<string | null>(null);
//   // const [isClient, setIsClient] = useState(false);

//   const handleParseDscan = async () => {
//     try {
//       setError(null);
//       const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//       if (!lines.length) {
//         throw new Error("Введите данные D-Scan.");
//       }

//       const shipCounts: { [key: string]: number } = {};

//       for (const line of lines) {
//         const shipName = parseShipNameWithExactMatch(line, shipList);
//         if (shipName) {
//           shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
//         }
//       }

//       const resultArray = Object.entries(shipCounts)
//         .map(([name, count]): ShipResult => ({ name, count }))
//         .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//       setResults(resultArray);

//       if (resultArray.length === 0) {
//         throw new Error("Корабли не найдены.");
//       }

//       const id = uuidv4();
//       setResultId(id);

//       const response = await fetch("/api/dscan/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id, data: resultArray }),
//       });

//       if (!response.ok) {
//         throw new Error("Не удалось сохранить данные.");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     }
//   };

//   // const copyLinkToClipboard = () => {
//   //   if (isClient && navigator.clipboard) {
//   //     if (resultId) {
//   //       const link = `${window.location.origin}/dscan/result/${resultId}`;
//   //       navigator.clipboard.writeText(link);
//   //     }
//   //   } else {
//   //     console.error("Clipboard API не поддерживается в этом браузере.");
//   //   }
//   // };

//   // const copyLinkToClipboard = () => {
//   //  if (resultId) {
//   //     const link = `${window.location.origin}/dscan/result/${resultId}`;
//   //     navigator.clipboard.writeText(link);
//   //   }
//   // };

//   const redirectToResult = () => {
//     if (resultId) {
//       window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
//     }
//   };

//   // useEffect(() => {
//   //   setIsClient(true);
//   // }, []);

//   return (
//     <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//       <textarea
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         placeholder="Введите результат D-Scan"
//         rows={10}
//         className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//       />



//       <div className="flex flex-wrap gap-4 mt-2 justify-center">
//         <button
//           onClick={handleParseDscan}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Проанализировать
//         </button>

//         <button
//           onClick={() => {
//             setInputValue("");
//             setResults([]);
//             setResultId(null);
//           }}
//           className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//         >
//           <Trash2 className="h-4 w-4" />
//           Очистить
//         </button>

//         {resultId && (
//           <button
//             // onClick={copyLinkToClipboard}
//             onClick={redirectToResult}
//             className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
//           >
//             <Copy className="h-4 w-4" />
//             Поделиться
//           </button>
//         )}
//       </div>


//       {error && <p className="text-red-500 mt-2">{error}</p>}

//       {/* Общее количество кораблей */}
//       {results.length > 0 && (
//         <p className="mt-4 text-2xl font-semibold  text-center">
//           Всего кораблей:{" "}
//           <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//         </p>
//       )}

//       {/* Результаты анализа */}
//       {results.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
//             {results.map((result, index) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//               >
//                 <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                 <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                   {result.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//       )}

//       {/* Динамическая ссылка */}
//       {resultId && (
//         <div className="mt-6 flex flex-col items-center">
//           <p className="text-sm text-slate-400">Ссылка на результат:</p>
//           <a
//             href={`${window.location.origin}/dscan/result/${resultId}`}
//             className="text-blue-500 underline break-all mt-1"
//           >
//             {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//           </a>
//         </div>
//       )}

//       {/* Инструкция */}
//       <div className="text-slate-300 mt-8">
//         <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//         <p className="text-slate-300">В игре откройте окно D-Scan (Alt+D)</p>
//         <p className="text-slate-300">
//           Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//         </p>
//         <p className="text-slate-300">
//           Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//         </p>
//         <p className="text-slate-300">
//           Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//         </p>
//         <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//       </div>
//     </div>
//   );
// };

// export default Dscan;
