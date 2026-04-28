// app/api/session/[id]/route.ts
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
  { params }: { params: Promise<{ id: string }> }  // ← ICI: params est une Promise
) {
  try {
    const { id } = await params;  // ← ICI: attendre params
    const sessionList = await db.select().from(sessions).where(eq(sessions.id, parseInt(id)));

    if (sessionList.length === 0) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    return NextResponse.json(sessionList[0]);
  } catch (error) {
    console.error('Erreur GET session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Modifier une session (admin uniquement)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← IMPORTANT: Promise
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← IMPORTANT: await params
    const body = await request.json();
    const { title, description, startTime, endTime, room, capacity, eventId } = body;

    console.log('📝 Modification session ID:', id);
    console.log('📝 Données reçues:', { title, description, startTime, endTime, room, capacity, eventId });

    if (!title || !startTime || !endTime || !room || !eventId) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    const [updatedSession] = await db.update(sessions)
      .set({
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        room,
        capacity: capacity || null,
        eventId,
      })
      .where(eq(sessions.id, parseInt(id)))  // ← parseInt(id) et non params.id
      .returning();

    console.log('✅ Session modifiée:', updatedSession);
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('❌ Erreur PUT session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une session (admin uniquement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← ICI: params est une Promise
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← ICI: attendre params
    const sessionId = parseInt(id);
    
    console.log('🗑️ Suppression session ID:', sessionId);

    // 1. Supprimer d'abord les questions liées à cette session
    await db.delete(questions).where(eq(questions.sessionId, sessionId));
    console.log('✅ Questions supprimées');

    // 2. Supprimer la session
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    console.log('✅ Session supprimée');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur DELETE session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression: ' + (error as Error).message },
      { status: 500 }
    );
  }
}