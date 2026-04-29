// app/events/[id]/planning/page.tsx
import { db } from '@/lib/db';
import { sessions, sessionSpeakers, speakers, events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import PlanningGrid from '@/components/events/PlanningGrid';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PlanningPage({ params }: PageProps) {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) notFound();

    // Fetch event
    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

    if (!event) notFound();

    // Fetch sessions with speakers
    const rawSessions = await db
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
        .from(sessions)
        .where(eq(sessions.eventId, eventId))
        .orderBy(sessions.startTime);

    // Fetch speakers for each session
    const sessionsWithSpeakers = await Promise.all(
        rawSessions.map(async (session) => {
            const speakerRows = await db
                .select({ speaker: speakers })
                .from(sessionSpeakers)
                .innerJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
                .where(eq(sessionSpeakers.sessionId, session.id));

            return {
                ...session,
                speakers: speakerRows.map((r) => r.speaker),
            };
        })
    );

    // Extract unique rooms in order of first appearance
    const rooms = Array.from(
        new Set(sessionsWithSpeakers.map((s) => s.room))
    );

    return (
        <div style={{ background: 'var(--es-bg-1)', minHeight: '100vh' }}>
            {/* Page header */}
            <div className="es-page-header">
                <div className="es-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Link
                            href={`/events/${eventId}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: 'var(--es-text-2)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--es-text-1)')}
                            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--es-text-2)')}
                        >
                            ← Retour à l&apos;événement
                        </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <span className="eventsync-section-tag">Planning</span>
                            <h1 className="es-page-title">{event.title}</h1>
                            <p style={{ color: 'var(--es-text-3)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                                {new Date(event.startDate).toLocaleDateString('fr-FR', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                                {' '}·{' '}
                                {rooms.length} salle{rooms.length > 1 ? 's' : ''}
                                {' '}·{' '}
                                {sessionsWithSpeakers.length} session{sessionsWithSpeakers.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link href={`/favorites`}>
                                <button className="es-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ★ Mes favoris
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Planning grid */}
            <div className="es-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                {sessionsWithSpeakers.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        color: 'var(--es-text-3)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
                        <p style={{ fontSize: '1.1rem' }}>Aucune session programmée pour cet événement</p>
                    </div>
                ) : (
                    <PlanningGrid sessions={sessionsWithSpeakers} rooms={rooms} eventId={eventId} />
                )}
            </div>
        </div>
    );
}