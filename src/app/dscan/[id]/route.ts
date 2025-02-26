import { getFromDatabase } from "@/lib/db";

// Экспорт функции GET для обработки запросов
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // Разрешаем промис params и получаем значение id
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Получаем данные из базы данных
    const results = await getFromDatabase(id);

    // Если результатов нет, возвращаем 404
    if (!results) {
        return new Response("Not Found", { status: 404 });
    }

    // Возвращаем данные в формате JSON
    return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

