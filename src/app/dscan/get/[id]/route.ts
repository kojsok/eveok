import { getFromDatabase } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Разрешаем промис
    const data = await getFromDatabase(id);

    if (!data) {
        return new Response('Данные не найдены', { status: 404 });
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
