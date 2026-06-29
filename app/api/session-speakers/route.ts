// app/api/session-speakers/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sessionSpeakers, speakers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
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

// GET - Récupérer les speakers d'une session
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId requis' }, { status: 400 });
  }

  try {
    const result = await db
      .select({
        id: speakers.id,
        name: speakers.name,
        photo: speakers.photo,
        bio: speakers.bio,
        socialLinks: speakers.socialLinks,
      })
      .from(sessionSpeakers)
      .innerJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
      .where(eq(sessionSpeakers.sessionId, parseInt(sessionId)));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur GET session-speakers:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un speaker à une session (admin uniquement)
export async function POST(request: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, speakerId } = body;

    if (!sessionId || !speakerId) {
      return NextResponse.json({ error: 'sessionId et speakerId requis' }, { status: 400 });
    }

    // Vérifier si le lien existe déjà
    const existing = await db
      .select()
      .from(sessionSpeakers)
      .where(
        and(
          eq(sessionSpeakers.sessionId, sessionId),
          eq(sessionSpeakers.speakerId, speakerId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Ce speaker est déjà assigné à cette session' }, { status: 400 });
    }

    const [newLink] = await db.insert(sessionSpeakers).values({
      sessionId,
      speakerId,
    }).returning();

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error('Erreur POST session-speaker:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'assignation' }, { status: 500 });
  }
}

// DELETE - Retirer un speaker d'une session (admin uniquement)
export async function DELETE(request: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const speakerId = searchParams.get('speakerId');

    if (!sessionId || !speakerId) {
      return NextResponse.json({ error: 'sessionId et speakerId requis' }, { status: 400 });
    }

    await db
      .delete(sessionSpeakers)
      .where(
        and(
          eq(sessionSpeakers.sessionId, parseInt(sessionId)),
          eq(sessionSpeakers.speakerId, parseInt(speakerId))
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE session-speaker:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}