import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Pages publiques (accessibles sans connexion)
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname === path);

  // Si pas de token et pas sur une page publique -> rediriger vers login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si token existe, vérifier le rôle
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, secret);
      const userRole = payload.role as string;

      // Routes admin (protégées)
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Si déjà connecté et va sur login -> rediriger vers home ou admin
      if (pathname === '/login') {
        if (userRole === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Token invalide
      if (!isPublicPath) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/events/:path*',
    '/favorites',
    '/speakers/:path*',
    '/sessions/:path*',
  ],
};