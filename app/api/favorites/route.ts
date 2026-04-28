import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { favorites, sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sql } from 'drizzle-orm';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token.value, secret);
    return payload.id as number;
  } catch {
    return null;
  }
}

// GET - Récupérer les favoris de l'utilisateur
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    if (userFavorites.length === 0) {
      return NextResponse.json([]);
    }

    const sessionIds = userFavorites.map(f => f.sessionId);
    const favoriteSessions = await db
      .select()
      .from(sessions)
      .where(sql`id IN (${sessionIds.join(',')})`);

    return NextResponse.json(favoriteSessions);
  } catch (error) {
    console.error('Erreur GET favoris:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un favori
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.sessionId, sessionId)));

    if (existing.length === 0) {
      await db.insert(favorites).values({ userId, sessionId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST favori:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un favori
export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.sessionId, sessionId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE favori:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}