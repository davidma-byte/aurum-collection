import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * First layer only. Every admin page, action and route handler ALSO calls
 * requireAdmin(), which re-checks the role in the database.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isSecure =
    req.nextUrl.protocol === 'https:' ||
    Boolean(process.env.NEXTAUTH_URL?.startsWith('https://')) ||
    Boolean(process.env.VERCEL_URL);
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'aurum-collection-ultra-secure-jwt-secret-key-2026-production',
    secureCookie: isSecure,
  });
  const isAdmin = token?.role === 'ADMIN';

  if (pathname.startsWith('/api/admin')) {
    if (isAdmin) return NextResponse.next();
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // /admin/login must be reachable by signed-out staff. A signed-in client sees a 404.
  if (pathname === '/admin/login') {
    if (isAdmin) return NextResponse.redirect(new URL('/admin', req.url));
    if (token) return NextResponse.rewrite(new URL('/__not-found', req.url));
    return NextResponse.next();
  }

  if (!isAdmin) return NextResponse.rewrite(new URL('/__not-found', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
