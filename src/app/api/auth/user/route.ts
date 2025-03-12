//Получение информации о пользователе из ESI)
import { NextRequest, NextResponse } from "next/server";
import { getUserInfo } from "@/lib/eveApi"; // Убедись, что этот файл существует

export async function GET(req: NextRequest) {
  const token = req.cookies.get("eve_token")?.value; // Проверяем, есть ли кука с токеном
  // console.log("🔍 Получен токен:", token);

  if (!token) {
    console.error("❌ Ошибка: Токен отсутствует");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserInfo(token);
    // console.log("✅ Данные пользователя:", user);

    // Возвращаем данные пользователя вместе с токеном!
    return NextResponse.json({ ...user, AccessToken: token });
  } catch (error) {
    console.error("❌ Ошибка при получении данных пользователя:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
