import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sessions, questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

// GET - Détail d'une session
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await db.select().from(sessions).where(eq(sessions.id, parseInt(params.id)));

    if (session.length === 0) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    return NextResponse.json(session[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier une session (admin uniquement)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, room, capacity, eventId } = body;

    const [updatedSession] = await db.update(sessions)
      .set({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        room,
        capacity,
        eventId,
      })
      .where(eq(sessions.id, parseInt(params.id)))
      .returning();

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE - Supprimer une session (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await db.delete(sessions).where(eq(sessions.id, parseInt(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}