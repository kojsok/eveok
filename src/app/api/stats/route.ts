
import { NextResponse } from "next/server";
import { initializeDB, db } from "@/lib/db";

// Получение статистики о базе данных
export const GET = async (req: Request) => {
    try {
        // Проверяем заголовок
        const secretHeader = req.headers.get("x-api-secret");
        if (secretHeader !== process.env.API_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Инициализация базы данных
        await initializeDB();

        // Запрос списка таблиц
        const tables = await db!.all("SELECT name FROM sqlite_master WHERE type='table'");

        // Сбор статистики по каждой таблице
        const stats = await Promise.all(
            tables.map(async (table: { name: string }) => {
                const countResult = await db!.get<{ count: number }>(
                    `SELECT COUNT(*) as count FROM ${table.name}`
                );

                return {
                    table: table.name,
                    count: countResult?.count || 0,
                };
            })
        );

        return NextResponse.json({ stats });
    } catch (error) {
        console.error("Ошибка при получении статистики:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};




// import { NextResponse } from "next/server";
// import { initializeDB, db } from "@/lib/db";

// // Получение статистики о базе данных
// export const GET = async () => {
//     try {
//         // Инициализация базы данных
//         await initializeDB();

//         // Запрос списка таблиц
//         const tables = await db!.all("SELECT name FROM sqlite_master WHERE type='table'");

//         // Сбор статистики по каждой таблице
//         const stats = await Promise.all(
//             tables.map(async (table: { name: string }) => {
//                 // Подсчет количества записей
//                 const countResult = await db!.get<{ count: number }>(
//                     `SELECT COUNT(*) as count FROM ${table.name}`
//                 );

//                 // Получение всех записей из таблицы
//                 const rows = await db!.all(`SELECT * FROM ${table.name}`);

//                 return {
//                     table: table.name,
//                     count: countResult?.count || 0,
//                     rows: rows || [],
//                 };
//             })
//         );

//         return NextResponse.json({ stats });
//     } catch (error) {
//         console.error("Ошибка при получении статистики:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// };


// import { NextResponse } from "next/server";
// import { initializeDB, db } from "@/lib/db";

// // Получение статистики о базе данных
// export const GET = async () => {
//     try {
//         // Инициализация базы данных
//         await initializeDB();

//         // Запрос списка таблиц
//         const tables = await db!.all("SELECT name FROM sqlite_master WHERE type='table'");

//         // Сбор статистики по каждой таблице
//         const stats = await Promise.all(
//             tables.map(async (table: { name: string }) => {
//                 const count = await db!.get<{ count: number }>(
//                     `SELECT COUNT(*) as count FROM ${table.name}`
//                 );
//                 return {
//                     table: table.name,
//                     count: count?.count || 0,
//                 };
//             })
//         );

//         return NextResponse.json({ stats });
//     } catch (error) {
//         console.error("Ошибка при получении статистики:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// };