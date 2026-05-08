import { AuthService } from '../services/authService';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '../utils/jwt';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/validation';
import { NextResponse } from 'next/server';  // ← Ajouter cet import
import type { NextRequest } from 'next/server';

const authService = new AuthService();

export class AuthController {
  async login(request: NextRequest) {
    try {
      const body = await request.json();
      const email = sanitizeInput(body.email);
      const password = body.password;

      if (!email || !password) {
        return NextResponse.json(  // ← utiliser NextResponse
          { error: 'Email et mot de passe requis' },
          { status: 400 }
        );
      }

      const result = await authService.login(email, password);

      if (!result) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // ✅ Utiliser NextResponse au lieu de Response
      const response = NextResponse.json(result.user);
      response.cookies.set(COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la connexion' },
        { status: 500 }
      );
    }
  }

  async register(request: NextRequest) {
    try {
      const body = await request.json();
      const name = sanitizeInput(body.name);
      const email = sanitizeInput(body.email);
      const password = body.password;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Tous les champs sont requis' },
          { status: 400 }
        );
      }

      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Email invalide' },
          { status: 400 }
        );
      }

      if (!validatePassword(password)) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        );
      }

      const user = await authService.register(name, email, password);

      if (!user) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé ou réservé' },
          { status: 400 }
        );
      }

      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      console.error('Register error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }
  }

  async me(request: NextRequest) {
    try {
      const token = request.cookies.get(COOKIE_NAME)?.value;

      if (!token) {
        return NextResponse.json({ user: null });
      }

      const user = await authService.getMe(token);
      return NextResponse.json({ user });
    } catch (error) {
      console.error('Me error:', error);
      return NextResponse.json({ user: null });
    }
  }

  async logout() {
    // ✅ Utiliser NextResponse
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}