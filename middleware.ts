import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Les routes API ne sont PAS protégées (pour permettre la connexion)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Seule la page de connexion est publique
  const isLoginPage = pathname === '/login';

  // Si on n'est pas sur login et qu'on n'a pas de token -> rediriger vers login
  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si on a un token, le vérifier
  if (token && !isLoginPage) {
    try {
      const { payload } = await jwtVerify(token.value, secret);

      // Si c'est une route admin, vérifier le rôle
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // Tout va bien
      return NextResponse.next();
    } catch (error) {
      // Token invalide -> rediriger vers login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Si on est sur login et qu'on a un token valide -> rediriger
  if (token && isLoginPage) {
    try {
      const { payload } = await jwtVerify(token.value, secret);
      if (payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/events', request.url));
    } catch {
      return NextResponse.next();
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