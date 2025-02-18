"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button"; // Используем кнопку из shadcn
import axios from "axios";

// Типы данных
interface TypeData {
    [key: string]: {
        id: number;
        iconID: null | number; // Добавляем null
        graphicID: null | number; // Добавляем null
        name: {
            en: string;
            ru: string;
        };
        basePrice: null | number; // Добавляем null
    };
}

interface PriceData {
    adjusted_price: number;
    average_price: number;
    type_id: number;
}

// Форматирование чисел с разделением на тысячи и добавлением "ISK"
const formatNumber = (num: number): string => {
    const formatted = new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);

    // Заменяем запятую на точку для десятичной части
    return formatted.replace(/,/g, ".") + " ISK";
};

// Нормализация строки
const normalizeString = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[\(\[].*?[\)\]]/g, "") // Удаляем все, что находится внутри скобок
        .replace(/[-]/g, " ") // Заменяем тире на пробелы
        .trim();
};

// Поиск ближайших совпадений
const findCloseMatches = (itemName: string, typeData: TypeData): string[] => {
    const normalizedItemName = normalizeString(itemName);
    return Object.values(typeData)
        .filter((type) => {
            const normalizedEnName = normalizeString(type.name.en);
            const normalizedRuName = normalizeString(type.name.ru);
            return (
                normalizedEnName.includes(normalizedItemName) || normalizedRuName.includes(normalizedItemName)
            );
        })
        .map((type) => type.name.ru || type.name.en)
        .slice(0, 3); // Возвращаем до 3 ближайших совпадений
};

const ItemPriceChecker = () => {
    const [inputValue, setInputValue] = useState<string>("");
    const [results, setResults] = useState<{ name: string; adjustedPrice: string; averagePrice: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalAdjustedPrice, setTotalAdjustedPrice] = useState<number>(0); // Состояние для текущей цены
    const [totalAveragePrice, setTotalAveragePrice] = useState<number>(0); // Состояние для средней цены
    const itemsPerPage = 10;

    const fetchTypeData = async (): Promise<TypeData> => {
        const response = await import("../../src/data/typesnew.json");
        if (
            "default" in response &&
            typeof response.default === "object" &&
            response.default !== null
        ) {
            return Object.entries(response.default).reduce((acc, [key, value]) => {
                if (
                    typeof key === "string" &&
                    typeof value === "object" &&
                    value !== null &&
                    "id" in value &&
                    "iconID" in value &&
                    "graphicID" in value &&
                    "name" in value &&
                    "basePrice" in value
                ) {
                    acc[key] = {
                        id: value.id,
                        iconID: value.iconID ?? null, // Убеждаемся, что iconID может быть null
                        graphicID: value.graphicID ?? null, // Убеждаемся, что graphicID может быть null
                        name: {
                            en: value.name.en ?? "", // Заменяем null на пустую строку
                            ru: value.name.ru ?? "", // Заменяем null на пустую строку
                        },
                        basePrice: value.basePrice ?? null, // Убеждаемся, что basePrice может быть null
                    };
                }
                return acc;
            }, {} as TypeData);
        }
        return {};
    };

    const handleCheckPrices = async () => {
        try {
            setLoading(true);
            setError(null);

            setResults([]);
            setTotalAdjustedPrice(0); // Сбрасываем общую сумму текущей цены
            setTotalAveragePrice(0); // Сбрасываем общую сумму средней цены

            const itemNames = inputValue.split("\n").map((name) => name.trim()).filter(Boolean);

            if (!itemNames.length) {
                throw new Error("Введите хотя бы одно название предмета.");
            }

            const typeData = await fetchTypeData();

            const typeIds: number[] = [];
            const namesNotFound: string[] = [];

            for (const itemName of itemNames) {
                let found = false;
                const normalizedItemName = normalizeString(itemName);

                for (const [id, type] of Object.entries(typeData)) {
                    const normalizedEnName = normalizeString(type.name.en);
                    const normalizedRuName = normalizeString(type.name.ru);

                    if (normalizedEnName === normalizedItemName || normalizedRuName === normalizedItemName) {
                        typeIds.push(Number(id));
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    namesNotFound.push(itemName);
                }
            }

            if (namesNotFound.length > 0) {
                const suggestions = namesNotFound
                    .map((name) => {
                        const matches = findCloseMatches(name, typeData);
                        return matches.length > 0 ? `${name}: ${matches.join(", ")}` : name;
                    })
                    .join("; ");

                throw new Error(`Не найдены предметы: ${suggestions}`);
            }

            if (!typeIds.length) {
                throw new Error("Нет соответствующих предметов.");
            }

            const pricesResponse = await axios.get("https://esi.evetech.net/dev/markets/prices/", {
                params: {
                    datasource: "tranquility",
                },
            });

            const prices: PriceData[] = pricesResponse.data;

            const resultData: { name: string; adjustedPrice: string; averagePrice: string }[] = [];
            let currentTotalAdjustedPrice = 0; // Локальная переменная для подсчета сумм
            let currentTotalAveragePrice = 0;

            for (const typeId of typeIds) {
                const price = prices.find((p) => p.type_id === typeId);
                if (price) {
                    const typeName = typeData[typeId]?.name.ru || typeData[typeId]?.name.en || "Unknown";
                    const formattedAdjustedPrice = formatNumber(price.adjusted_price);
                    const formattedAveragePrice = formatNumber(price.average_price);

                    resultData.push({
                        name: typeName,
                        adjustedPrice: formattedAdjustedPrice,
                        averagePrice: formattedAveragePrice,
                    });

                    currentTotalAdjustedPrice += price.adjusted_price; // Суммируем текущие цены
                    currentTotalAveragePrice += price.average_price; // Суммируем средние цены
                }
            }

            setResults(resultData);
            setTotalAdjustedPrice(currentTotalAdjustedPrice); // Обновляем состояние общей суммы текущей цены
            setTotalAveragePrice(currentTotalAveragePrice); // Обновляем состояние общей суммы средней цены
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Произошла ошибка при получении цен.");
            } else {
                setError("Произошла неизвестная ошибка.");
            }
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(results.length / itemsPerPage);
    const paginatedResults = results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === "next" && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-slate-950 text-slate-300">
            <h1 className="text-2xl font-bold mb-4">Проверка цен предметов EVE Online</h1>
            <p className="text-slate-300">Введите названия предметов (по одному в строке), будет отображена цена предметов которые вы хотите проверить.</p>
            <p className="text-slate-300">Необходимо вводить точное название предмета, например Tritanium или Cobalt.</p>
            <p className="mb-4 text-slate-300">Интерактивный поиск предметов по частичному совпадению еще в разработке, также планируется добавить подсчет предметов по типу и количеству.</p>

            <form onSubmit={(e) => e.preventDefault()} className="mb-6">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите названия предметов (по одному в строке)"
                    rows={5}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
                />
                <Button onClick={handleCheckPrices} disabled={loading} className="mt-4">
                    {loading ? "Загрузка..." : "Проверить цены"}
                </Button>
            </form>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {results.length > 0 && (
                <div>
                    <table className="min-w-full divide-y divide-slate-700 bg-slate-950 text-slate-300">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">Название</th>
                                <th className="px-6 py-3">Базовая цена</th>
                                <th className="px-6 py-3">Средняя цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-slate-700 ${index % 2 === 0 ? "bg-slate-900" : "bg-slate-800"
                                        }`}
                                >
                                    <td className="px-6 py-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-6 py-4">{item.name}</td>
                                    <td className="px-6 py-4 text-right">{item.adjustedPrice}</td>
                                    <td className="px-6 py-4 text-right">{item.averagePrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Итоговая строка */}
                    <div className="flex justify-between mt-4 px-6 py-3 bg-slate-800 border-t border-slate-700">
                        <span className="font-bold">Итого:</span>
                        <span className="font-bold text-right">
                            {formatNumber(totalAdjustedPrice)} / {formatNumber(totalAveragePrice)}
                        </span>
                    </div>

                    {/* Пагинация */}
                    <div className="flex justify-center mt-4">
                        <Button
                            onClick={() => handlePageChange("prev")}
                            disabled={currentPage === 1}
                            className="bg-slate-800 hover:bg-slate-700"
                        >
                            Назад
                        </Button>
                        <span className="mx-2 text-slate-300">
                            Страница {currentPage} из {totalPages}
                        </span>
                        <Button
                            onClick={() => handlePageChange("next")}
                            disabled={currentPage === totalPages}
                            className="bg-slate-800 hover:bg-slate-700"
                        >
                            Вперед
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemPriceChecker;



// import { useState } from "react";
// import { Button } from "@/components/ui/button"; // Используем кнопку из shadcn
// import axios from "axios";

// // Типы данных
// interface TypeData {
//   [key: string]: {
//     id: number;
//     iconID: null | number;
//     graphicID: number;
//     name: {
//       en: string;
//       ru: string;
//     };
//     basePrice: number;
//   };
// }

// interface PriceData {
//   adjusted_price: number;
//   average_price: number;
//   type_id: number;
// }

// // Форматирование чисел с разделением на тысячи и добавлением "ISK"
// const formatNumber = (num: number): string => {
//   const formatted = new Intl.NumberFormat("ru-RU", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(num);

//   // Заменяем запятую на точку для десятичной части
//   return formatted.replace(/,/g, ".") + " ISK";
// };

// // Нормализация строки
// const normalizeString = (str: string): string => {
//   return str
//     .toLowerCase()
//     .replace(/[\(\[].*?[\)\]]/g, "") // Удаляем все, что находится внутри скобок
//     .replace(/[-]/g, " ") // Заменяем тире на пробелы
//     .trim();
// };

// // Поиск ближайших совпадений
// const findCloseMatches = (itemName: string, typeData: TypeData): string[] => {
//   const normalizedItemName = normalizeString(itemName);
//   return Object.values(typeData)
//     .filter((type) => {
//       const normalizedEnName = normalizeString(type.name.en);
//       const normalizedRuName = normalizeString(type.name.ru);
//       return (
//         normalizedEnName.includes(normalizedItemName) || normalizedRuName.includes(normalizedItemName)
//       );
//     })
//     .map((type) => type.name.ru || type.name.en)
//     .slice(0, 3); // Возвращаем до 3 ближайших совпадений
// };

// const ItemPriceChecker = () => {
//   const [inputValue, setInputValue] = useState<string>("");
//   const [results, setResults] = useState<{ name: string; adjustedPrice: string; averagePrice: string }[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalAdjustedPrice, setTotalAdjustedPrice] = useState<number>(0); // Состояние для текущей цены
//   const [totalAveragePrice, setTotalAveragePrice] = useState<number>(0); // Состояние для средней цены
//   const itemsPerPage = 10;

//   const fetchTypeData = async (): Promise<TypeData> => {
//     const response = await import("../../src/data/typesnew.json");
//     return "default" in response && typeof response.default === "object"
//       ? (response.default as TypeData)
//       : {};
//   };

//   const handleCheckPrices = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       setResults([]);
//       setTotalAdjustedPrice(0); // Сбрасываем общую сумму текущей цены
//       setTotalAveragePrice(0); // Сбрасываем общую сумму средней цены

//       const itemNames = inputValue.split("\n").map((name) => name.trim()).filter(Boolean);

//       if (!itemNames.length) {
//         throw new Error("Введите хотя бы одно название предмета.");
//       }

//       const typeData = await fetchTypeData();

//       const typeIds: number[] = [];
//       const namesNotFound: string[] = [];

//       for (const itemName of itemNames) {
//         let found = false;
//         const normalizedItemName = normalizeString(itemName);

//         for (const [id, type] of Object.entries(typeData)) {
//           const normalizedEnName = normalizeString(type.name.en);
//           const normalizedRuName = normalizeString(type.name.ru);

//           if (normalizedEnName === normalizedItemName || normalizedRuName === normalizedItemName) {
//             typeIds.push(Number(id));
//             found = true;
//             break;
//           }
//         }

//         if (!found) {
//           namesNotFound.push(itemName);
//         }
//       }

//       if (namesNotFound.length > 0) {
//         const suggestions = namesNotFound
//           .map((name) => {
//             const matches = findCloseMatches(name, typeData);
//             return matches.length > 0 ? `${name}: ${matches.join(", ")}` : name;
//           })
//           .join("; ");

//         throw new Error(`Не найдены предметы: ${suggestions}`);
//       }

//       if (!typeIds.length) {
//         throw new Error("Нет соответствующих предметов.");
//       }

//       const pricesResponse = await axios.get("https://esi.evetech.net/dev/markets/prices/", {
//         params: {
//           datasource: "tranquility",
//         },
//       });

//       const prices: PriceData[] = pricesResponse.data;

//       const resultData: { name: string; adjustedPrice: string; averagePrice: string }[] = [];
//       let currentTotalAdjustedPrice = 0; // Локальная переменная для подсчета сумм
//       let currentTotalAveragePrice = 0;

//       for (const typeId of typeIds) {
//         const price = prices.find((p) => p.type_id === typeId);
//         if (price) {
//           const typeName = typeData[typeId]?.name.ru || typeData[typeId]?.name.en || "Unknown";
//           const formattedAdjustedPrice = formatNumber(price.adjusted_price);
//           const formattedAveragePrice = formatNumber(price.average_price);

//           resultData.push({
//             name: typeName,
//             adjustedPrice: formattedAdjustedPrice,
//             averagePrice: formattedAveragePrice,
//           });

//           currentTotalAdjustedPrice += price.adjusted_price; // Суммируем текущие цены
//           currentTotalAveragePrice += price.average_price; // Суммируем средние цены
//         }
//       }

//       setResults(resultData);
//       setTotalAdjustedPrice(currentTotalAdjustedPrice); // Обновляем состояние общей суммы текущей цены
//       setTotalAveragePrice(currentTotalAveragePrice); // Обновляем состояние общей суммы средней цены
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message || "Произошла ошибка при получении цен.");
//       } else {
//         setError("Произошла неизвестная ошибка.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalPages = Math.ceil(results.length / itemsPerPage);
//   const paginatedResults = results.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handlePageChange = (direction: "prev" | "next") => {
//     if (direction === "prev" && currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     } else if (direction === "next" && currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-slate-950 text-slate-300">
//       <h1 className="mx-auto text-2xl font-bold mb-4">Проверка цен предметов</h1>

//       <p className="text-slate-300">Введите названия предметов (по одному в строке), будет отображена цена предметов которые вы хотите проверить.</p>
//       <p className="text-slate-300">Необходимо вводить точное название предмета, например Tritanium или Cobalt.</p>
//       <p className="mb-4 text-slate-300">Интерактивный поиск предметов по частичному совпадению еще в разработке, также планируется добавить подсчет предметов по типу и количеству.</p>
//       <form onSubmit={(e) => e.preventDefault()} className="mb-6">
//         <textarea
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           placeholder="Введите названия предметов (по одному в строке)"
//           rows={5}
//           className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
//         />
//         <Button onClick={handleCheckPrices} disabled={loading} className="mt-4">
//           {loading ? "Загрузка..." : "Проверить цены"}
//         </Button>
//       </form>

//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {results.length > 0 && (
//         <div>
//           <table className="min-w-full divide-y divide-slate-700 bg-slate-950 text-slate-300">
//             <thead>
//               <tr className="border-b border-slate-700">
//                 <th className="px-6 py-3">#</th>
//                 <th className="px-6 py-3">Название</th>
//                 <th className="px-6 py-3">Текущая цена</th>
//                 <th className="px-6 py-3">Средняя цена</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedResults.map((item, index) => (
//                 <tr
//                   key={index}
//                   className={`border-b border-slate-700 ${
//                     index % 2 === 0 ? "bg-slate-900" : "bg-slate-800"
//                   }`}
//                 >
//                   <td className="px-6 py-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                   <td className="px-6 py-4">{item.name}</td>
//                   <td className="px-6 py-4 text-right">{item.adjustedPrice}</td>
//                   <td className="px-6 py-4 text-right">{item.averagePrice}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Итоговая строка */}
//           <div className="flex justify-between mt-4 px-6 py-3 bg-slate-800 border-t border-slate-700">
//             <span className="font-bold">Итого:</span>
//             <span className="font-bold text-right">
//               {formatNumber(totalAdjustedPrice)} / {formatNumber(totalAveragePrice)}
//             </span>
//           </div>

//           {/* Пагинация */}
//           <div className="flex justify-center mt-4">
//             <Button
//               onClick={() => handlePageChange("prev")}
//               disabled={currentPage === 1}
//               className="bg-slate-800 hover:bg-slate-700"
//             >
//               Назад
//             </Button>
//             <span className="mx-2 text-slate-300">
//               Страница {currentPage} из {totalPages}
//             </span>
//             <Button
//               onClick={() => handlePageChange("next")}
//               disabled={currentPage === totalPages}
//               className="bg-slate-800 hover:bg-slate-700"
//             >
//               Вперед
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ItemPriceChecker;

