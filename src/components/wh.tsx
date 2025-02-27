"use client";
import Link from "next/link";
import typesNew from "../data/typesnew.json";

// Определяем интерфейс для типа данных из typesNew.json
interface Type {
  id: number;
  name: {
    en: string; // Предполагаем, что имя всегда на английском
  };
}

// Преобразуем данные из typesNew в удобный объект
const wormholeNamesById: { [key: string]: string } = {};
const wormholeDataById: { [key: string]: string } = {};

Object.values(typesNew).forEach((type: Type) => {
  const match = type.name.en.match(/^Wormhole (\w{4})$/);
  if (match) {
    const code = match[1];
    wormholeNamesById[code] = type.id.toString(); // Сохраняем ID червоточины
    wormholeDataById[type.id.toString()] = code; // Для обратного преобразования, если нужно
  }
});

// Исходные данные о категориях червоточин
const wormholeData = [
  { category: "c1", c1: "H121", c2: "C125", c3: "O883", c4: "M609", c5: "L614", c6: "S804", hs: "N110", ls: "J244", ns: "Z060", thera: "F353" },
  { category: "c2", c1: "Z647", c2: "D382", c3: "O477", c4: "Y683", c5: "N062", c6: "R474", hs: "B274", ls: "A239", ns: "E545", thera: "F135" },
  { category: "c3", c1: "V301", c2: "I182", c3: "N968", c4: "T405", c5: "N770", c6: "A982", hs: "D845", ls: "U210", ns: "K346", thera: "F135" },
  { category: "c4", c1: "P060", c2: "N766", c3: "C247", c4: "X877", c5: "H900", c6: "U574", hs: "S047", ls: "N290", ns: "K329" },
  { category: "c5", c1: "Y790", c2: "D364", c3: "M267", c4: "E175", c5: "H296", c6: "V753", hs: "D792", ls: "C140", ns: "Z142" },
  { category: "c6", c1: "Q317", c2: "G024", c3: "L477", c4: "Z457", c5: "V911", c6: "W237", hs: "B520 D792", ls: "C140 C391", ns: "C248 Z142" },
  { category: "hs", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "M555", c6: "B041", hs: "A641", ls: "R051", ns: "V283", thera: "T458" },
  { category: "ls", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "M164" },
  { category: "ns", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "L031" },
  { category: "thera", c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", hs: "Q063", ls: "V898", ns: "E587" },
  { category: "?", c1: "E004", c2: "L005", c3: "Z006", c4: "M001", c5: "C008", c6: "G008", hs: "Q003", ls: "A009", ns: "S877", thera: "B735" },
];

// Функция для определения цвета категории
const getColorForCategory = (category: string): string => {
  switch (category) {
    case "hs":
      return "text-green-500";
    case "ls":
      return "text-orange-500";
    case "ns":
      return "text-red-500";
    case "thera":
      return "text-yellow-500";
    case "?":
      return "text-gray-500";
    default:
      return "text-white";
  }
};

// Функция для определения цвета для классов червоточин (c1, c2, c3...) и других категорий
const getColorForClass = (className: string): string => {
  switch (className) {
    case "c1":
      return "bg-sky-500/20 text-sky-500"; // c1 - светло-синий (самая простая)
    case "c2":
      return "bg-blue-500/20 text-blue-500"; // c2 - голубой
    case "c3":
      return "bg-teal-500/20 text-teal-500"; // c3 - бирюзовый
    case "c4":
      return "bg-orange-500/20 text-orange-500"; // c4 - оранжевый
    case "c5":
      return "bg-red-500/20 text-red-500"; // c5 - красный
    case "c6":
      return "bg-purple-500/20 text-purple-500"; // c6 - фиолетовый (самая сложная)
    case "hs":
      return "bg-green-500/20 text-green-500"; // hs - зеленый (High-Sec)
    case "ls":
      return "bg-orange-500/20 text-orange-500"; // ls - оранжевый (Low-Sec)
    case "ns":
      return "bg-red-500/20 text-red-500"; // ns - красный (Null-Sec)
    default:
      return "bg-slate-700 text-slate-300";
  }
};

// Компонент Wh
const Wh = () => {
  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      <h1 className="text-2xl font-bold mb-4 text-slate-300"> Червоточины вселенной EVE Online</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700 text-sm text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-900">
            <tr>
              <th scope="col" className="px-6 py-3">
                From\To
              </th>
              <th scope="col" className="px-6 py-3">
                c1
              </th>
              <th scope="col" className="px-6 py-3">
                c2
              </th>
              <th scope="col" className="px-6 py-3">
                c3
              </th>
              <th scope="col" className="px-6 py-3">
                c4
              </th>
              <th scope="col" className="px-6 py-3">
                c5
              </th>
              <th scope="col" className="px-6 py-3">
                c6
              </th>
              <th scope="col" className="px-6 py-3">
                hs
              </th>
              <th scope="col" className="px-6 py-3">
                ls
              </th>
              <th scope="col" className="px-6 py-3">
                ns
              </th>
              <th scope="col" className="px-6 py-3">
                thera
              </th>
            </tr>
          </thead>
          <tbody>
            {wormholeData.map((row) => (
              <tr key={row.category} className="bg-slate-800 border-b border-slate-700">
                <td className="px-6 py-4 font-medium whitespace-nowrap">{row.category}</td>
                <td className={`px-6 py-4 ${getColorForClass("c1")}`}>
                  {row.c1 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c1] || row.c1}`}
                    >
                      {row.c1}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("c2")}`}>
                  {row.c2 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c2] || row.c2}`}
                    >
                      {row.c2}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("c3")}`}>
                  {row.c3 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c3] || row.c3}`}
                    >
                      {row.c3}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("c4")}`}>
                  {row.c4 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c4] || row.c4}`}
                    >
                      {row.c4}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("c5")}`}>
                  {row.c5 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c5] || row.c5}`}
                    >
                      {row.c5}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("c6")}`}>
                  {row.c6 && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.c6] || row.c6}`}
                    >
                      {row.c6}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("hs")}`}>
                  {row.hs && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.hs] || row.hs}`}
                    >
                      {row.hs}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("ls")}`}>
                  {row.ls && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.ls] || row.ls}`}
                    >
                      {row.ls}
                    </Link>
                  )}
                </td>
                <td className={`px-6 py-4 ${getColorForClass("ns")}`}>
                  {row.ns && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.ns] || row.ns}`}
                    >
                      {row.ns}
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4">
                  {row.thera && (
                    <Link
                      className={`hover:text-white ${getColorForCategory(row.category)}`}
                      href={`/wh/result/${wormholeNamesById[row.thera] || row.thera}`}
                    >
                      {row.thera}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Wh;



// "use client";
// import Link from "next/link";
// import typesNew from "../data/typesnew.json";

// // Определяем интерфейс для типа данных из typesNew.json
// interface Type {
//   id: number;
//   name: {
//     en: string; // Предполагаем, что имя всегда на английском
//   };
// }

// // Преобразуем данные из typesNew в удобный объект
// const wormholeNamesById: { [key: string]: string } = {};
// const wormholeDataById: { [key: string]: string } = {};

// Object.values(typesNew).forEach((type: Type) => {
//   const match = type.name.en.match(/^Wormhole (\w{4})$/);
//   if (match) {
//     const code = match[1];
//     wormholeNamesById[code] = type.id.toString(); // Сохраняем ID червоточины
//     wormholeDataById[type.id.toString()] = code; // Для обратного преобразования, если нужно
//   }
// });

// // Исходные данные о категориях червоточин
// const wormholeData = [
//   { category: "c1", c1: "H121", c2: "C125", c3: "O883", c4: "M609", c5: "L614", c6: "S804", hs: "N110", ls: "J244", ns: "Z060", thera: "F353" },
//   { category: "c2", c1: "Z647", c2: "D382", c3: "O477", c4: "Y683", c5: "N062", c6: "R474", hs: "B274", ls: "A239", ns: "E545", thera: "F135" },
//   { category: "c3", c1: "V301", c2: "I182", c3: "N968", c4: "T405", c5: "N770", c6: "A982", hs: "D845", ls: "U210", ns: "K346", thera: "F135" },
//   { category: "c4", c1: "P060", c2: "N766", c3: "C247", c4: "X877", c5: "H900", c6: "U574", hs: "S047", ls: "N290", ns: "K329" },
//   { category: "c5", c1: "Y790", c2: "D364", c3: "M267", c4: "E175", c5: "H296", c6: "V753", hs: "D792", ls: "C140", ns: "Z142" },
//   { category: "c6", c1: "Q317", c2: "G024", c3: "L477", c4: "Z457", c5: "V911", c6: "W237", hs: "B520 D792", ls: "C140 C391", ns: "C248 Z142" },
//   { category: "hs", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "M555", c6: "B041", hs: "A641", ls: "R051", ns: "V283", thera: "T458" },
//   { category: "ls", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "M164" },
//   { category: "ns", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "L031" },
//   { category: "thera", c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", hs: "Q063", ls: "V898", ns: "E587" },
//   { category: "?", c1: "E004", c2: "L005", c3: "Z006", c4: "M001", c5: "C008", c6: "G008", hs: "Q003", ls: "A009", ns: "S877", thera: "B735" },
// ];

// // Функция для определения цвета категории
// const getColorForCategory = (category: string): string => {
//   switch (category) {
//     case "hs":
//       return "text-green-500";
//     case "ls":
//       return "text-blue-500";
//     case "ns":
//       return "text-red-500";
//     case "thera":
//       return "text-yellow-500";
//     case "?":
//       return "text-gray-500";
//     default:
//       return "text-white";
//   }
// };

// // Компонент Wh
// const Wh = () => {
//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-3xl font-bold text-slate-200">Червоточины</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-slate-700 text-sm text-left text-slate-300">
//           <thead className="text-xs uppercase bg-slate-900">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 From\To
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c1
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c2
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c3
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c4
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c5
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c6
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 hs
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ls
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ns
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 thera
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {wormholeData.map((row) => (
//               <tr key={row.category} className="bg-slate-800 border-b border-slate-700">
//                 <td className="px-6 py-4 font-medium whitespace-nowrap">{row.category}</td>
//                 <td className="px-6 py-4">
//                   {row.c1 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c1] || row.c1}`}
//                     >
//                       {row.c1}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c2 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c2] || row.c2}`}
//                     >
//                       {row.c2}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c3 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c3] || row.c3}`}
//                     >
//                       {row.c3}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c4 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c4] || row.c4}`}
//                     >
//                       {row.c4}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c5 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c5] || row.c5}`}
//                     >
//                       {row.c5}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c6 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c6] || row.c6}`}
//                     >
//                       {row.c6}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.hs && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.hs] || row.hs}`}
//                     >
//                       {row.hs}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ls && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.ls] || row.ls}`}
//                     >
//                       {row.ls}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ns && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.ns] || row.ns}`}
//                     >
//                       {row.ns}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.thera && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.thera] || row.thera}`}
//                     >
//                       {row.thera}
//                     </Link>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Wh;


// "use client";
// import Link from "next/link";
// import typesNew from "../data/typesnew.json";

// // Преобразуем данные из typesNew в удобный объект
// const wormholeNamesById: { [key: string]: string } = {};
// const wormholeDataById: { [key: string]: string } = {};

// Object.values(typesNew).forEach((type: any) => {
//   const match = type.name.en.match(/^Wormhole (\w{4})$/);
//   if (match) {
//     const code = match[1];
//     wormholeNamesById[code] = type.id.toString(); // Сохраняем ID червоточины
//     wormholeDataById[type.id.toString()] = code; // Для обратного преобразования, если нужно
//   }
// });

// // Исходные данные о категориях червоточин
// const wormholeData = [
//   { category: "c1", c1: "H121", c2: "C125", c3: "O883", c4: "M609", c5: "L614", c6: "S804", hs: "N110", ls: "J244", ns: "Z060", thera: "F353" },
//   { category: "c2", c1: "Z647", c2: "D382", c3: "O477", c4: "Y683", c5: "N062", c6: "R474", hs: "B274", ls: "A239", ns: "E545", thera: "F135" },
//   { category: "c3", c1: "V301", c2: "I182", c3: "N968", c4: "T405", c5: "N770", c6: "A982", hs: "D845", ls: "U210", ns: "K346", thera: "F135" },
//   { category: "c4", c1: "P060", c2: "N766", c3: "C247", c4: "X877", c5: "H900", c6: "U574", hs: "S047", ls: "N290", ns: "K329" },
//   { category: "c5", c1: "Y790", c2: "D364", c3: "M267", c4: "E175", c5: "H296", c6: "V753", hs: "D792", ls: "C140", ns: "Z142" },
//   { category: "c6", c1: "Q317", c2: "G024", c3: "L477", c4: "Z457", c5: "V911", c6: "W237", hs: "B520 D792", ls: "C140 C391", ns: "C248 Z142" },
//   { category: "hs", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "M555", c6: "B041", hs: "A641", ls: "R051", ns: "V283", thera: "T458" },
//   { category: "ls", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "M164" },
//   { category: "ns", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "L031" },
//   { category: "thera", c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", hs: "Q063", ls: "V898", ns: "E587" },
//   { category: "?", c1: "E004", c2: "L005", c3: "Z006", c4: "M001", c5: "C008", c6: "G008", hs: "Q003", ls: "A009", ns: "S877", thera: "B735" },
// ];

// const getColorForCategory = (category: string): string => {
//   switch (category) {
//     case "hs":
//       return "text-green-500";
//     case "ls":
//       return "text-blue-500";
//     case "ns":
//       return "text-red-500";
//     case "thera":
//       return "text-yellow-500";
//     case "?":
//       return "text-gray-500";
//     default:
//       return "text-white";
//   }
// };

// const Wh = () => {
//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-3xl font-bold text-slate-200">Червоточины</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-slate-700 text-sm text-left text-slate-300">
//           <thead className="text-xs uppercase bg-slate-900">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 From\To
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c1
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c2
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c3
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c4
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c5
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c6
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 hs
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ls
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ns
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 thera
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {wormholeData.map((row) => (
//               <tr key={row.category} className="bg-slate-800 border-b border-slate-700">
//                 <td className="px-6 py-4 font-medium whitespace-nowrap">{row.category}</td>
//                 <td className="px-6 py-4">
//                   {row.c1 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c1] || row.c1}`}
//                     >
//                       {row.c1}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c2 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c2] || row.c2}`}
//                     >
//                       {row.c2}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c3 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c3] || row.c3}`}
//                     >
//                       {row.c3}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c4 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c4] || row.c4}`}
//                     >
//                       {row.c4}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c5 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c5] || row.c5}`}
//                     >
//                       {row.c5}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c6 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.c6] || row.c6}`}
//                     >
//                       {row.c6}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.hs && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.hs] || row.hs}`}
//                     >
//                       {row.hs}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ls && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.ls] || row.ls}`}
//                     >
//                       {row.ls}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ns && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.ns] || row.ns}`}
//                     >
//                       {row.ns}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.thera && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${wormholeNamesById[row.thera] || row.thera}`}
//                     >
//                       {row.thera}
//                     </Link>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Wh;



// "use client";
// // import { useEffect, useState } from "react";
// import Link from "next/link";

// const Wh = () => {
//   // Данные из вашего примера, преобразованные в формат строки-столбца
//   const wormholeData = [
//     { category: "c1", c1: "H121", c2: "C125", c3: "O883", c4: "M609", c5: "L614", c6: "S804", hs: "N110", ls: "J244", ns: "Z060", thera: "F353" },
//     { category: "c2", c1: "Z647", c2: "D382", c3: "O477", c4: "Y683", c5: "N062", c6: "R474", hs: "B274", ls: "A239", ns: "E545", thera: "F135" },
//     { category: "c3", c1: "V301", c2: "I182", c3: "N968", c4: "T405", c5: "N770", c6: "A982", hs: "D845", ls: "U210", ns: "K346", thera: "F135" },
//     { category: "c4", c1: "P060", c2: "N766", c3: "C247", c4: "X877", c5: "H900", c6: "U574", hs: "S047", ls: "N290", ns: "K329" },
//     { category: "c5", c1: "Y790", c2: "D364", c3: "M267", c4: "E175", c5: "H296", c6: "V753", hs: "D792", ls: "C140", ns: "Z142" },
//     { category: "c6", c1: "Q317", c2: "G024", c3: "L477", c4: "Z457", c5: "V911", c6: "W237", hs: "B520 D792", ls: "C140 C391", ns: "C248 Z142" },
//     { category: "hs", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "M555", c6: "B041", hs: "A641", ls: "R051", ns: "V283", thera: "T458" },
//     { category: "ls", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "M164" },
//     { category: "ns", c1: "Z971", c2: "R943", c3: "X702", c4: "O128", c5: "N432", c6: "U319", hs: "B449", ls: "N944", ns: "S199", thera: "L031" },
//     { category: "thera", c1: "", c2: "", c3: "", c4: "", c5: "", c6: "", hs: "Q063", ls: "V898", ns: "E587" },
//     { category: "?", c1: "E004", c2: "L005", c3: "Z006", c4: "M001", c5: "C008", c6: "G008", hs: "Q003", ls: "A009", ns: "S877", thera: "B735" },
//   ];

//   const getColorForCategory = (category: string): string => {
//     switch (category) {
//       case "hs":
//         return "text-green-500";
//       case "ls":
//         return "text-blue-500";
//       case "ns":
//         return "text-red-500";
//       case "thera":
//         return "text-yellow-500";
//       case "?":
//         return "text-gray-500";
//       default:
//         return "text-white";
//     }
//   };

//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-3xl font-bold text-slate-200">Червоточины</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-slate-700 text-sm text-left text-slate-300">
//           <thead className="text-xs uppercase bg-slate-900">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 From\To
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c1
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c2
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c3
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c4
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c5
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c6
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 hs
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ls
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ns
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 thera
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {wormholeData.map((row) => (
//               <tr key={row.category} className="bg-slate-800 border-b border-slate-700">
//                 <td className="px-6 py-4 font-medium whitespace-nowrap">{row.category}</td>
//                 <td className="px-6 py-4">
//                   {row.c1 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c1}`}
//                     >
//                       {row.c1}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c2 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c2}`}
//                     >
//                       {row.c2}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c3 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c3}`}
//                     >
//                       {row.c3}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c4 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c4}`}
//                     >
//                       {row.c4}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c5 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c5}`}
//                     >
//                       {row.c5}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.c6 && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.c6}`}
//                     >
//                       {row.c6}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.hs && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.hs}`}
//                     >
//                       {row.hs}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ls && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.ls}`}
//                     >
//                       {row.ls}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.ns && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.ns}`}
//                     >
//                       {row.ns}
//                     </Link>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">
//                   {row.thera && (
//                     <Link
//                       className={`hover:text-white ${getColorForCategory(row.category)}`}
//                       href={`/wh/result/${row.thera}`}
//                     >
//                       {row.thera}
//                     </Link>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Wh;


// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import typesNew from "../data/typesnew.json"; // Импортируем JSON как модуль
// import { Type } from "../types/index";
// import React from "react";

// const Wh = () => {
//   const [wormholeData, setWormholeData] = useState<{ [key: string]: string[] }>({});

//   useEffect(() => {
//     // Создаем объект для хранения данных по категориям
//     const dataObj: { [key: string]: string[] } = {
//       c1: [],
//       c2: [],
//       c3: [],
//       c4: [],
//       c5: [],
//       c6: [],
//       hs: [],
//       ls: [],
//       ns: [],
//       thera: [],
//       c13: [],
//       sentinel: [],
//       barbican: [],
//       vidette: [],
//       conflux: [],
//       redoubt: [],
//     };

//     Object.values(typesNew).forEach((type: Type) => {
//       const match = type.name.en.match(/^Wormhole (\w{4})$/);
//       if (match) {
//         const code = match[1];
//         const category = determineType(code);

//         // Добавляем код в соответствующую категорию
//         if (category in dataObj) {
//           dataObj[category].push(code);
//         }
//       }
//     });

//     setWormholeData(dataObj);
//   }, []);

//   const determineType = (code: string): string => {
//     // Логика определения типа червоточины по коду
//     if (code.startsWith("Z")) return "hs";
//     if (code.startsWith("R")) return "ls";
//     if (code.startsWith("X")) return "ns";
//     if (code.startsWith("O")) return "thera";
//     if (code.startsWith("M")) return "c13";
//     if (code.startsWith("B")) return "sentinel";
//     if (code.startsWith("A")) return "barbican";
//     if (code.startsWith("V")) return "vidette";
//     if (code.startsWith("C")) return "conflux";
//     if (code.startsWith("D")) return "redoubt";
//     return "other";
//   };

//   const getColorForType = (type: string): string => {
//     // Определяем цвет для каждого типа червоточины
//     switch (type) {
//       case "hs":
//         return "text-green-500";
//       case "ls":
//         return "text-blue-500";
//       case "ns":
//         return "text-red-500";
//       case "thera":
//         return "text-yellow-500";
//       case "c13":
//         return "text-purple-500";
//       case "sentinel":
//         return "text-pink-500";
//       case "barbican":
//         return "text-orange-500";
//       case "vidette":
//         return "text-teal-500";
//       case "conflux":
//         return "text-indigo-500";
//       case "redoubt":
//         return "text-gray-500";
//       default:
//         return "text-white";
//     }
//   };

//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-3xl font-bold text-slate-200">Червоточины</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-slate-700 text-sm text-left text-slate-300">
//           <thead className="text-xs uppercase bg-slate-900">
//             <tr>
//               <th scope="col" className="px-6 py-3">
//                 From\To
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c1
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c2
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c3
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c4
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c5
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c6
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 hs
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ls
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 ns
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 thera
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 c13
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 sentinel
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 barbican
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 vidette
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 conflux
//               </th>
//               <th scope="col" className="px-6 py-3">
//                 redoubt
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {Object.keys(wormholeData).map((category) => (
//               <tr key={category} className="bg-slate-800 border-b border-slate-700">
//                 <td className="px-6 py-4 font-medium whitespace-nowrap">{category}</td>
//                 {["c1", "c2", "c3", "c4", "c5", "c6", "hs", "ls", "ns", "thera", "c13", "sentinel", "barbican", "vidette", "conflux", "redoubt"].map((subCategory) => (
//                   <td key={`${category}-${subCategory}`} className="px-6 py-4">
//                     {wormholeData[category]?.filter((code) => determineType(code) === subCategory).map((code, index) => (
//                       <React.Fragment key={`${category}-${subCategory}-${code}`}>
//                         <Link
//                           className={`hover:text-white ${getColorForType(determineType(code))}`}
//                           href={`/wh/result/${code}`}
//                         >
//                           {code}
//                         </Link>
//                         {index !== wormholeData[category].length - 1 && <span>, </span>}
//                       </React.Fragment>
//                     ))}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Wh;


// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import typesNew from "../data/typesnew.json"; // Импортируем JSON как модуль
// import { Type } from "../types/index";

// const Wh = () => {
//   const [wormholes, setWormholes] = useState<Type[]>([]);

//   useEffect(() => {
//     // Фильтруем червоточины с "Wormhole" и ровно 4 символами после пробела
//     const filteredWormholes = Object.values(typesNew).filter((type: Type) => {
//       const match = type.name.en.match(/^Wormhole (\w{4})$/);
//       return match !== null;
//     });

//     setWormholes(filteredWormholes);
//   }, []);

//   return (
//     <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
//       <h1 className="text-3xl font-bold text-slate-200">Червоточины</h1>
//       {wormholes.length > 0 ? (
//         <ul>
//           {wormholes.map((wormhole) => {
//             // Извлекаем 4 символа после "Wormhole"
//             const codeMatch = wormhole.name.en.match(/^Wormhole (\w{4})$/);
//             const code = codeMatch ? codeMatch[1] : "";

//             return (
//               <li key={wormhole.id}>
//                 <Link
//                   className="text-slate-300 hover:text-white"
//                   href={`/wh/result/${wormhole.id}`}
//                 >
//                   <p>{code}</p> {/* Отображаем только код */}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       ) : (
//         <p>Нет данных о червоточинах.</p>
//       )}
//     </div>
//   );
// };

// export default Wh;

