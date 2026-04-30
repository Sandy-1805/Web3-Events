// app/events/[id]/rooms/[room]/page.tsx
// 🚪 Vue Planning par Salle (spec §4.7)
// Affiche les sessions d'une salle spécifique dans un événement
// ACCÈS : public
// URL exemple : /events/1/rooms/Salle%20A

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number | null;
  eventId: number;
}

interface Speaker {
  id: number;
  name: string;
}

interface SessionWithSpeakers extends Session {
  speakers: Speaker[];
}

function isLive(startTime: string, endTime: string): boolean {
  const now = new Date();
  return now >= new Date(startTime) && now <= new Date(endTime);
}

export default function RoomPlanningPage() {
  const params = useParams();
  const eventId = params.id as string;
  // Next.js encode les espaces dans l'URL → on décode ici
  const room = decodeURIComponent(params.room as string);

  const [sessions, setSessions] = useState<SessionWithSpeakers[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId && room) {
      fetchData();
    }
  }, [eventId, room]);

  const fetchData = async () => {
    try {
      // 1. Récupérer l'événement (pour afficher le titre)
      const eventRes = await fetch(`/api/events/${eventId}`);
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setEventTitle(eventData.title);
      }

      // 2. Récupérer toutes les sessions de l'événement
      const sessionsRes = await fetch(`/api/events/${eventId}/sessions`);
      if (!sessionsRes.ok) throw new Error('Erreur chargement sessions');
      const allSessions: Session[] = await sessionsRes.json();

      // 3. Filtrer par salle (comparaison insensible à la casse)
      const roomSessions = allSessions.filter(
        (s) => s.room.toLowerCase() === room.toLowerCase()
      );

      // 4. Pour chaque session, récupérer ses intervenants
      const sessionsWithSpeakers = await Promise.all(
        roomSessions.map(async (session) => {
          try {
            const spkRes = await fetch(`/api/session/${session.id}`);
            if (spkRes.ok) {
              const detail = await spkRes.json();
              return { ...session, speakers: detail.speakers || [] };
            }
          } catch {
            // Silencieux si erreur sur un speaker
          }
          return { ...session, speakers: [] };
        })
      );

      // Tri chronologique
      sessionsWithSpeakers.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setSessions(sessionsWithSpeakers);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les sessions de cette salle');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 text-center">
        <p className="text-red-400">{error}</p>
        <Link href={`/events/${eventId}`} className="mt-4 inline-block text-[#6366f1] hover:underline">
          ← Retour à l'événement
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/events/${eventId}`} className="text-[#6366f1] hover:underline">
            ← Retour à l'événement
          </Link>
          <Link
            href={`/events/${eventId}/planning`}
            className="text-sm px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
          >
            📊 Vue planning global
          </Link>
        </div>

        {/* En-tête */}
        <div className="mb-8">
          {eventTitle && (
            <p className="text-gray-400 text-sm mb-1">{eventTitle}</p>
          )}
          <h1 className="text-3xl font-bold text-white">🚪 {room}</h1>
          <p className="text-gray-400 mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} dans cette salle
          </p>
        </div>

        {/* Liste des sessions */}
        {sessions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucune session dans cette salle</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const live = isLive(session.startTime, session.endTime);
              return (
                <div
                  key={session.id}
                  className={`bg-white/5 border rounded-xl p-5 transition-all ${
                    live
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <Link href={`/sessions/${session.id}`} className="flex-1">
                      {/* Heure */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-[#a5b4fc] font-mono text-sm font-bold">
                          {new Date(session.startTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          →{' '}
                          {new Date(session.endTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {/* Badge LIVE */}
                        {live && (
                          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            🔴 LIVE
                          </span>
                        )}
                      </div>

                      {/* Titre */}
                      <h3 className="text-lg font-semibold text-white hover:text-[#a5b4fc] transition mb-2">
                        {session.title}
                      </h3>

                      {/* Intervenants */}
                      {session.speakers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {session.speakers.map((spk) => (
                            <span
                              key={spk.id}
                              className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full"
                            >
                              🎤 {spk.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>

                    {/* Bouton favori (localStorage) */}
                    <FavoriteButton
                      sessionId={session.id}
                      className="text-xl text-gray-500 hover:text-yellow-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}