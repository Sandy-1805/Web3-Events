import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Autoriser les routes API d'auth
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Définition des routes
  const isLoginPage = pathname === '/login';
  const isPublicPage = pathname === '/' || pathname === '/login';

  // ❌ Pas de token + page privée → redirection login
  if (!isPublicPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Si token présent → vérifier
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, secret);

      // 🔒 Protection des routes admin
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // 🔁 Si déjà connecté et sur login → redirection intelligente
      if (isLoginPage) {
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/events', request.url));
      }

      // ✅ Accès autorisé
      return NextResponse.next();

    } catch (error) {
      // ❌ Token invalide
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // ✅ Cas public sans token
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