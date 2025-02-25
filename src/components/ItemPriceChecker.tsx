"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // Используем кнопку из shadcn
import axios from "axios";
import { CheckSquare, Trash2 } from 'lucide-react';

// Типы данных
interface TypeData {
    [key: string]: {
        id: number;
        iconID: null | number;
        graphicID: null | number;
        name: {
            en: string;
            ru: string;
        };
        basePrice: null | number;
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
    // return formatted.replace(/,/g, ".") + " ISK";
    return formatted.replace(/,/g, ".");
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
        .slice(0, 5); // Возвращаем до 5 ближайших совпадений
};

const ItemPriceChecker = () => {
    const [inputValue, setInputValue] = useState("");
    const [results, setResults] = useState<
        Array<{ name: string; adjustedPrice: string; averagePrice: string; quantity: number; totalAdjustedPrice: string; totalAveragePrice: string }>
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalAdjustedPrice, setTotalAdjustedPrice] = useState(0);
    const [totalAveragePrice, setTotalAveragePrice] = useState(0);
    const itemsPerPage = 20; // Количество предметов на одной странице

    const fetchTypeData = async (): Promise<TypeData> => {
        const response = await import("../../src/data/typesnew.json");
        if ("default" in response && typeof response.default === "object" && response.default !== null) {
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
                        iconID: value.iconID ?? null,
                        graphicID: value.graphicID ?? null,
                        name: {
                            en: value.name.en ?? "",
                            ru: value.name.ru ?? "",
                        },
                        basePrice: value.basePrice ?? null,
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
            setTotalAdjustedPrice(0);
            setTotalAveragePrice(0);

            const itemNames = inputValue
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            if (!itemNames.length) {
                throw new Error("Введите хотя бы одно название предмета.");
            }

            const typeData = await fetchTypeData();

            const typeIdsWithQuantities: { typeId: number; quantity: number }[] = [];
            const namesNotFound: string[] = [];

            for (const itemName of itemNames) {
                const [namePart, quantityPart] = itemName.split("*").map((part) => part.trim());
                const quantity = quantityPart ? parseInt(quantityPart, 10) : 1;

                if (quantityPart && (isNaN(quantity) || quantity <= 0)) {
                    throw new Error(`Неверное количество для предмета "${namePart}".`);
                }

                const normalizedItemName = normalizeString(namePart);
                let found = false;

                for (const [id, type] of Object.entries(typeData)) {
                    const normalizedEnName = normalizeString(type.name.en);
                    const normalizedRuName = normalizeString(type.name.ru);

                    if (normalizedEnName === normalizedItemName || normalizedRuName === normalizedItemName) {
                        typeIdsWithQuantities.push({ typeId: Number(id), quantity });
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    namesNotFound.push(namePart);
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

            if (!typeIdsWithQuantities.length) {
                throw new Error("Нет соответствующих предметов.");
            }

            const pricesResponse = await axios.get("https://esi.evetech.net/dev/markets/prices/", {
                params: {
                    datasource: "tranquility",
                },
            });

            const prices: PriceData[] = pricesResponse.data;

            const resultData: {
                name: string;
                adjustedPrice: string;
                averagePrice: string;
                quantity: number;
                totalAdjustedPrice: string;
                totalAveragePrice: string;
            }[] = [];

            let currentTotalAdjustedPrice = 0;
            let currentTotalAveragePrice = 0;

            for (const { typeId, quantity } of typeIdsWithQuantities) {
                const price = prices.find((p) => p.type_id === typeId);
                if (price) {
                    const typeName = typeData[typeId]?.name.ru || typeData[typeId]?.name.en || "Unknown";
                    const adjustedPrice = price.adjusted_price;
                    const averagePrice = price.average_price;

                    const totalAdjusted = adjustedPrice * quantity;
                    const totalAverage = averagePrice * quantity;

                    resultData.push({
                        name: typeName,
                        adjustedPrice: formatNumber(adjustedPrice),
                        averagePrice: formatNumber(averagePrice),
                        quantity,
                        totalAdjustedPrice: formatNumber(totalAdjusted),
                        totalAveragePrice: formatNumber(totalAverage),
                    });

                    currentTotalAdjustedPrice += totalAdjusted;
                    currentTotalAveragePrice += totalAverage;
                }
            }

            setResults(resultData);
            setTotalAdjustedPrice(currentTotalAdjustedPrice);
            setTotalAveragePrice(currentTotalAveragePrice);
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
    const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === "next" && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleClearInput = () => {
        setInputValue("");
        setResults([]);
        setTotalAdjustedPrice(0);
        setTotalAveragePrice(0);
        setCurrentPage(1);
    };

    return (
        <div className="mx-auto p-4 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-slate-300">Проверка цен предметов EVE Online</h1>

            {/* <p className="mb-4 text-slate-300">Интерактивный поиск предметов по частичному совпадению еще в разработке, также планируется добавить подсчет предметов по типу и количеству.</p> */}

            <form onSubmit={(e) => e.preventDefault()}>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите названия предметов (по одному в строке)"
                    rows={5}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-800 text-slate-300"
                />
                {/* <Button onClick={handleCheckPrices} disabled={loading}>
                    {loading ? "Загрузка..." : "Проверить цены"}
                </Button> */}
                <div className="flex gap-4 mt-2 justify-center">
                    <Button
                        className="inline-flex gap-2 justify-center items-center w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
                        onClick={handleCheckPrices}
                    >
                        <CheckSquare className="mr-0" size={16} />
                        {loading ? "Загрузка..." : "Проверить цены"}
                    </Button>
                    <Button
                        className="inline-flex gap-2 justify-center items-center w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
                        onClick={handleClearInput}
                    >
                        <Trash2 className="mr-0" size={16} />
                        Очистить
                    </Button>
                </div>
            </form>

            {error && <div className="text-red-500 mt-2">{error}</div>}

            {/* {results.length > 0 && (
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="p-2">#</th>
                                <th className="p-2">Название</th>
                                <th className="p-2 hidden md:table-cell">Количество</th>
                                <th className="p-2 hidden md:table-cell">Базовая цена</th>
                                <th className="p-2 hidden md:table-cell">Средняя цена</th>
                                <th className="p-2">Итого (Базовая)</th>
                                <th className="p-2">Итого (Средняя)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((item, index) => (
                                <tr
                                    key={index}
                                    className="odd:bg-gray-800 even:bg-gray-900 text-white"
                                >
                                    <td className="p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2 hidden md:table-cell">{item.quantity}</td>
                                    <td className="p-2 hidden md:table-cell">{item.adjustedPrice}</td>
                                    <td className="p-2 hidden md:table-cell">{item.averagePrice}</td>
                                    <td className="p-2">{item.totalAdjustedPrice}</td>
                                    <td className="p-2">{item.totalAveragePrice}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-700 text-white">
                            <tr>
                                <td colSpan={5} className="p-2 text-right">
                                    Итого:
                                </td>
                                <td className="p-2">{formatNumber(totalAdjustedPrice)}</td>
                                <td className="p-2">{formatNumber(totalAveragePrice)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )} */}

            {results.length > 0 && (
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-700 text-white">
                            <tr>
                                <th className="p-2 text-center">#</th>
                                <th className="p-2 text-center">Название</th>
                                <th className="p-2 text-center hidden md:table-cell">Количество</th>
                                <th className="p-2 text-center hidden md:table-cell">Базовая цена</th>
                                <th className="p-2 text-center hidden md:table-cell">Средняя цена</th>
                                <th className="p-2 text-center">Итого (Базовая)</th>
                                <th className="p-2 text-center">Итого (Средняя)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((item, index) => (
                                <tr key={index} className="odd:bg-gray-800 even:bg-gray-900 text-white">
                                    <td className="p-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="p-2 text-center">{item.name}</td>
                                    <td className="p-2 text-center hidden md:table-cell">{item.quantity}</td>
                                    <td className="p-2 text-center hidden md:table-cell">{item.adjustedPrice}</td>
                                    <td className="p-2 text-center hidden md:table-cell">{item.averagePrice}</td>
                                    <td className="p-2 text-center">{item.totalAdjustedPrice}</td>
                                    <td className="p-2 text-center">{item.totalAveragePrice}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-700 text-white">
                            <tr>
                                <td className="p-2 "></td>
                                <td className="p-2 hidden md:table-cell"></td>
                                <td className="p-2 hidden md:table-cell"></td>
                                <td className="p-2 hidden md:table-cell"></td>
                                <td className="p-2 text-right font-bold">Итого:</td>
                                <td className="p-2 text-center font-bold">{formatNumber(totalAdjustedPrice)}</td>
                                <td className="p-2 text-center font-bold">{formatNumber(totalAveragePrice)}</td>
                            </tr>
                        </tfoot>



                    </table>
                </div>
            )}


            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Button
                        onClick={() => handlePageChange("prev")}
                        disabled={currentPage === 1}
                        className="mr-2 bg-slate-800 hover:bg-slate-700 text-white"
                    >
                        Назад
                    </Button>
                    <span className="mx-2 text-gray-300">Страница {currentPage} из {totalPages}</span>
                    <Button
                        onClick={() => handlePageChange("next")}
                        disabled={currentPage === totalPages}
                        className="ml-2 bg-slate-800 hover:bg-slate-700 text-white"
                    >
                        Вперед
                    </Button>
                </div>
            )}

            <div className="text-slate-300 mt-8">
                <p>Инструкция по оценке предметов в EVE Online:</p>
                <p className="text-slate-300">Введите названия предметов (по одному в строке), будет отображена цена предметов которые вы хотите проверить.</p>
                <p className="text-slate-300">Необходимо вводить точное название предмета, например Tritanium или Cobalt.</p>
                <p className="mb-4 text-slate-300">Вы также можете скопировать все предметы в ангаре Ctrl+A(выделить) Ctrl+C(копировать) и Ctrl+V(вставить) в поле. На MacBook Command+A(выделить) Command+C(копировать) и Command+V вставить в поле.</p>
            </div>


        </div>
    );
};

export default ItemPriceChecker;
