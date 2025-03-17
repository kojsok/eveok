import { NextResponse } from "next/server";
import filteredGroupsData from "../../../data/filtered_groups.json";

// Определяем интерфейс для данных
interface FilteredGroup {
  id: number;
  name: {
    en: string;
    ru: string;
  };
}

export async function GET(req: Request) {
  try {
    // Получаем параметры запроса (если нужны)
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const limit = parseInt(url.searchParams.get("limit") || "3000", 10);

    // Фильтруем данные по поисковому запросу
    let items: FilteredGroup[] = Array.isArray(filteredGroupsData)
      ? filteredGroupsData
      : Object.values(filteredGroupsData);

    if (search) {
      items = items.filter((item) =>
        item.name.en?.toLowerCase().includes(search) ||
        item.name.ru?.toLowerCase().includes(search)
      );
    }

    // Ограничиваем количество результатов
    const result = items.slice(0, limit);

    // Возвращаем JSON-ответ
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка при получении данных filtered_groups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



// // src/app/api/groups/route.ts
// import { NextResponse } from 'next/server';
// import filteredGroupsData from '../../../data/filtered_groups.json';

// export async function GET(req: Request) {
//   try {
//     // Получаем параметры запроса (если нужны)
//     const url = new URL(req.url);
//     const search = url.searchParams.get('search')?.toLowerCase() || '';
//     const limit = parseInt(url.searchParams.get('limit') || '50', 10);

//     // Фильтруем данные по поисковому запросу
//     let items = Array.isArray(filteredGroupsData)
//       ? filteredGroupsData
//       : Object.values(filteredGroupsData);

//     if (search) {
//       items = items.filter((item) =>
//         item.name.en?.toLowerCase().includes(search) ||
//         item.name.ru?.toLowerCase().includes(search)
//       );
//     }

//     // Ограничиваем количество результатов
//     const result = items.slice(0, limit);

//     // Возвращаем JSON-ответ
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Ошибка при получении данных filtered_groups:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }