// types/auth.ts
// 📌 Types TypeScript partagés pour l'authentification
// Ces types sont utilisés dans useAuth, les API routes, et les composants

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'participant';
}

// Ce que le JWT contient dans son payload
export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'participant';
  iat?: number; // issued at (automatique)
  exp?: number; // expiration (automatique)
}

// Réponse de l'API /api/auth/me
export interface AuthMeResponse {
  user: User | null;
}

// Corps de la requête de login
export interface LoginPayload {
  email: string;
  password: string;
}

// Corps de la requête d'inscription
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}