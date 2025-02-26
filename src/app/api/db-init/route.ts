import { initializeDB } from "@/lib/db";

export async function GET() {
    try {
        await initializeDB();
        return new Response("База данных инициализирована", { status: 200 });
    } catch (error) {
        console.error("Ошибка инициализации базы данных:", error);
        return new Response("Ошибка инициализации базы данных", { status: 500 });
    }
}

