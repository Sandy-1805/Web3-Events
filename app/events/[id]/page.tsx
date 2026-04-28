'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

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

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchSessions();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Événement non trouvé');
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError('Impossible de charger l\'événement');
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/session');
      const allSessions: Session[] = await response.json();
      const eventSessions = allSessions.filter((s) => s.eventId === parseInt(eventId));
      setSessions(eventSessions);
      
      if (eventSessions.length > 0) {
        const uniqueRooms = [...new Set(eventSessions.map((s) => s.room))];
        setRooms(uniqueRooms);
      }
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const isLive = (session: Session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  const filteredSessions = selectedRoom === 'all'
    ? sessions
    : sessions.filter((s) => s.room === selectedRoom);

  const sortedSessions = [...filteredSessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const liveSessions = sortedSessions.filter(isLive);
  const upcomingSessions = sortedSessions.filter(s => !isLive(s));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center py-12">
          <p className="text-red-400">{error || 'Événement non trouvé'}</p>
          <Link href="/events" className="mt-4 inline-block text-[#6366f1] hover:underline">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Lien retour */}
        <div className="mb-6">
          <Link href="/events" className="text-[#6366f1] hover:underline">
            ← Retour à la liste des événements
          </Link>
        </div>

        {/* Informations de l'événement */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4 text-gray-400">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏰</span>
                <span>
                  {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            {event.description && (
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            )}
          </div>
        </div>

        {/* Filtre par salle */}
        {rooms.length > 1 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Filtrer par salle
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Toutes les salles</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sessions en cours (Live) */}
        {liveSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              En direct maintenant
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveSessions.map(session => (
                <SessionCard key={session.id} session={session} isLive={true} />
              ))}
            </div>
          </div>
        )}

        {/* À venir / Toutes les sessions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {liveSessions.length > 0 ? 'À venir' : 'Toutes les sessions'}
          </h2>
          {upcomingSessions.length === 0 && liveSessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <p className="text-gray-400">Aucune session pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} isLive={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, isLive }: { session: Session; isLive: boolean }) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{session.title}</h3>
          {isLive && (
            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mb-3">
          {formatDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>🚪</span>
          <span>{session.room}</span>
          {session.capacity && (
            <>
              <span className="mx-1">•</span>
              <span>👥 {session.capacity} places</span>
            </>
          )}
        </div>
        
        {session.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{session.description}</p>
        )}
      </div>
    </Link>
  );
}