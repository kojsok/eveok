import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Тип для данных из базы данных
interface WormholeSystem {
  solarsystemid: number;
  system: string;
  class: number;
  star: string;
  planets: number;
  moons: number;
  effect: string | null;
  statics: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // Открываем соединение с базой данных
    const db = await open({
      filename: './wormholesystems.db',
      driver: sqlite3.Database,
    });

    // Выполняем поиск по полю `system`
    const rows = await db.all<WormholeSystem[]>(
      'SELECT * FROM wormholesystems_new WHERE system LIKE ?',
      [`%${query}%`]
    );

    // Закрываем соединение
    await db.close();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}