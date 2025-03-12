import { NextRequest, NextResponse } from "next/server";
import { getSkillQueue } from "@/lib/eveApi";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("eve_token")?.value;

  if (!token) {
    console.error("❌ Ошибка: Токен отсутствует");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queue = await getSkillQueue(token);
    return NextResponse.json(queue);
  } catch (error) {
    console.error("❌ Ошибка при загрузке очереди:", error);
    return NextResponse.json({ error: "Failed to fetch skill queue" }, { status: 500 });
  }
}
