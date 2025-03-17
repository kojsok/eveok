
import CopyLinkButton from "@/components/CopyLinkButton";
import { getFromDatabase } from "@/lib/db";
import shipsAndGroupsData from "@/data/ShipsAndGroups.json"; // Импортируем файл ShipsAndGroups.json
import { Copy } from "lucide-react";
import Link from 'next/link'

// Интерфейсы для типизации данных
// interface ShipResult {
//   name: string;
//   count: number;
// }

interface GroupResult {
  groupName: string;
  count: number;
}

// Компонент страницы
export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>; // Параметры маршрута как промис
}) {
  // Дождитесь получения параметров маршрута
  const { id } = await params;

  // Получите данные из базы данных
  const results = await getFromDatabase(id);

  if (!results || results.length === 0) {
    return (
      <div className="p-4 bg-slate-900 text-center text-red-500 mt-8">
        Результаты не найдены
      </div>
    );
  }

  // Вычисляем общее количество кораблей
  const totalShips = results.reduce((sum, result) => sum + result.count, 0);

  // Функция для получения groupName по имени корабля из ShipsAndGroups.json
  const getGroupNameByShipName = (shipName: string): string | undefined => {
    const shipData = shipsAndGroupsData.find((item) => item.shipName === shipName);
    return shipData?.groupName;
  };

  // Подсчет количества кораблей в каждой группе
  const groupCounts: { [key: string]: number } = {};
  for (const result of results) {
    const groupName = getGroupNameByShipName(result.name);
    if (groupName) {
      groupCounts[groupName] = (groupCounts[groupName] || 0) + result.count;
    }
  }

  // Формируем массив результатов групп
  const groups: GroupResult[] = Object.entries(groupCounts)
    .map(([groupName, count]): GroupResult => ({ groupName, count }))
    .sort((a, b) => b.count - a.count); // Сортировка по убыванию

  // Генерация текущей URL-адрес страницы
  const relativeUrl = `/dscan/result/${id}`;



  return (
    <div className="p-4 bg-slate-900 text-slate-300 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      {/* Кнопка "Поделиться ссылкой" */}
      <div className="flex justify-center mt-6 gap-6">
        <CopyLinkButton url={relativeUrl} />

        <Link
          href="/dscan/"
          className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-3 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
        >
          <Copy className="h-4 w-4" />
          Просканировать
        </Link>
      </div>




      {/* Общее количество кораблей */}
      <p className="mt-4 text-2xl font-semibold text-center">
        Всего кораблей:{" "}
        <span className="text-yellow-400">{totalShips}</span>
      </p>

      {/* Две колонки: Корабли и Группы */}
      {(results.length > 0 || groups.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Колонка Корабли */}
          <div className="flex flex-col items-center max-w-[300px] mx-auto">
            <h2 className="text-xl font-bold mb-2 text-center">Корабли:</h2>
            <div className="flex flex-col items-end">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 w-96 px-4 py-1 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
                  >
                    <h3 className="text-base font-semibold text-slate-300">{result.name}</h3>
                    <span className="text-base font-bold text-yellow-400 bg-slate-900 px-4 py-2 rounded-md">
                      {result.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* Колонка Группы */}
          <div className="flex flex-col items-center max-w-[300px] mx-auto">
            <h2 className="text-xl font-bold mb-2 text-center item-center">Группы:</h2>
            <div className="flex flex-col items-start">

              <div className="space-y-2">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 w-96 px-4 py-1 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
                  >
                    <h3 className="text-base font-semibold text-slate-300">{group.groupName}</h3>
                    <span className="text-base font-bold text-yellow-400 bg-slate-900 px-4 py-2 rounded-md">
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
}




//!все круто выводит группы но без колонок
// import CopyLinkButton from "@/components/CopyLinkButton";
// import { getFromDatabase } from "@/lib/db";
// import shipsAndGroupsData from "@/data/ShipsAndGroups.json"; // Импортируем файл ShipsAndGroups.json

// // Интерфейсы для типизации данных
// interface ShipResult {
//   name: string;
//   count: number;
// }

// interface GroupResult {
//   groupName: string;
//   count: number;
// }

// // Компонент страницы
// export default async function ResultPage({
//   params,
// }: {
//   params: Promise<{ id: string }>; // Параметры маршрута как промис
// }) {
//   // Дождитесь получения параметров маршрута
//   const { id } = await params;

//   // Получите данные из базы данных
//   const results = await getFromDatabase(id);

//   if (!results || results.length === 0) {
//     return (
//       <div className="p-4 bg-slate-900 text-center text-red-500 mt-8">
//         Результаты не найдены
//       </div>
//     );
//   }

//   // Вычисляем общее количество кораблей
//   const totalShips = results.reduce((sum, result) => sum + result.count, 0);

//   // Функция для получения groupName по имени корабля из ShipsAndGroups.json
//   const getGroupNameByShipName = (shipName: string): string | undefined => {
//     const shipData = shipsAndGroupsData.find((item) => item.shipName === shipName);
//     return shipData?.groupName;
//   };

//   // Подсчет количества кораблей в каждой группе
//   const groupCounts: { [key: string]: number } = {};
//   for (const result of results) {
//     const groupName = getGroupNameByShipName(result.name);
//     if (groupName) {
//       groupCounts[groupName] = (groupCounts[groupName] || 0) + result.count;
//     }
//   }

//   // Формируем массив результатов групп
//   const groups: GroupResult[] = Object.entries(groupCounts)
//     .map(([groupName, count]): GroupResult => ({ groupName, count }))
//     .sort((a, b) => b.count - a.count); // Сортировка по убыванию

//   // Генерация текущей URL-адрес страницы
//   const relativeUrl = `/dscan/result/${id}`;

//   return (
//     <div className="p-4 bg-slate-900 text-slate-300 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
//       {/* Кнопка "Поделиться ссылкой" */}
//       <div className="flex justify-center mt-6">
//         <CopyLinkButton url={relativeUrl} />
//       </div>

//       {/* Общее количество кораблей */}
//       <p className="mt-4 text-2xl font-semibold text-center">
//         Всего кораблей:{" "}
//         <span className="text-yellow-400">{totalShips}</span>
//       </p>

//       {/* Вывод карточек с кораблями */}
//       <div className="max-w-2xl mx-auto mt-6">
//         <h2 className="text-xl font-bold mb-2 text-center">Корабли:</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
//           {results.map((result: ShipResult, index: number) => (
//             <div
//               key={index}
//               className="bg-slate-800 px-4 py-2 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
//             >
//               {/* Название корабля */}
//               <h3 className="text-center text-lg font-semibold text-slate-300">{result.name}</h3>
//               {/* Количество кораблей */}
//               <span className="text-lg font-bold text-yellow-400 bg-slate-900 px-4 py-2 rounded-md">
//                 {result.count}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Вывод групп */}
//       {groups.length > 0 && (
//         <div className="max-w-2xl mx-auto mt-6">
//           <h2 className="text-xl font-bold mb-2 text-center">Группы:</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
//             {groups.map((group: GroupResult, index: number) => (
//               <div
//                 key={index}
//                 className="bg-slate-800 px-4 py-2 rounded-lg shadow-md flex items-center justify-between transition-colors duration-300 hover:bg-gray-500"
//               >
//                 {/* Название группы */}
//                 <h3 className="text-center text-lg font-semibold text-slate-300">{group.groupName}</h3>
//                 {/* Количество кораблей в группе */}
//                 <span className="text-lg font-bold text-yellow-400 bg-slate-900 px-4 py-2 rounded-md">
//                   {group.count}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


//!работает не трогать вообще
// import CopyLinkButton from "@/components/CopyLinkButton";
// import { getFromDatabase } from "@/lib/db";

// // Компонент страницы
// export default async function ResultPage({
//   params,
// }: {
//   params: Promise<{ id: string }>; // Параметры маршрута как промис
// }) {
//   // Дождитесь получения параметров маршрута
//   const { id } = await params;

//   // Получите данные из базы данных
//   const results = await getFromDatabase(id);

//   if (!results || results.length === 0) {
//     return (
//       <div className="p-4 bg-slate-900 text-center text-red-500 mt-8">
//         Результаты не найдены
//       </div>
//     );
//   }

//   // Вычисляем общее количество кораблей
//   const totalShips = results.reduce((sum, result) => sum + result.count, 0);

//   // Генерация текущей URL-адрес страницы
//   // const currentUrl = `${window.location.origin}/result/${id}`;
//   // Передаем только относительный путь
//   // const relativeUrl = `/result/${id}`;
//    // Передаем только относительный путь
//    const relativeUrl = `/dscan/result/${id}`;

//   return (
//     <div className="p-4 bg-slate-900 text-slate-300  bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg ">
//       {/* <h1 className="text-2xl font-bold mb-4 text-center">Результаты D-Scan</h1> */}

//       {/* Кнопка "Поделиться ссылкой" */}
//       <div className="flex justify-center mt-6">
//         <CopyLinkButton url={relativeUrl} />
//       </div>

//       {/* Общее количество кораблей */}
//       <p className="mt-4 text-2xl font-semibold text-center">
//         Всего кораблей:{" "}
//         <span className="text-yellow-400">{totalShips}</span>
//       </p>

//       {/* Вывод карточек с кораблями */}
//       <div className="max-w-2xl mx-auto mt-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
//           {results.map((result: { name: string; count: number }, index: number) => (
//             <div
//               key={index}
//               className="bg-slate-800 px-4 py-2 rounded-lg shadow-md flex  items-center justify-between transition-colors duration-300 hover:bg-gray-500"
//             >
//               {/* Название корабля */}
//               <h3 className="text-center text-lg font-semibold text-slate-300">{result.name}</h3>
//               {/* Количество кораблей */}
//               <span className="text-lg font-bold text-yellow-400 bg-slate-900 px-4 py-2 rounded-md">
//                 {result.count}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

//!работает не трогать
// import { getFromDatabase } from "@/lib/db";

// // Компонент страницы
// const ResultPage = async ({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) => {
//   // Дождитесь получения параметров маршрута
//   const { id } = await params;

//   // Получите данные из базы данных
//   const results = await getFromDatabase(id);

//   if (!results) {
//     return <div className="text-center text-red-500 mt-8">Результаты не найдены</div>;
// }

//   return (
//     // <div>
//     //   <h1>Результаты D-Scan</h1>
//     //   <ul>
//     //     {results.map((result: { name: string; count: number }, index: number) => (
//     //       <li key={index}>
//     //         <strong>{result.name}</strong>: {result.count}
//     //       </li>
//     //     ))}
//     //   </ul>
//     // </div>

//     <div className="p-4 bg-slate-900 text-slate-300">
//             <h1 className="text-2xl font-bold mb-4">Результаты D-Scan</h1>

//             {/* Вывод карточек с кораблями */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {results.map((result: { name: string; count: number }, index: number) => (
//                     <div
//                         key={index}
//                         className="bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
//                     >
//                         {/* Название корабля */}
//                         <h3 className="text-lg font-semibold text-slate-300">{result.name}</h3>
//                         {/* Количество кораблей */}
//                         <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
//                             {result.count}
//                         </span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//   );
// };

// export default ResultPage;

