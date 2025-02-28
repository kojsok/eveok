
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
  // const [isClient, setIsClient] = useState(false);

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

  // const copyLinkToClipboard = () => {
  //   if (isClient && navigator.clipboard) {
  //     if (resultId) {
  //       const link = `${window.location.origin}/dscan/result/${resultId}`;
  //       navigator.clipboard.writeText(link);
  //     }
  //   } else {
  //     console.error("Clipboard API не поддерживается в этом браузере.");
  //   }
  // };

  // const copyLinkToClipboard = () => {
  //  if (resultId) {
  //     const link = `${window.location.origin}/dscan/result/${resultId}`;
  //     navigator.clipboard.writeText(link);
  //   }
  // };

  const redirectToResult = () => {
    if (resultId) {
      window.location.href = `${window.location.origin}/dscan/result/${resultId}`;
    }
  };

  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

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
            setResultId(null);
          }}
          className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
          <Trash2 className="h-4 w-4" />
          Очистить
        </button>

        {resultId && (
          <button
            // onClick={copyLinkToClipboard}
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
        <p className="mt-4 text-2xl font-semibold  text-center">
          Всего кораблей:{" "}
          <span className="text-yellow-400">{results.reduce((sum, result) => sum + result.count, 0)}</span>
        </p>
      )}

      {/* Результаты анализа */}
      {results.length > 0 && (
        <div className="max-w-2xl mx-auto mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-slate-800 p-2 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
              >
                <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
                <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
                  {result.count}
                </span>
              </div>
            ))}
          </div>
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
