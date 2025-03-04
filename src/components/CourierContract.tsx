"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Copy } from "lucide-react"; // Импортируем иконки


// Функция для форматирования чисел с разделением тысяч пробелом
const formatNumber = (num: string): string => {
    const number = num.replace(/\D/g, ""); // Удаляем все нецифровые символы
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const parseNumber = (formatted: string): number => {
    return parseFloat(formatted.replace(/\s/g, "")) || 0;
};

// Массив станций с указанием удаленности от Amarr
const stations = [
    { name: "Amarr VIII (Oris) - Emperor Family Academy", distanceFromAmarr: 0 },
    { name: "Huola VI - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
    { name: "Kamela V - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
    { name: "Turnur II - Moon 5 - Republic Security Services Assembly Plant", distanceFromAmarr: 2 },
    { name: "XHQ-7V - Astrahus - Curatores Veritatis Alliance", distanceFromAmarr: 3 },
    { name: "ERVK-P - Keepstar - Red Alliance", distanceFromAmarr: 3 },
    // ... добавьте остальные станции
];

const CourierContract: React.FC = () => {
    const [loadingStation, setLoadingStation] = useState<string>("");
    const [destinationStation, setDestinationStation] = useState<string>("");
    const [volume, setVolume] = useState<string>(""); // Строка для форматирования
    const [collateral, setCollateral] = useState<string>(""); // Строка для форматирования
    const [totalCost, setTotalCost] = useState<number>(0); // Стоимость доставки
    const [currentRate, setCurrentRate] = useState<number>(0); // Текущий тариф

    // Функция для получения информации о станции по имени
    const getStationInfo = (name: string): { name: string; distanceFromAmarr: number } | undefined => {
        return stations.find((station) => station.name === name);
    };

    // Функция для расчета тарифа в зависимости от удаленности
    const calculateRate = (loadingStationName: string, destinationStationName: string): number => {
        const loadingStationInfo = getStationInfo(loadingStationName);
        const destinationStationInfo = getStationInfo(destinationStationName);

        if (!loadingStationInfo || !destinationStationInfo) return 1700;

        const loadingDistance = loadingStationInfo.distanceFromAmarr;
        const destinationDistance = destinationStationInfo.distanceFromAmarr;

        if (
            (loadingDistance <= 1 && destinationDistance <= 1) ||
            Math.abs(loadingDistance - destinationDistance) <= 1
        ) {
            return 1500;
        }

        return 1700;
    };

    // Функция для расчета стоимости доставки
    const calculateCost = () => {
        if (!loadingStation || !destinationStation) {
            setTotalCost(0);
            setCurrentRate(0);
            return;
        }

        const rate = calculateRate(loadingStation, destinationStation);
        setCurrentRate(rate);
        const cost = parseNumber(volume) * rate + parseNumber(collateral) * 0.01;
        setTotalCost(cost);
    };

    // Функция для очистки полей формы
    const handleClear = () => {
        setLoadingStation("");
        setDestinationStation("");
        setVolume("");
        setCollateral("");
        setTotalCost(0);
        setCurrentRate(0);
    };

    //   // Функция для удаления всех данных
    //   const handleDeleteAll = () => {
    //     handleClear();
    //   };

    // Функция для копирования стоимости доставки в буфер обмена
    const handleCopy = () => {
        if (totalCost > 0) {
            navigator.clipboard.writeText(`${formatNumber(totalCost.toString())} ISK`);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8 p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
            <h1 className="text-2xl font-bold">EVE-OK LOGISTIC</h1>

            {/* Form Section */}
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
                <Label className="text-slate-300 text-xl">Станция погрузки</Label>
                <Select value={loadingStation} onValueChange={(value) => {
                    setLoadingStation(value);
                    calculateCost();
                }}>
                    <SelectTrigger className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
                        <SelectValue placeholder="Выберите станцию" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-300">
                        {stations.map((station) => (
                            <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
                                {station.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Label className="text-slate-300 text-xl">Станция назначения</Label>
                <Select value={destinationStation} onValueChange={(value) => {
                    setDestinationStation(value);
                    calculateCost();
                }}>
                    <SelectTrigger className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
                        <SelectValue placeholder="Выберите станцию" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-300">
                        {stations.map((station) => (
                            <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
                                {station.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Отображение текущего тарифа */}
                <Label className="text-slate-300 text-xl flex items-center justify-center">
                    Текущий тариф: {" "}
                    <span className="text-[#4F97FF] text-xl font-semibold">
                        {currentRate ? `${formatNumber(currentRate.toString())} ISK за м³` : "Не выбран"}
                    </span>
                </Label>

                {/* Inputs Section */}
                <div className="space-y-4 w-full max-w-sm">
                    <div>
                        <Label className="text-slate-300">Объем м³ (не более 250 000 м³)</Label>
                        <Input
                            type="text"
                            value={volume}
                            onChange={(e) => setVolume(formatNumber(e.target.value))}
                            placeholder="Введите объем"
                            className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
                        />
                    </div>

                    <div>
                        <Label className="text-slate-300">Залог (будет включено 10% от стоимости залога)</Label>
                        <Input
                            type="text"
                            value={collateral}
                            onChange={(e) => setCollateral(formatNumber(e.target.value))}
                            placeholder="Введите залог"
                            className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
                        />
                    </div>

                    <div>
                        <Label className="text-slate-300">Итоговая стоимость доставки</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Поле "Стоимость доставки" */}
                        {/* <Label className="text-slate-300">Итоговая стоиомсть доставки</Label> */}
                        <Input
                            type="text"
                            value={formatNumber(totalCost.toString())}
                            readOnly
                            placeholder="Стоимость рассчитается автоматически"
                            className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
                        />

                        {/* Кнопка "копировать" */}
                        <Button onClick={handleCopy} variant="outline" size="icon" className="inline-flex px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Buttons Section */}
                <div className="flex justify-center gap-4">
                    <Button onClick={calculateCost} className="inline-flex gap-2 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
                        Рассчитать стоимость
                    </Button>
                    <Button variant="outline" onClick={handleClear} className="inline-flex px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
                        <Trash2 size={16} /> {/* Иконка "Очистить" */}
                    </Button>

                </div>
            </div>

            {/* Statistics Table */}
            <Table className="w-1/2 mx-auto text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
                <TableHeader>
                    <TableRow>
                        <TableHead className="bg-slate-700 text-slate-300 text-center">Статус</TableHead>
                        <TableHead className="bg-slate-700 text-slate-300 text-center">Количество контрактов</TableHead>
                        <TableHead className="bg-slate-700 text-slate-300 text-center">Объем м³</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="text-center">Законченные</TableCell>
                        <TableCell className="text-center">{formatNumber("56")}</TableCell>
                        <TableCell className="text-center">{formatNumber("11 200 000")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-center">Выполняется</TableCell>
                        <TableCell className="text-center">{formatNumber("2")}</TableCell>
                        <TableCell className="text-center">{formatNumber("430050")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-center">Ожидают</TableCell>
                        <TableCell className="text-center">{formatNumber("4")}</TableCell>
                        <TableCell className="text-center">{formatNumber("244146")}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};



export default CourierContract;

// "use client"
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { RefreshCw, Trash2 } from "lucide-react"; // Импортируем иконки

// // Функция для форматирования чисел с разделением тысяч пробелом
// const formatNumber = (num: string): string => {
//   const number = num.replace(/\D/g, ""); // Удаляем все нецифровые символы
//   return number.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
// };

// const parseNumber = (formatted: string): number => {
//   return parseFloat(formatted.replace(/\s/g, "")) || 0;
// };

// // Массив станций с указанием удаленности от Amarr
// const stations = [
//   { name: "Amarr VIII (Oris) - Emperor Family Academy", distanceFromAmarr: 0 },
//   { name: "Huola VI - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
//   { name: "Kamela V - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
//   { name: "Turnur II - Moon 5 - Republic Security Services Assembly Plant", distanceFromAmarr: 2 },
//   { name: "XHQ-7V - Astrahus - Curatores Veritatis Alliance", distanceFromAmarr: 3 },
//   { name: "ERVK-P - Keepstar - Red Alliance", distanceFromAmarr: 3 },
//   // ... добавьте остальные станции
// ];

// const CourierContract: React.FC = () => {
//   const [loadingStation, setLoadingStation] = useState<string>("");
//   const [destinationStation, setDestinationStation] = useState<string>("");
//   const [volume, setVolume] = useState<string>(""); // Строка для форматирования
//   const [collateral, setCollateral] = useState<string>(""); // Строка для форматирования
//   const [totalCost, setTotalCost] = useState<number>(0); // Стоимость доставки
//   const [currentRate, setCurrentRate] = useState<number>(0); // Текущий тариф

//   // Функция для получения информации о станции по имени
//   const getStationInfo = (name: string): { name: string; distanceFromAmarr: number } | undefined => {
//     return stations.find((station) => station.name === name);
//   };

//   // Функция для расчета тарифа в зависимости от удаленности
//   const calculateRate = (loadingStationName: string, destinationStationName: string): number => {
//     const loadingStationInfo = getStationInfo(loadingStationName);
//     const destinationStationInfo = getStationInfo(destinationStationName);

//     if (!loadingStationInfo || !destinationStationInfo) return 1700;

//     const loadingDistance = loadingStationInfo.distanceFromAmarr;
//     const destinationDistance = destinationStationInfo.distanceFromAmarr;

//     if (
//       (loadingDistance <= 1 && destinationDistance <= 1) ||
//       Math.abs(loadingDistance - destinationDistance) <= 1
//     ) {
//       return 1500;
//     }

//     return 1700;
//   };

//   // Функция для расчета стоимости доставки
//   const calculateCost = () => {
//     if (!loadingStation || !destinationStation) {
//       setTotalCost(0);
//       setCurrentRate(0);
//       return;
//     }

//     const rate = calculateRate(loadingStation, destinationStation);
//     setCurrentRate(rate);
//     const cost = parseNumber(volume) * rate + parseNumber(collateral) * 0.01;
//     setTotalCost(cost);
//   };

//   // Функция для очистки полей формы
//   const handleClear = () => {
//     setLoadingStation("");
//     setDestinationStation("");
//     setVolume("");
//     setCollateral("");
//     setTotalCost(0);
//     setCurrentRate(0);
//   };

//   // Функция для удаления всех данных
//   const handleDeleteAll = () => {
//     handleClear();
//   };

//   return (
//     <div className="space-y-8 p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold text-center">MOONFIRE Service Provider</h1>

//       {/* Form Section */}
//       <div className="space-y-4">
//         <Label className="text-slate-300">Станция погрузки</Label>
//         <Select value={loadingStation} onValueChange={(value) => {
//           setLoadingStation(value);
//           calculateCost();
//         }}>
//           <SelectTrigger className="w-96 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//             <SelectValue placeholder="Выберите станцию" />
//           </SelectTrigger>
//           <SelectContent className="bg-slate-800 text-slate-300">
//             {stations.map((station) => (
//               <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
//                 {station.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Label className="text-slate-300">Станция назначения</Label>
//         <Select value={destinationStation} onValueChange={(value) => {
//           setDestinationStation(value);
//           calculateCost();
//         }}>
//           <SelectTrigger className="w-96 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//             <SelectValue placeholder="Выберите станцию" />
//           </SelectTrigger>
//           <SelectContent className="bg-slate-800 text-slate-300">
//             {stations.map((station) => (
//               <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
//                 {station.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Отображение текущего тарифа */}
//         <Label className="text-slate-300">
//           Текущий тариф: {currentRate ? `${formatNumber(currentRate.toString())} ISK за м³` : "Не выбран"}
//         </Label>

//         {/* Inputs Section */}
//         <div className="space-y-4">
//           <div>
//             <Label className="text-slate-300">Объем м³</Label>
//             <Input
//               type="text"
//               value={volume}
//               onChange={(e) => setVolume(formatNumber(e.target.value))}
//               placeholder="Введите объем"
//               className="w-96 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
//             />
//           </div>

//           <div>
//             <Label className="text-slate-300">Залог</Label>
//             <Input
//               type="text"
//               value={collateral}
//               onChange={(e) => setCollateral(formatNumber(e.target.value))}
//               placeholder="Введите залог"
//               className="w-96 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
//             />
//           </div>

//           <div>
//             <Label className="text-slate-300">Стоимость доставки</Label>
//             <Input value={`${formatNumber(totalCost.toString())} ISK`} readOnly className="w-96 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md" />
//           </div>
//         </div>

//         {/* Buttons Section */}
//         <div className="flex justify-center gap-4">
//           <Button onClick={calculateCost} className="inline-flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             Рассчитать стоимость
//           </Button>
//           <Button variant="outline" onClick={handleClear} className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             <RefreshCw size={16} /> {/* Иконка "Очистить" */}
//           </Button>
//           <Button variant="destructive" onClick={handleDeleteAll} className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             <Trash2 size={16} /> {/* Иконка "Удалить все" */}
//           </Button>
//         </div>
//       </div>

//       {/* Statistics Table */}
//       <Table className="w-1/2 mx-auto text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//         <TableHeader>
//           <TableRow>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Статус</TableHead>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Количество контрактов</TableHead>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Объем м³</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           <TableRow>
//             <TableCell className="text-center">Законченные</TableCell>
//             <TableCell className="text-center">{formatNumber("51506")}</TableCell>
//             <TableCell className="text-center">{formatNumber("3844897682")}</TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell className="text-center">Выполняется</TableCell>
//             <TableCell className="text-center">{formatNumber("118")}</TableCell>
//             <TableCell className="text-center">{formatNumber("6637582")}</TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell className="text-center">Ожидают</TableCell>
//             <TableCell className="text-center">{formatNumber("4")}</TableCell>
//             <TableCell className="text-center">{formatNumber("144146")}</TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default CourierContract;

// "use client"
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { RefreshCw, Trash2 } from "lucide-react"; // Импортируем иконки

// // Функция для форматирования чисел с разделением тысяч пробелом
// const formatNumber = (num: string): string => {
//   const number = num.replace(/\D/g, ""); // Удаляем все нецифровые символы
//   return number.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
// };

// const parseNumber = (formatted: string): number => {
//   return parseFloat(formatted.replace(/\s/g, "")) || 0;
// };

// // Массив станций с указанием удаленности от Amarr
// const stations = [
//   { name: "Amarr VIII (Oris) - Emperor Family Academy", distanceFromAmarr: 0 },
//   { name: "Huola VI - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
//   { name: "Kamela V - 24th Imperial Crusade Logistic Support", distanceFromAmarr: 1 },
//   { name: "Turnur II - Moon 5 - Republic Security Services Assembly Plant", distanceFromAmarr: 2 },
//   { name: "XHQ-7V - Astrahus - Curatores Veritatis Alliance", distanceFromAmarr: 3 },
//   { name: "ERVK-P - Keepstar - Red Alliance", distanceFromAmarr: 3 },
//   // ... добавьте остальные станции
// ];

// const CourierContract: React.FC = () => {
//   const [loadingStation, setLoadingStation] = useState<string>("");
//   const [destinationStation, setDestinationStation] = useState<string>("");
//   const [volume, setVolume] = useState<string>(""); // Строка для форматирования
//   const [collateral, setCollateral] = useState<string>(""); // Строка для форматирования
//   const [totalCost, setTotalCost] = useState<number>(0); // Стоимость доставки
//   const [currentRate, setCurrentRate] = useState<number>(0); // Текущий тариф

//   // Функция для получения информации о станции по имени
//   const getStationInfo = (name: string): { name: string; distanceFromAmarr: number } | undefined => {
//     return stations.find((station) => station.name === name);
//   };

//   // Функция для расчета тарифа в зависимости от удаленности
//   const calculateRate = (loadingStationName: string, destinationStationName: string): number => {
//     const loadingStationInfo = getStationInfo(loadingStationName);
//     const destinationStationInfo = getStationInfo(destinationStationName);

//     if (!loadingStationInfo || !destinationStationInfo) return 1700;

//     // Получаем удалённость станций
//     const loadingDistance = loadingStationInfo.distanceFromAmarr;
//     const destinationDistance = destinationStationInfo.distanceFromAmarr;

//     // Если обе станции находятся на расстоянии 0 или 1 от Amarr, или их разница ≤ 1, тариф 1500
//     if (
//       (loadingDistance <= 1 && destinationDistance <= 1) || // Обе станции близко к Amarr
//       Math.abs(loadingDistance - destinationDistance) <= 1   // Разница между удаленностью ≤ 1
//     ) {
//       return 1500;
//     }

//     // Для всех остальных случаев тариф 1700
//     return 1700;
//   };

//   // Функция для расчета стоимости доставки
//   const calculateCost = () => {
//     if (!loadingStation || !destinationStation) {
//       setTotalCost(0); // Если станции не выбраны, стоимость равна 0
//       setCurrentRate(0); // Тариф также сбрасываем
//       return;
//     }

//     const rate = calculateRate(loadingStation, destinationStation); // Определяем тариф
//     setCurrentRate(rate); // Сохраняем текущий тариф
//     const cost = parseNumber(volume) * rate + parseNumber(collateral) * 0.01;
//     setTotalCost(cost);
//   };

//   // Функция для очистки полей формы
//   const handleClear = () => {
//     setLoadingStation("");
//     setDestinationStation("");
//     setVolume("");
//     setCollateral("");
//     setTotalCost(0);
//     setCurrentRate(0); // Сброс тарифа
//   };

//   // Функция для удаления всех данных (включая статистику контрактов)
//   const handleDeleteAll = () => {
//     handleClear(); // Очищаем форму
//     // Здесь можно добавить логику для очистки других данных (например, статистики)
//   };

//   return (
//     <div className="space-y-8 p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       <h1 className="text-2xl font-bold text-center">MOONFIRE Service Provider</h1>

//       {/* Form Section */}
//       <div className="space-y-4">
//         <Label className="text-slate-300">Станция погрузки</Label>
//         <Select value={loadingStation} onValueChange={(value) => {
//           setLoadingStation(value);
//           calculateCost(); // Пересчитываем стоимость при выборе станции погрузки
//         }}>
//           <SelectTrigger className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//             <SelectValue placeholder="Выберите станцию" />
//           </SelectTrigger>
//           <SelectContent className="bg-slate-800 text-slate-300">
//             {stations.map((station) => (
//               <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
//                 {station.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Label className="text-slate-300">Станция назначения</Label>
//         <Select value={destinationStation} onValueChange={(value) => {
//           setDestinationStation(value);
//           calculateCost(); // Пересчитываем стоимость при выборе станции назначения
//         }}>
//           <SelectTrigger className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//             <SelectValue placeholder="Выберите станцию" />
//           </SelectTrigger>
//           <SelectContent className="bg-slate-800 text-slate-300">
//             {stations.map((station) => (
//               <SelectItem key={station.name} value={station.name} className="text-slate-300 hover:bg-slate-700">
//                 {station.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Отображение текущего тарифа */}
//         <Label className="text-slate-300">
//           Текущий тариф: {currentRate ? `${formatNumber(currentRate.toString())} ISK за м³` : "Не выбран"}
//         </Label>

//         <div className="flex gap-4">
//           <div className="w-1/3">
//             <Label className="text-slate-300">Объем м³</Label>
//             <Input
//               type="text"
//               value={volume}
//               onChange={(e) => setVolume(formatNumber(e.target.value))}
//               placeholder="Введите объем"
//               className="w-48 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
//             />
//           </div>

//           <div className="w-1/3">
//             <Label className="text-slate-300">Залог</Label>
//             <Input
//               type="text"
//               value={collateral}
//               onChange={(e) => setCollateral(formatNumber(e.target.value))}
//               placeholder="Введите залог"
//               className="w-48 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md"
//             />
//           </div>

//           <div className="w-1/3">
//             <Label className="text-slate-300">Стоимость доставки</Label>
//             <Input value={`${formatNumber(totalCost.toString())} ISK`} readOnly className="w-48 text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md" />
//           </div>
//         </div>

//         {/* Buttons Section */}
//         <div className="flex justify-center gap-4">
//           <Button onClick={calculateCost} className="inline-flex gap-2 justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             Рассчитать стоимость
//           </Button>
//           <Button variant="outline" onClick={handleClear} className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             <RefreshCw size={16} /> {/* Иконка "Очистить" */}
//           </Button>
//           <Button variant="destructive" onClick={handleDeleteAll} className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
//             <Trash2 size={16} /> {/* Иконка "Удалить все" */}
//           </Button>
//         </div>
//       </div>

//       {/* Statistics Table */}
//       <Table className="w-1/2 mx-auto text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md">
//         <TableHeader>
//           <TableRow>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Статус</TableHead>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Количество контрактов</TableHead>
//             <TableHead className="bg-slate-700 text-slate-300 text-center">Объем м³</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           <TableRow>
//             <TableCell className="text-center">Законченные</TableCell>
//             <TableCell className="text-center">{formatNumber("51506")}</TableCell>
//             <TableCell className="text-center">{formatNumber("3844897682")}</TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell className="text-center">Выполняется</TableCell>
//             <TableCell className="text-center">{formatNumber("118")}</TableCell>
//             <TableCell className="text-center">{formatNumber("6637582")}</TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell className="text-center">Ожидают</TableCell>
//             <TableCell className="text-center">{formatNumber("4")}</TableCell>
//             <TableCell className="text-center">{formatNumber("144146")}</TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default CourierContract;

