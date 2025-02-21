
import { saveToDatabase } from "@/lib/db";

// Интерфейс для данных о кораблях
interface ShipData {
    name: string;
    count: number;
}

export async function POST(request: Request) {
    try {
        // Получаем данные из запроса
        const { id, data }: { id: string; data: ShipData[] } = await request.json();

        // Проверяем, что id и data присутствуют
        if (!id || !data) {
            return new Response("Недостаточно данных", { status: 400 });
        }

        // Проверяем структуру данных
        if (!Array.isArray(data) || !data.every(item => "name" in item && "count" in item)) {
            return new Response("Некорректные данные", { status: 400 });
        }

        // Сохраняем данные в базу данных
        await saveToDatabase(id, data);

        return new Response("Данные успешно сохранены", { status: 200 });
    } catch (error) {
        console.error("Ошибка при сохранении данных:", error);
        return new Response("Ошибка сервера", { status: 500 });
    }
}

// import { saveToDatabase } from "@/lib/db";

// export async function POST(request: Request) {
//     const { id, data }: { id: string; data: Record<string, any>[] } = await request.json();

//     try {
//         await saveToDatabase(id, data);
//         return new Response("Данные сохранены", { status: 200 });
//     } catch (error) {
//         return new Response("Ошибка при сохранении данных", { status: 500 });
//     }
// }