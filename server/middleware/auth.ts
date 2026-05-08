import { verifyToken } from '../utils/jwt';
import type { NextRequest } from 'next/server';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'participant';
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Non autorisé');
  }
  return user;
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') {
    throw new Error('Accès réservé aux administrateurs');
  }
  return user;
}

export function withAuth(handler: Function, requiresAdmin: boolean = false) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      if (requiresAdmin) {
        await requireAdmin(request);
      }
      return await handler(request, ...args);
    } catch (error: any) {
      return Response.json(
        { error: error.message || 'Non autorisé' },
        { status: 401 }
      );
    }
  };
}