import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../utils/jwt';
import type { User, LoginPayload, RegisterPayload } from '@/shared/types';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: User } | null> {
    const userList = await db.select().from(users).where(eq(users.email, email));

    if (userList.length === 0) return null;

    const user = userList[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return null;

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'participant',
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'participant',
      },
    };
  }

  async register(name: string, email: string, password: string): Promise<User | null> {
    // Vérifier si l'utilisateur existe déjà
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) return null;

    // Empêcher l'inscription avec l'email admin
    if (email === 'admin@eventsync.com') return null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'participant',
    }).returning();

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'admin' | 'participant',
    };
  }

  async getMe(token: string): Promise<User | null> {
    const payload = await verifyToken(token);
    if (!payload) return null;

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  }
}