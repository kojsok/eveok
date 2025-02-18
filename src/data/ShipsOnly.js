// // Загружаем данные из CombinedShipsData.json
// const fs = require('fs');

// // Читаем исходный файл
// const rawData = fs.readFileSync('CombinedShipsData.json');
// const data = JSON.parse(rawData);

// // Функция для рекурсивного извлечения кораблей
// function extractShips(data) {
//   let ships = [];

//   // Если есть свойство ships, добавляем их в результат
//   if (data.ships) {
//     ships = ships.concat(data.ships);
//   }

//   // Если есть подгруппы, рекурсивно обрабатываем их
//   if (data.subGroups) {
//     for (const subgroupKey in data.subGroups) {
//       const subgroup = data.subGroups[subgroupKey];
//       ships = ships.concat(extractShips(subgroup));
//     }
//   }

//   return ships;
// }

// // Извлекаем все корабли
// const allShips = extractShips(data);

// // Сохраняем корабли в новый JSON-файл
// fs.writeFileSync('ShipsOnly.json', JSON.stringify(allShips, null, 2));

// console.log("Файл 'ShipsOnly.json' успешно создан!");