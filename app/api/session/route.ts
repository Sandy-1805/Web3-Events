// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sessions } from '@/lib/db/schema';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token.value, secret);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// GET - Liste des sessions (public)
export async function GET() {
  try {
    const allSessions = await db.select().from(sessions);
    return NextResponse.json(allSessions);
  } catch (error) {
    console.error('Erreur GET /api/sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une session (admin uniquement)
export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('📝 Body reçu:', body);
    
    const { title, description, startTime, endTime, room, capacity, eventId } = body;

    // Validation
    if (!title || !startTime || !endTime || !room || !eventId) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires ne sont pas remplis' },
        { status: 400 }
      );
    }

    const [newSession] = await db.insert(sessions).values({
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      room,
      capacity: capacity || null,
      eventId,
    }).returning();

    console.log('✅ Session créée:', newSession);
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur POST /api/sessions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création: ' + (error as Error).message },
      { status: 500 }
    );
  }
}