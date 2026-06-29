import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sessions, sessionSpeakers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← await obligatoire en Next.js 15
    const speakerId = parseInt(id);

    if (isNaN(speakerId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Jointure : on cherche toutes les sessions liées à cet intervenant
    // via la table de jointure session_speakers
    const result = await db
      .select({
        id: sessions.id,
        title: sessions.title,
        description: sessions.description,
        startTime: sessions.startTime,
        endTime: sessions.endTime,
        room: sessions.room,
        capacity: sessions.capacity,
        eventId: sessions.eventId,
      })
      .from(sessionSpeakers)
      .innerJoin(sessions, eq(sessionSpeakers.sessionId, sessions.id))
      .where(eq(sessionSpeakers.speakerId, speakerId))
      .orderBy(sessions.startTime); // tri chronologique

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur GET sessions du speaker:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}