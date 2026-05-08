import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from '@/shared/types';

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);
export const JWT_EXPIRATION = '24h';
export const COOKIE_NAME = 'token';
export const COOKIE_MAX_AGE = 60 * 60 * 24;

export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}