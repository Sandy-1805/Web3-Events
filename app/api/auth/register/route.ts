import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Empêcher l'inscription avec l'email admin
    if (email === 'admin@eventsync.com') {
      return NextResponse.json(
        { error: 'Cet email est réservé' },
        { status: 403 }
      );
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'participant', // Force le rôle participant
    }).returning();

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}