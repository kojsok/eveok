
"use client";
import { shipList } from "@/lib/ArrayShipsOnly";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Copy, Trash2, RefreshCw } from "lucide-react"; // Импортируем иконки

interface ShipResult {
  name: string;
  count: number;
}

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

const Dscan = () => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<ShipResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);

  const handleParseDscan = async () => {
    try {
      setError(null);
      const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) {
        throw new Error("Введите данные D-Scan.");
      }

      const shipCounts: { [key: string]: number } = {};

      for (const line of lines) {
        const shipName = parseShipNameWithExactMatch(line, shipList);
        if (shipName) {
          shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
        }
      }

      const resultArray = Object.entries(shipCounts)
        .map(([name, count]): ShipResult => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Сортировка по убыванию

      setResults(resultArray);

      if (resultArray.length === 0) {
        throw new Error("Корабли не найдены.");
      }

      const id = uuidv4();
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

  const copyLinkToClipboard = () => {
    if (resultId) {
      const link = `${window.location.origin}/dscan/result/${resultId}`;
      navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Введите результат D-Scan"
        rows={10}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
      />

      {/* Блок с кнопками */}
      <div className="flex space-x-2 mt-4 justify-center">
        <button
          onClick={handleParseDscan}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Проанализировать
        </button>
        <button
          onClick={() => {
            setInputValue("");
            setResults([]);
            setResultId(null);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 flex items-center"
        >
          <Trash2 className="mr-2 h-5 w-5" /> Очистить
        </button>
        {resultId && (
          <button
            onClick={copyLinkToClipboard}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 flex items-center"
          >
            <Copy className="mr-2 h-5 w-5" /> Поделиться
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Общее количество кораблей */}
      {results.length > 0 && (
        <p className="mt-4 text-lg font-semibold">
          Всего кораблей:{" "}
          <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
        </p>
      )}

      {/* Результаты анализа */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-slate-800 p-1 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
            >
              <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
              <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
                {result.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Динамическая ссылка */}
      {resultId && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm text-slate-400">Ссылка на результат:</p>
          <a
            href={`${window.location.origin}/dscan/result/${resultId}`}
            className="text-blue-500 underline break-all mt-1"
          >
            {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
          </a>
        </div>
      )}

      {/* Инструкция */}
      <div className="text-slate-300 mt-8">
        <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
        <p className="text-slate-300">В игре откройте окно D-Scan (Ctrl+D)</p>
        <p className="text-slate-300">
          Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
        </p>
        <p className="text-slate-300">
          Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
        </p>
        <p className="text-slate-300">
          Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
        </p>
        <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
      </div>
    </div>
  );
};

export default Dscan;



// "use client"
// import { shipList } from "@/lib/ArrayShipsOnly";
// // import { saveToDatabase } from "@/lib/db";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";



//     interface ShipResult {
//         name: string;
//         count: number;
//     }

// // Функция для поиска названия корабля с точным совпадением
// const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//         const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//         const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//         const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     return null;
// };

// const Dscan = () => {
//     const [inputValue, setInputValue] = useState("");
//     // const [results, setResults] = useState<ShipResult[]>([]);
//     const [results, setResults] = useState<ShipResult[]>([]);
//     const [error, setError] = useState<string | null>(null);
//     const [resultId, setResultId] = useState<string | null>(null);

//     const handleParseDscan = async () => {
//         try {
//             setError(null);
//             const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//             if (!lines.length) {
//                 throw new Error("Введите данные D-Scan.");
//             }
    
//             const shipCounts: { [key: string]: number } = {};
    
//             for (const line of lines) {
//                 const shipName = parseShipNameWithExactMatch(line, shipList);
//                 if (shipName) {
//                     shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
//                 }
//             }
    
//             // const resultArray = Object.entries(shipCounts).map(([name, count]) => ({ name, count }));
//             // setResults(resultArray);
//             const resultArray = Object.entries(shipCounts).map(([name, count]): ShipResult => ({ name, count }));
// setResults(resultArray);
    
//             if (resultArray.length === 0) {
//                 throw new Error("Корабли не найдены.");
//             }
    
//             // Генерация уникального ID
//             const id = uuidv4();
//             setResultId(id);
    
//             // Отправка данных через API
//             const response = await fetch("/api/dscan/save", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ id, data: resultArray }),
//             });
    
//             if (!response.ok) {
//                 throw new Error("Не удалось сохранить данные.");
//             }
//         } catch (err: unknown) {
//             if (err instanceof Error) {
//                 setError(err.message);
//             } else {
//                 setError("Произошла неизвестная ошибка.");
//             }
//         }
//     };

//     const copyLinkToClipboard = () => {
//         if (resultId) {
//             const link = `${window.location.origin}/dscan/result/${resultId}`;
//             navigator.clipboard.writeText(link);
//             // alert("Ссылка скопирована в буфер обмена!");
//         }
//     };

//     // ... (остальной код остается без изменений)

// return (
//     <div className="p-4 bg-slate-900 text-slate-300">
//         <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>
//         <textarea
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="Введите результат D-Scan"
//             rows={10}
//             className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         />
        
//         {/* Блок с кнопками */}
//         <div className="flex space-x-2 mt-4">
//             <button
//                 onClick={handleParseDscan}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
//             >
//                 Проанализировать
//             </button>
//             <button 
//                 onClick={() => {
//                     setInputValue(''); // Очищаем textarea
//                     setResults([]);   // Сбрасываем результаты
//                     setResultId(null); // Сбрасываем ID результата
//                 }} 
//                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
//             >
//                 Очистить
//             </button>
//             {resultId && (
//                 <button 
//                     onClick={copyLinkToClipboard} 
//                     className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
//                 >
//                     Скопировать ссылку
//                 </button>
//             )}
//         </div>

//         {error && <p className="text-red-500 mt-2">{error}</p>}

//         {/* Общее количество кораблей */}
//         {results.length > 0 && (
//             <p className="mt-4 text-lg font-semibold">
//                 Всего кораблей: <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
//             </p>
//         )}

//         {/* Результаты анализа */}
//         {results.length > 0 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
//                 {results.map((result: ShipResult, index: number) => (
//                     <div
//                         key={index}
//                         className="bg-slate-800 p-1 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//                     >
//                         <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                         <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                             {result.count}
//                         </span>
//                     </div>
//                 ))}
//             </div>
//         )}

//         {/* Динамическая ссылка */}
//         {resultId && (
//             <div className="mt-6 flex flex-col items-center">
//                 <p className="text-sm text-slate-400">Ссылка на результат:</p>
//                 <a 
//                     href={`${window.location.origin}/dscan/result/${resultId}`}
//                     className="text-blue-500 underline break-all mt-1"
//                 >
//                     {`${window.location.origin}/dscan/r/${resultId.slice(0, 6)}`}
//                 </a>
//             </div>
//         )}

//         {/* Инструкция */}
//         <div className="text-slate-300 mt-8">
//             <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//             <p className="text-slate-300">В игре откройте окно D-Scan (Ctrl+D)</p>
//             <p className="text-slate-300">
//                 Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//             </p>
//             <p className="text-slate-300">
//                 Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//             </p>
//             <p className="text-slate-300">
//                 Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//             </p>
//             <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>
//         </div>
//     </div>
// );
// };

// export default Dscan;



//!ВООБЩЕ НЕ ТРОГАТЬ
// "use client"
// import { shipList } from "@/lib/ArrayShipsOnly";
// // import { saveToDatabase } from "@/lib/db";
// import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";



//     interface ShipResult {
//         name: string;
//         count: number;
//     }

// // Функция для поиска названия корабля с точным совпадением
// const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//         const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//         const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//         const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     return null;
// };

// const Dscan = () => {
//     const [inputValue, setInputValue] = useState("");
//     // const [results, setResults] = useState<ShipResult[]>([]);
//     const [results, setResults] = useState<ShipResult[]>([]);
//     const [error, setError] = useState<string | null>(null);
//     const [resultId, setResultId] = useState<string | null>(null);

//     const handleParseDscan = async () => {
//         try {
//             setError(null);
//             const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean);
//             if (!lines.length) {
//                 throw new Error("Введите данные D-Scan.");
//             }
    
//             const shipCounts: { [key: string]: number } = {};
    
//             for (const line of lines) {
//                 const shipName = parseShipNameWithExactMatch(line, shipList);
//                 if (shipName) {
//                     shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
//                 }
//             }
    
//             // const resultArray = Object.entries(shipCounts).map(([name, count]) => ({ name, count }));
//             // setResults(resultArray);
//             const resultArray = Object.entries(shipCounts).map(([name, count]): ShipResult => ({ name, count }));
// setResults(resultArray);
    
//             if (resultArray.length === 0) {
//                 throw new Error("Корабли не найдены.");
//             }
    
//             // Генерация уникального ID
//             const id = uuidv4();
//             setResultId(id);
    
//             // Отправка данных через API
//             const response = await fetch("/api/dscan/save", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ id, data: resultArray }),
//             });
    
//             if (!response.ok) {
//                 throw new Error("Не удалось сохранить данные.");
//             }
//         } catch (err: unknown) {
//             if (err instanceof Error) {
//                 setError(err.message);
//             } else {
//                 setError("Произошла неизвестная ошибка.");
//             }
//         }
//     };

//     const copyLinkToClipboard = () => {
//         if (resultId) {
//             const link = `${window.location.origin}/dscan/result/${resultId}`;
//             navigator.clipboard.writeText(link);
//             // alert("Ссылка скопирована в буфер обмена!");
//         }
//     };

//     return (
//         <div className="p-4 bg-slate-900 text-slate-300">
//             <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>

//             <textarea
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 placeholder="Введите результат D-Scan"
//                 rows={10}
//                 className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//             />
//             <button
//                 onClick={handleParseDscan}
//                 className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//                 Проанализировать
//             </button>

//             {error && <p className="text-red-500 mt-2">{error}</p>}


//             {resultId && (
//                 <div>
//                     <p>Динамическая ссылка: {`${window.location.origin}/dscan/result/${resultId}`}</p>
//                     <button onClick={copyLinkToClipboard} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Скопировать ссылку</button>
//                 </div>
//             )}


//             {results.length > 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
//                     {results.map((result: ShipResult, index: number) => (
//                         <div
//                             key={index}
//                             className="bg-slate-800 p-1 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//                         >
//                             {/* Название корабля */}
//                             <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>

//                             {/* Количество кораблей */}
//                             <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                                 {result.count}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             <div className="text-slate-300">
//                 <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//                 <p className="text-slate-300">В игре откройте окно D-Scan (Ctrl+D)</p>
//                 <p className="text-slate-300">
//                     Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//                 </p>
//                 <p className="text-slate-300">
//                     Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//                 </p>
//                 <p className="text-slate-300">
//                     Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//                 </p>
//                 <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>

//             </div>
//         </div>
//     );
// };

// export default Dscan;



//!не трогать
// "use client";
// import { useState } from "react";

// // Массив точных названий кораблей
// const shipList: string[] =
//     [
//         "Amarr Shuttle",
//         "Minmatar Shuttle",
//         "Gallente Shuttle",
//         "Caldari Shuttle",
//         "Goru's Shuttle",
//         "Guristas Shuttle",
//         "Bantam",
//         "Condor",
//         "Griffin",
//         "Kestrel",
//         "Merlin",
//         "Heron",
//         "Slasher",
//         "Probe",
//         "Rifter",
//         "Breacher",
//         "Burst",
//         "Vigil",
//         "Executioner",
//         "Inquisitor",
//         "Tormentor",
//         "Punisher",
//         "Crucifier",
//         "Magnate",
//         "Navitas",
//         "Tristan",
//         "Incursus",
//         "Imicus",
//         "Atron",
//         "Maulus",
//         "Venture",
//         "Citizen Venture",
//         "Succubus",
//         "Cruor",
//         "Daredevil",
//         "Worm",
//         "Dramiel",
//         "Astero",
//         "Garmur",
//         "Caldari Navy Hookbill",
//         "Imperial Navy Slicer",
//         "Republic Fleet Firetail",
//         "Federation Navy Comet",
//         "Police Pursuit Comet",
//         "Crucifier Navy Issue",
//         "Vigil Fleet Issue",
//         "Griffin Navy Issue",
//         "Maulus Navy Issue",
//         "Probe Fleet Issue",
//         "Heron Navy Issue",
//         "Magnate Navy Issue",
//         "Imicus Navy Issue",
//         "Skybreaker",
//         "Crusader",
//         "Malediction",
//         "Crow",
//         "Raptor",
//         "Taranis",
//         "Ares",
//         "Claw",
//         "Stiletto",
//         "Anathema",
//         "Purifier",
//         "Buzzard",
//         "Manticore",
//         "Helios",
//         "Nemesis",
//         "Cheetah",
//         "Hound",
//         "Vengeance",
//         "Retribution",
//         "Hawk",
//         "Harpy",
//         "Ishkur",
//         "Enyo",
//         "Wolf",
//         "Jaguar",
//         "Nergal",
//         "Sentinel",
//         "Kitsune",
//         "Keres",
//         "Hyena",
//         "Prospect",
//         "Endurance",
//         "Deacon",
//         "Kirin",
//         "Thalia",
//         "Scalpel",
//         "Damavik",
//         "Stabber",
//         "Rupture",
//         "Bellicose",
//         "Scythe",
//         "Maller",
//         "Augoror",
//         "Arbitrator",
//         "Omen",
//         "Test Site Maller",
//         "Osprey",
//         "Caracal",
//         "Moa",
//         "Blackbird",
//         "Vexor",
//         "Thorax",
//         "Celestis",
//         "Exequror",
//         "Guardian",
//         "Basilisk",
//         "Oneiros",
//         "Scimitar",
//         "Zarmazd",
//         "Zealot",
//         "Sacrilege",
//         "Cerberus",
//         "Eagle",
//         "Ishtar",
//         "Deimos",
//         "Vagabond",
//         "Muninn",
//         "Ikitursa",
//         "Pilgrim",
//         "Curse",
//         "Falcon",
//         "Rook",
//         "Arazu",
//         "Lachesis",
//         "Huginn",
//         "Rapier",
//         "Devoter",
//         "Onyx",
//         "Phobos",
//         "Broadsword",
//         "Legion",
//         "Tengu",
//         "Proteus",
//         "Loki",
//         "Monitor",
//         "Caracal Navy Issue",
//         "Omen Navy Issue",
//         "Stabber Fleet Issue",
//         "Vexor Navy Issue",
//         "Scythe Fleet Issue",
//         "Augoror Navy Issue",
//         "Osprey Navy Issue",
//         "Exequror Navy Issue",
//         "Gila",
//         "Phantasm",
//         "Cynabal",
//         "Vigilant",
//         "Ashimmu",
//         "Stratios",
//         "Orthrus",
//         "Stormbringer",
//         "Vedmak",
//         "Rodiva",
//         "Coercer",
//         "Dragoon",
//         "Cormorant",
//         "Corax",
//         "Catalyst",
//         "Algos",
//         "Thrasher",
//         "Talwar",
//         "Heretic",
//         "Flycatcher",
//         "Eris",
//         "Sabre",
//         "Confessor",
//         "Svipul",
//         "Jackdaw",
//         "Hecate",
//         "Pontifex",
//         "Stork",
//         "Magus",
//         "Bifrost",
//         "Draugur",
//         "Kikimora",
//         "Coercer Navy Issue",
//         "Thrasher Fleet Issue",
//         "Cormorant Navy Issue",
//         "Catalyst Navy Issue",
//         "Mekubal",
//         "Mamba",
//         "Tholos",
//         "Oracle",
//         "Prophecy",
//         "Harbinger",
//         "Naga",
//         "Ferox",
//         "Drake",
//         "Talos",
//         "Brutix",
//         "Myrmidon",
//         "Tornado",
//         "Cyclone",
//         "Hurricane",
//         "Absolution",
//         "Damnation",
//         "Vulture",
//         "Nighthawk",
//         "Eos",
//         "Astarte",
//         "Sleipnir",
//         "Claymore",
//         "Brutix Navy Issue",
//         "Drake Navy Issue",
//         "Harbinger Navy Issue",
//         "Hurricane Fleet Issue",
//         "Cyclone Fleet Issue",
//         "Ferox Navy Issue",
//         "Myrmidon Navy Issue",
//         "Prophecy Navy Issue",
//         "Alligator",
//         "Khizriel",
//         "Cenotaph",
//         "Drekavac",
//         "Tempest",
//         "Typhoon",
//         "Maelstrom",
//         "Apocalypse",
//         "Armageddon",
//         "Abaddon",
//         "Raven",
//         "Scorpion",
//         "Rokh",
//         "Megathron",
//         "Dominix",
//         "Hyperion",
//         "Redeemer",
//         "Widow",
//         "Sin",
//         "Panther",
//         "Paladin",
//         "Golem",
//         "Kronos",
//         "Vargur",
//         "Raven Navy Issue",
//         "Apocalypse Navy Issue",
//         "Megathron Navy Issue",
//         "Tempest Fleet Issue",
//         "Armageddon Navy Issue",
//         "Dominix Navy Issue",
//         "Scorpion Navy Issue",
//         "Typhoon Fleet Issue",
//         "Nightmare",
//         "Machariel",
//         "Vindicator",
//         "Rattlesnake",
//         "Bhaalgorn",
//         "Nestor",
//         "Barghest",
//         "Thunderchild",
//         "Leshak",
//         "Vehement",
//         "Chemosh",
//         "Caiman",
//         "Naglfar Fleet Issue",
//         "Revelation Navy Issue",
//         "Moros Navy Issue",
//         "Phoenix Navy Issue",
//         "Zirnitra",
//         "Revelation",
//         "Phoenix",
//         "Moros",
//         "Naglfar",
//         "Bane",
//         "Karura",
//         "Valravn",
//         "Hubris",
//         "Providence",
//         "Charon",
//         "Obelisk",
//         "Fenrir",
//         "Bowhead",
//         "Avalanche",
//         "Avatar",
//         "Leviathan",
//         "Erebus",
//         "Ragnarok",
//         "Vanquisher",
//         "Molok",
//         "Komodo",
//         "Azariel",
//         "Archon",
//         "Aeon",
//         "Chimera",
//         "Wyvern",
//         "Thanatos",
//         "Nyx",
//         "Vanguard",
//         "Hel",
//         "Nidhoggur",
//         "Revenant",
//         "Vendetta",
//         "Rorqual",
//         "Ark",
//         "Rhea",
//         "Anshar",
//         "Nomad",
//         "Apostle",
//         "Minokawa",
//         "Ninazu",
//         "Venerable",
//         "Lif",
//         "Dagon",
//         "Loggerhead",
//         "Hoarder",
//         "Mammoth",
//         "Wreathe",
//         "Nereus",
//         "Kryos",
//         "Epithal",
//         "Miasmos",
//         "Iteron Mark V",
//         "Badger",
//         "Tayra",
//         "Bestower",
//         "Sigil",
//         "Noctis",
//         "Squall",
//         "Prorator",
//         "Impel",
//         "Crane",
//         "Bustard",
//         "Viator",
//         "Occator",
//         "Prowler",
//         "Mastodon",
//         "Deluge",
//         "Torrent",
//         "Orca",
//         "Porpoise",
//         "Covetor",
//         "Retriever",
//         "Procurer",
//         "Hulk",
//         "Skiff",
//         "Mackinaw",
//         "Primae",
//         "Miasmos Quafe Ultra Edition",
//         "Miasmos Quafe Ultramarine Edition",
//         "Miasmos Amastris Edition",
//         "Apotheosis",
//         "InterBus Shuttle",
//         "Leopard",
//         "Council Diplomatic Shuttle",
//         "Boobook",
//         "Zephyr",
//         "Echelon",
//         "Gold Magnate",
//         "Silver Magnate",
//         "Metamorphosis",
//         "Scorpion Ishukone Watch",
//         "Apocalypse Imperial Issue",
//         "Armageddon Imperial Issue",
//         "Megathron Federate Issue",
//         "Raven State Issue",
//         "Tempest Tribal Issue",
//         "Marshal",
//         "Praxis",
//         "Python",
//         "Adrestia",
//         "Vangel",
//         "Mimir",
//         "Bestla",
//         "Cybele",
//         "Utu",
//         "Malice",
//         "Freki",
//         "Cambion",
//         "Geri",
//         "Shapash",
//         "Etana",
//         "Rabisu",
//         "Gnosis",
//         "Opux Luxury Yacht",
//         "Guardian-Vexor",
//         "Victorieux Luxury Yacht",
//         "Moracha",
//         "Chameleon",
//         "Enforcer",
//         "Victor",
//         "Tiamat",
//         "Cobra",
//         "Chremoas",
//         "Caedes",
//         "Pacifier",
//         "Virtuoso",
//         "Hydra",
//         "Sidewinder",
//         "Whiptail",
//         "Imp",
//         "Fiend",
//         "Laelaps",
//         "Sunesis",
//         "Immolator",
//         "Echo",
//         "Hematos",
//         "Taipan",
//         "Violator",
//         "Raiju",
//         "Impairor",
//         "Ibis",
//         "Velator",
//         "Reaper"
//     ]
//     ;

// // Функция для поиска названия корабля с точным совпадением
// const parseShipNameWithExactMatch = (line: string, shipList: string[]): string | null => {
//     // Попытка найти название корабля из трех слов
//     const threeWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){2})\*/);
//     if (threeWordMatch) {
//         const shipNameCandidate = threeWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     // Если не найдено, пытаемся найти название из двух слов
//     const twoWordMatch = line.match(/([^\s*]+(?:\s+[^\s*]+){1})\*/);
//     if (twoWordMatch) {
//         const shipNameCandidate = twoWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     // Если снова не найдено, пытаемся найти название из одного слова
//     const oneWordMatch = line.match(/([^\s*]+)\*/);
//     if (oneWordMatch) {
//         const shipNameCandidate = oneWordMatch[1].replace(/\*/g, "").trim();
//         if (shipList.includes(shipNameCandidate)) {
//             return shipNameCandidate;
//         }
//     }

//     return null; // Если ничего не найдено, возвращаем null
// };

// const Dscan = () => {
//     const [inputValue, setInputValue] = useState("");
//     const [results, setResults] = useState<{ name: string; count: number }[]>([]);
//     const [error, setError] = useState<string | null>(null);

//     const handleParseDscan = () => {
//         try {
//             setError(null);
//             const lines = inputValue.split("\n").map((line) => line.trim()).filter(Boolean); // Разделяем строки и убираем пустые
//             if (!lines.length) {
//                 throw new Error("Введите данные D-Scan.");
//             }

//             const shipCounts: { [key: string]: number } = {};

//             for (const line of lines) {
//                 const shipName = parseShipNameWithExactMatch(line, shipList);
//                 if (shipName) {
//                     shipCounts[shipName] = (shipCounts[shipName] || 0) + 1;
//                 }
//             }

//             const resultArray = Object.entries(shipCounts).map(([name, count]) => ({ name, count }));
//             setResults(resultArray);

//             if (resultArray.length === 0) {
//                 throw new Error("Корабли не найдены.");
//             }
//         } catch (err: unknown) {
//             if (err instanceof Error) {
//                 setError(err.message);
//             } else {
//                 setError("Произошла неизвестная ошибка.");
//             }
//         }
//     };

//     return (
//         <div className="p-4 bg-slate-900 text-slate-300">
//             <h1 className="text-2xl font-bold mb-4">D-Scan Parser - быстрый анализ тактической ситуации в системе</h1>

//             <textarea
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 placeholder="Введите результат D-Scan"
//                 rows={10}
//                 className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//             />
//             <button
//                 onClick={handleParseDscan}
//                 className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//                 Проанализировать
//             </button>

//             {error && <p className="text-red-500 mt-2">{error}</p>}



//             {results.length > 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
//                     {results.map((result, index) => (
//                         <div
//                             key={index}
//                             className="bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//                         >
//                             {/* Название корабля */}
//                             <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>

//                             {/* Количество кораблей */}
//                             <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                                 {result.count}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             <div className="text-slate-300">
//                 <p>Инструкция по использованию парсера D-Scan в EVE Online:</p>
//                 <p className="text-slate-300">В игре откройте окно D-Scan (Ctrl+D)</p>
//                 <p className="text-slate-300">
//                     Выделите весь текст в окне D-Scan: Для Windows: нажмите Ctrl+A Для macOS: нажмите Command+A<br />
//                 </p>
//                 <p className="text-slate-300">
//                     Скопируйте выделенный текст: нажмите Ctrl+C либо Command+C<br />
//                 </p>
//                 <p className="text-slate-300">
//                     Вставьте скопированный текст в поле парсера: нажмите Ctrl+V либо Command+V<br />
//                 </p>
//                 <p className="text-slate-300">Нажмите кнопку Проанализировать для обработки данных</p>

//             </div>
//         </div>
//     );
// };

// export default Dscan;