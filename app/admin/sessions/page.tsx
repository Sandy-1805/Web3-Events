// app/admin/sessions/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';  // ← Import du modal

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

interface Event {
  id: number;
  title: string;
}

export default function AdminSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all');
  
  // États pour la modale
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    sessionId: number | null;
    sessionTitle: string;
  }>({
    isOpen: false,
    sessionId: null,
    sessionTitle: '',
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEvents();
      fetchSessions();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/session');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvrir la modale de confirmation
  const openDeleteModal = (id: number, title: string) => {
    setModalConfig({
      isOpen: true,
      sessionId: id,
      sessionTitle: title,
    });
  };

  // Fermer la modale
  const closeModal = () => {
    setModalConfig({ isOpen: false, sessionId: null, sessionTitle: '' });
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!modalConfig.sessionId) return;

    try {
      const response = await fetch(`/api/session/${modalConfig.sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== modalConfig.sessionId));
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      closeModal();
    }
  };

  const getEventTitle = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : `Événement #${eventId}`;
  };

  const filteredSessions = selectedEventId === 'all' 
    ? sessions 
    : sessions.filter(s => s.eventId === selectedEventId);

  if (loading || isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des sessions</h1>
          <Link
            href="/admin/sessions/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Nouvelle session
          </Link>
        </div>

        {/* Filtre par événement */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrer par événement
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Tous les événements</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune session pour le moment</p>
            <Link
              href="/admin/sessions/create"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Créer la première session
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <li key={session.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{session.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {getEventTitle(session.eventId)}
                        </span>
                      </div>
                      {session.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{session.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(session.startTime).toLocaleString('fr-FR')}</span>
                        <span>⏱️ Fin: {new Date(session.endTime).toLocaleString('fr-FR')}</span>
                        <span>🚪 Salle: {session.room}</span>
                        {session.capacity && <span>👥 Capacité: {session.capacity}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        href={`/admin/sessions/${session.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => openDeleteModal(session.id, session.title)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modale de confirmation */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer la session "${modalConfig.sessionTitle}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={closeModal}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="red"
      />
    </div>
  );
}