import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('eve_token')?.value;
  return NextResponse.json({ exists: !!token });
}