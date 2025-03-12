import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/eveApi";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("eve_token")?.value;
//   console.log("🔍 Получен токен:", token);

  if (!token) {
    console.error("❌ Ошибка: Токен отсутствует");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const skills = await getSkills(token);
    // console.log("✅ Загруженные скиллы:", skills);
    return NextResponse.json(skills);
  } catch (error) {
    console.error("❌ Ошибка при загрузке скиллов:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

