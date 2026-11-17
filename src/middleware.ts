import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('nexus_auth_token')?.value;

  // 1. Root URL Entrypoint: Always starts from Login / Sign Up if not authenticated
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/catalog', request.url));
  }

  // 2. Already logged in users visiting /login or /signup get redirected to /catalog
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/catalog', request.url));
  }

  // 3. Protected customer & admin routes require authentication
  const protectedPrefixes = ['/catalog', '/cart', '/checkout', '/orders', '/sell', '/admin', '/wishlist', '/profile'];
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - api/health (health check probe)
     * - api/metrics (prometheus scrape)
     * - api/chaos (deliberate failure testing)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image formats (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!api/auth|api/health|api/metrics|api/chaos|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

