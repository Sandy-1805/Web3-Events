// middleware.ts
// 🔐 Gestion des accès par rôle
// RÈGLE MÉTIER (spec §6) :
//   - Participants → accès PUBLIC, pas besoin de login
//   - Organisateurs (admin) → login obligatoire
//   - /favorites → login requis (favoris liés à un compte)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // ✅ Toujours autoriser les routes API d'auth
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 🔒 Routes nécessitant une authentification obligatoire
  const requiresAuth =
    pathname.startsWith('/admin') ||
    pathname === '/favorites';

  // 🌐 Routes publiques accessibles sans login
  // (events, sessions, speakers sont publics selon la spec)
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/speakers');

  // Si le token est absent et que la route nécessite auth → login
  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si un token est présent → on le vérifie dans tous les cas
  if (token) {
    try {
      const { payload } = await jwtVerify(token.value, secret);

      // 🔒 Protection des routes /admin : seul le rôle 'admin' y accède
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // 🔁 Déjà connecté + sur page login → redirection intelligente
      if (pathname === '/login') {
        return NextResponse.redirect(
          new URL(payload.role === 'admin' ? '/admin' : '/events', request.url)
        );
      }

      return NextResponse.next();
    } catch {
      // Token invalide → supprimer le cookie
      // Si la route est publique, laisser passer quand même
      const response = requiresAuth
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // ✅ Pas de token + route publique → accès autorisé
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