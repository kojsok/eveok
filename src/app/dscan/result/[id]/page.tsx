import { getFromDatabase } from "@/lib/db";

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

  return (
    <div className="p-4 bg-slate-900 text-slate-300">
      <h1 className="text-2xl font-bold mb-4">Результаты D-Scan</h1>

      {/* Общее количество кораблей */}
      <p className="mt-4 text-lg font-semibold">
        Всего кораблей:{" "}
        <span className="text-yellow-400">{totalShips}</span>
      </p>

      {/* Вывод карточек с кораблями */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
        {results.map((result: { name: string; count: number }, index: number) => (
          <div
            key={index}
            className="bg-slate-800 p-1 rounded-lg shadow-md flex items-center justify-between w-full transition-colors duration-300 hover:bg-gray-500"
          >
            {/* Название корабля */}
            <h3 className="ml-4 text-lg font-semibold text-slate-300">{result.name}</h3>
            {/* Количество кораблей */}
            <span className="text-2xl font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded-md">
              {result.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

