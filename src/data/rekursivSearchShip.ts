

// Как это работает:
// Интерфейс Ship:
// Описывает структуру корабля, включая id, name, description, basePrice, image_url и traits.
// Интерфейс SubGroup:
// Описывает подгруппу кораблей, содержащую описание (description), название (name), вложенные подгруппы (subGroups) и список кораблей (ships).
// Интерфейс Group:
// Описывает основную группу кораблей, которая может содержать вложенные подгруппы (subGroups).
// Функция findShipById:
// Проверяет наличие свойства ships в текущем объекте.
// Если свойство ships существует, выполняет поиск корабля по id.
// Если свойство subGroups существует, рекурсивно обходит все подгруппы.

// Интерфейсы для типизации данных
// interface Ship {
//     id: number;
//     name: {
//         en: string;
//         ru: string;
//     };
//     description: {
//         en: string;
//         ru: string;
//     };
//     basePrice: number;
//     image_url: string;
//     traits?: {
//         types: Record<string, Array<{ bonus: number; bonusText: { en: string; ru: string } }>>;
//     };
// }

// interface SubGroup {
//     groupId: number;
//     description: {
//         en: string;
//         ru: string;
//     };
//     name: {
//         en: string;
//         ru: string;
//     };
//     subGroups: Record<string, SubGroup>;
//     ships: Ship[];
// }

// interface Group {
//     groupId: number;
//     description: {
//         en: string;
//         ru: string;
//     };
//     name: {
//         en: string;
//         ru: string;
//     };
//     subGroups: Record<string, SubGroup>;
// }


// const combinedShipsData: Group = {
//     groupId: 4,
//     description: {
//         en: "Capsuleer spaceships of all sizes and roles",
//         ru: "Капсулёрские корабли всех назначений",
//     },
//     name: {
//         en: "Ships",
//         ru: "Корабли",
//     },
//     subGroups: {
//         '391': {
//             groupId: 391,
//             description: {
//                 en: "Fast and cheap vessels for easy transport",
//                 ru: "Быстрые и дешевые корабли для транспортировки небольших грузов",
//             },
//             name: {
//                 en: "Shuttles",
//                 ru: "Катера",
//             },
//             subGroups: {},
//             ships: [
//                 {
//                     id: 11134,
//                     name: {
//                         en: "Amarr Shuttle",
//                         ru: "Amarr Shuttle",
//                     },
//                     description: {
//                         en: "Amarr Shuttle",
//                         ru: "Челнок Amarr",
//                     },
//                     basePrice: 7500,
//                     image_url: "https://images.evetech.net/types/11134/icon?size=64",
//                     traits: {
//                         types: {},
//                     },
//                 },
//             ],
//         },
//     },
// };

// const ship = findShipById(combinedShipsData, 11134);
// if (ship) {
//     console.log(ship.name.ru); // Выведет "Amarr Shuttle"
// } else {
//     console.log("Ship not found");
// }