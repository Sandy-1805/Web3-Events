import { db } from '@/lib/db/index';
import { events, sessions, sessionSpeakers, speakers } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import Link from 'next/link';
import PlanningGrid from '@/components/events/PlanningGrid';

async function getSpeakersForSessions(sessionIds: number[]) {
  if (sessionIds.length === 0) return {};

  // Utiliser inArray au lieu de SQL manuel
  const result = await db
    .select({
      sessionId: sessionSpeakers.sessionId,
      speakerId: speakers.id,
      name: speakers.name,
      photo: speakers.photo,
      bio: speakers.bio,
      socialLinks: speakers.socialLinks,
    })
    .from(sessionSpeakers)
    .leftJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
    .where(inArray(sessionSpeakers.sessionId, sessionIds));

  const speakersBySession: Record<number, any[]> = {};
  result.forEach((row: any) => {
    if (!speakersBySession[row.sessionId]) speakersBySession[row.sessionId] = [];
    if (row.speakerId) {
      speakersBySession[row.sessionId].push({
        id: row.speakerId,
        name: row.name,
        photo: row.photo,
        bio: row.bio,
        socialLinks: row.socialLinks,
      });
    }
  });

  return speakersBySession;
}

export default async function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = parseInt(id);

  // Récupérer l'événement
  const eventResult = await db.select().from(events).where(eq(events.id, eventId));
  const event = eventResult[0];

  // Récupérer les sessions de l'événement
  const allSessions = await db.select().from(sessions).where(eq(sessions.eventId, eventId));

  // Récupérer les speakers pour chaque session
  const sessionIds = allSessions.map(s => s.id);
  const speakersBySession = await getSpeakersForSessions(sessionIds);

  // Formater les sessions avec leurs speakers et dates en objets Date
  const sessionsWithSpeakers = allSessions.map(session => ({
    ...session,
    startTime: new Date(session.startTime),
    endTime: new Date(session.endTime),
    speakers: speakersBySession[session.id] || [],
  }));

  // Extraire les salles uniques
  const rooms = [...new Set(sessionsWithSpeakers.map(s => s.room))];

  // Vérifier si l'événement existe
  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 text-center">
        <p className="text-red-400">Événement non trouvé</p>
        <Link href="/events" className="mt-4 inline-block text-[#6366f1] hover:underline">
          ← Retour aux événements
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/events/${eventId}`} className="text-[#6366f1] hover:underline">
            ← Retour à l'événement
          </Link>
          <Link
            href={`/events/${eventId}`}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
          >
            📋 Vue liste
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
        <p className="text-gray-400 mb-6">Planning multi-track par salle</p>

        <PlanningGrid
          sessions={sessionsWithSpeakers}
          rooms={rooms}
          eventId={eventId}
        />
      </div>
    </div>
  );
}