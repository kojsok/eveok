//Обработка ответа после авторизации

import { NextRequest, NextResponse } from "next/server";
import { getEveToken, setAuthCookie } from "@/lib/eveAuth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { access_token } = await getEveToken(code);
    // console.log('Redirecting to /character with token:', access_token); // Лог редиректа
    const response = NextResponse.redirect(new URL("/character", req.nextUrl.origin)); // ✅ Исправлено
    response.headers.set("Set-Cookie", setAuthCookie(access_token));
    // ⏱️ Добавляем задержку 1 секунда (только для тестирования!)
    // await new Promise(resolve => setTimeout(resolve, 3000));
    return response;
  } catch (error) {
    console.error("EVE Auth Error:", error);
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
  }
}
