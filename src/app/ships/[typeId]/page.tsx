// app/ships/[typeId]/page.tsx
import ShipDetails from '@/components/ShipDetails';

export default async function ShipPage({ params }: { params: Promise<{ typeId: string }> }) {
  // Асинхронно получаем значение params
  const resolvedParams = await params;

  // Извлекаем typeId из resolvedParams
  const typeId = resolvedParams.typeId;

  // Преобразуем typeId в число
  const parsedTypeId = parseInt(typeId, 10);

  // Проверяем, является ли преобразованный ID корректным
  if (isNaN(parsedTypeId)) {
    return <div>Неверный ID корабля</div>;
  }

  // Передаем преобразованный typeId (число) в компонент ShipDetails
  return <ShipDetails typeId={parsedTypeId} />;
}



// // app/ships/[typeId]/page.tsx

// import ShipDetails from '@/components/ShipDetails';

// export default async function ShipPage({ params }: { params: { typeId: string } }) {
//   // Асинхронно получаем параметр typeId
//   const { typeId } = await params;

//   // Преобразуем typeId в число
//   const parsedTypeId = parseInt(typeId, 10);

//   if (isNaN(parsedTypeId)) {
//     return <div>Неверный ID корабля</div>;
//   }

//   // Передаем parsedTypeId в компонент ShipDetails
//   return <ShipDetails typeId={parsedTypeId} />;
// }


// // app/ships/[typeId]/page.tsx

// import ShipDetails from '@/components/ShipDetails';

// export default async function ShipPage({ params }: { params: { typeId: string } }) {
//   // Асинхронное получение параметра typeId
//   const { typeId } = params;

//   // Преобразуем typeId в число
//   const parsedTypeId = parseInt(typeId, 10);

//   if (isNaN(parsedTypeId)) {
//     return <div>Неверный ID корабля</div>;
//   }

//   // Передаем parsedTypeId в компонент ShipDetails
//   return <ShipDetails typeId={parsedTypeId} />;
// }


// import ShipDetails from '@/components/ShipDetails';

// // Функция получения параметров маршрута
// export default async function ShipPage({ params }: { params: { typeId: string } }) {
//   // Асинхронное получение параметра typeId
//   const typeId = parseInt(params.typeId, 10);

//   if (isNaN(typeId)) {
//     return <div>Неверный ID корабля</div>;
//   }

//   // Возвращаем компонент ShipDetails с переданным typeId
//   return <ShipDetails typeId={typeId} />;
// }


// import ShipDetails from '@/components/ShipDetails';

// export default function ShipPage({ params }: { params: { typeId: string } }) {
//   const typeId = parseInt(params.typeId, 10);

//   if (isNaN(typeId)) {
//     return <div>Неверный ID корабля</div>;
//   }

//   return <ShipDetails typeId={typeId} />;
// }