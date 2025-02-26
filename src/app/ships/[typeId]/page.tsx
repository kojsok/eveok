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

