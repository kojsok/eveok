//редирект на страницу авторизации EVE Online
import { NextResponse } from "next/server";
import { getEveAuthUrl } from "@/lib/eveAuth";

export async function GET() {
  return NextResponse.redirect(getEveAuthUrl());
}

