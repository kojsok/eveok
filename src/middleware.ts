import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('eve_token')?.value;
  const isProtectedPath = request.nextUrl.pathname === '/character';

  // Если это НЕ защищенный путь — пропускаем
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Для /charecter проверяем куку
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: '/charecter', // Middleware применяется только к /charecter
// };

export const config = {
  matcher: [
    '/character', // Защищаем /character
    '/((?!api|_next/static|favicon.ico).*)' // Остальные пути
  ],
};

