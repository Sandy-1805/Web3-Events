// app/api/events/[id]/sessions/route.ts
// 📋 Récupérer toutes les sessions d'un événement
// ACCÈS : public
// Utilisé par : page planning salle, page événement

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const eventSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, eventId))
      .orderBy(sessions.startTime); // tri chronologique

    return NextResponse.json(eventSessions);
  } catch (error) {
    console.error('Erreur GET sessions by event:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}