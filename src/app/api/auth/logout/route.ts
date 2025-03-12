//Выход из системы (очистка куки)
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/character", req.nextUrl.origin)); // ✅ Исправлено
  response.headers.set("Set-Cookie", "eve_token=; Path=/; HttpOnly; Max-Age=0;");
  return response;
}
