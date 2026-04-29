import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Security headers for all routes
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent caching on API routes to ensure freshness
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  // Admin API: require x-admin-password header for mutation routes
  if (pathname.startsWith('/api/game/start')) {
    const adminPass = request.headers.get('x-admin-password');
    const expected = process.env.ADMIN_PASSWORD || 'admin123';
    if (!adminPass || adminPass !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
