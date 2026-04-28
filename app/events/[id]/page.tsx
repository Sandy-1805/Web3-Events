// app/events/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [rooms, setRooms] = useState<string[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    room: '',
    capacity: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    if (!newSession.title || !newSession.startTime || !newSession.endTime || !newSession.room) {
      setFormError('Veuillez remplir tous les champs obligatoires');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSession.title,
          description: newSession.description || null,
          startTime: newSession.startTime,
          endTime: newSession.endTime,
          room: newSession.room,
          capacity: newSession.capacity ? parseInt(newSession.capacity) : null,
          eventId: parseInt(eventId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setNewSession({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        room: '',
        capacity: '',
      });
      setShowSessionForm(false);
      fetchSessions();
      
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* Lien retour et bouton ajout session */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/events" className="text-[#6366f1] hover:underline">
            ← Retour à la liste des événements
          </Link>
          
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowSessionForm(!showSessionForm)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
            >
              {showSessionForm ? 'Annuler' : '+ Ajouter une session'}
            </button>
          )}
        </div>

        {/* Formulaire d'ajout de session */}
        {showSessionForm && user?.role === 'admin' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Ajouter une session à "{event.title}"</h2>
            
            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Début *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Salle *</label>
                  <input
                    type="text"
                    required
                    value={newSession.room}
                    onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Capacité</label>
                  <input
                    type="number"
                    value={newSession.capacity}
                    onChange={(e) => setNewSession({ ...newSession, capacity: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSessionForm(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submitting ? 'Création...' : 'Créer la session'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Informations de l'événement */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mb-4 text-gray-400">
              <div className="flex items-center gap-2">📅 {new Date(event.startDate).toLocaleDateString('fr-FR')}</div>
              <div className="flex items-center gap-2">
                ⏰ {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {event.location && <div className="flex items-center gap-2">📍 {event.location}</div>}
            </div>
            {event.description && <p className="text-gray-300 leading-relaxed">{event.description}</p>}
          </div>
        </div>

        {/* Filtre par salle */}
        {rooms.length > 1 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Filtrer par salle</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Toutes les salles</option>
              {rooms.map(room => <option key={room} value={room}>{room}</option>)}
            </select>
          </div>
        )}

        {/* Sessions en live */}
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
                <SessionCard key={session.id} session={session} isLive={true} isAdmin={user?.role === 'admin'} onSessionDeleted={fetchSessions} />
              ))}
            </div>
          </div>
        )}

        {/* Autres sessions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {liveSessions.length > 0 ? 'À venir' : 'Toutes les sessions'}
          </h2>
          {upcomingSessions.length === 0 && liveSessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <p className="text-gray-400">Aucune session pour le moment</p>
              {user?.role === 'admin' && !showSessionForm && (
                <button onClick={() => setShowSessionForm(true)} className="mt-4 text-[#6366f1] hover:underline">
                  Créer la première session
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} isLive={false} isAdmin={user?.role === 'admin'} onSessionDeleted={fetchSessions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant SessionCard - CORRIGÉ : le Link englobe toute la carte
function SessionCard({ session, isLive, isAdmin, onSessionDeleted }: { 
  session: Session; 
  isLive: boolean; 
  isAdmin: boolean;
  onSessionDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Empêche la navigation
    e.stopPropagation(); // Empêche la propagation
    if (!confirm(`Supprimer la session "${session.title}" ?`)) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/session/${session.id}`, { method: 'DELETE' });
      if (response.ok) {
        onSessionDeleted();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Fonction pour gérer le clic sur la carte
  const handleCardClick = () => {
    router.push(`/sessions/${session.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">{session.title}</h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 text-sm transition disabled:opacity-50"
            >
              {deleting ? '...' : '🗑️'}
            </button>
          )}
        </div>
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
  );
}