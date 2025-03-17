import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";

// Интерфейс для данных о кораблях
interface ShipData {
    name: string;
    count: number;
}

// Тип для объекта базы данных
type Database = sqlite.Database;

export let db: Database | null = null;

// Инициализация базы данных (экспорт этой функции)
export const initializeDB = async (): Promise<void> => {
    if (!db) {
        db = await sqlite.open({
            filename: "./database.sqlite",
            driver: sqlite3.cached.Database,
        });

        // Создание таблицы, если её нет
        await db.exec(`
            CREATE TABLE IF NOT EXISTS dscan_results (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
};

// Сохранение данных в базу данных
export const saveToDatabase = async (id: string, data: ShipData[]): Promise<void> => {
    await initializeDB(); // Инициализация, если база данных ещё не инициализирована

    try {
        await db!.run("INSERT INTO dscan_results (id, data) VALUES (?, ?)", [id, JSON.stringify(data)]);
    } catch (error) {
        console.error("Ошибка при сохранении данных:", error);
        throw error;
    }
};

// Получение данных из базы данных
export const getFromDatabase = async (id: string): Promise<ShipData[] | null> => {
    await initializeDB(); // Инициализация, если база данных ещё не инициализирована

    try {
        const row = await db!.get<{ data: string }>("SELECT data FROM dscan_results WHERE id = ?", [id]);
        return row ? JSON.parse(row.data) : null;
    } catch (error) {
        console.error("Ошибка при получении данных:", error);
        return null;
    }
};


//!работает не трогать но без функции инициализации базы данных
// import * as sqlite from "sqlite";
// import * as sqlite3 from "sqlite3";

// // Интерфейс для данных о кораблях
// interface ShipData {
//     name: string;
//     count: number;
// }

// // Тип для объекта базы данных
// type Database = sqlite.Database;

// let db: Database | null = null;

// // Инициализация базы данных
// const initializeIfNotInitialized = async (): Promise<void> => {
//     if (!db) {
//         db = await sqlite.open({
//             filename: "./database.sqlite",
//             driver: sqlite3.cached.Database,
//         });

//         // Создание таблицы, если её нет
//         await db.exec(`
//             CREATE TABLE IF NOT EXISTS dscan_results (
//                 id TEXT PRIMARY KEY,
//                 data TEXT NOT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )
//         `);
//     }
// };

// // Сохранение данных в базу данных
// export const saveToDatabase = async (id: string, data: ShipData[]): Promise<void> => {
//     await initializeIfNotInitialized(); // Инициализация, если база данных ещё не инициализирована

//     try {
//         await db!.run("INSERT INTO dscan_results (id, data) VALUES (?, ?)", [id, JSON.stringify(data)]);
//     } catch (error) {
//         console.error("Ошибка при сохранении данных:", error);
//         throw error;
//     }
// };

// // Получение данных из базы данных
// export const getFromDatabase = async (id: string): Promise<ShipData[] | null> => {
//     await initializeIfNotInitialized(); // Инициализация, если база данных ещё не инициализирована

//     try {
//         const row = await db!.get<{ data: string }>("SELECT data FROM dscan_results WHERE id = ?", [id]);
//         return row ? JSON.parse(row.data) : null;
//     } catch (error) {
//         console.error("Ошибка при получении данных:", error);
//         return null;
//     }
// };



// import * as sqlite from "sqlite";
// import * as sqlite3 from "sqlite3";

// // Тип для объекта базы данных
// type Database = sqlite.Database;

// let db: Database | null = null;

// // Инициализация базы данных
// const initializeIfNotInitialized = async (): Promise<void> => {
//     if (!db) {
//         db = await sqlite.open({
//             filename: "./database.sqlite",
//             driver: sqlite3.cached.Database,
//         });

//         // Создание таблицы, если её нет
//         await db.exec(`
//             CREATE TABLE IF NOT EXISTS dscan_results (
//                 id TEXT PRIMARY KEY,
//                 data TEXT NOT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )
//         `);
//     }
// };

// // Сохранение данных в базу данных
// export const saveToDatabase = async (id: string, data: Record<string, any>[]): Promise<void> => {
//     await initializeIfNotInitialized(); // Инициализация, если база данных ещё не инициализирована

//     try {
//         await db!.run("INSERT INTO dscan_results (id, data) VALUES (?, ?)", [id, JSON.stringify(data)]);
//     } catch (error) {
//         console.error("Ошибка при сохранении данных:", error);
//         throw error;
//     }
// };

// // Получение данных из базы данных
// export const getFromDatabase = async (id: string): Promise<Record<string, any>[] | null> => {
//     await initializeIfNotInitialized(); // Инициализация, если база данных ещё не инициализирована

//     try {
//         const row = await db!.get<{ data: string }>("SELECT data FROM dscan_results WHERE id = ?", [id]);
//         return row ? JSON.parse(row.data) : null;
//     } catch (error) {
//         console.error("Ошибка при получении данных:", error);
//         return null;
//     }
// };
