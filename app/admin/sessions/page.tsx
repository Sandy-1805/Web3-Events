'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    sessionId: null as number | null,
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

  useEffect(() => {
    let filtered = [...allSessions];

    // Filtre par événement
    if (selectedEventId !== 'all') {
      filtered = filtered.filter(s => s.eventId === selectedEventId);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedEventId, allSessions]);

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
      setAllSessions(data);
      setFilteredSessions(data);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number, title: string) => {
    setModalConfig({ isOpen: true, sessionId: id, sessionTitle: title });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, sessionId: null, sessionTitle: '' });
  };

  const confirmDelete = async () => {
    if (!modalConfig.sessionId) return;
    try {
      const response = await fetch(`/api/session/${modalConfig.sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setAllSessions(allSessions.filter(s => s.id !== modalConfig.sessionId));
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

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Gestion des sessions
          </h1>
          <Link
            href="/admin/sessions/create"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + Nouvelle session
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Filtrer par événement
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all" className="bg-[#0a0a0f] text-white">Tous les événements</option>
                {events.map(event => (
                  <option key={event.id} value={event.id} className="bg-[#0a0a0f] text-white">
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="🔍 Titre, description ou salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
              />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-3">{filteredSessions.length} session(s)</p>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">Aucune session trouvée</p>
            {(searchTerm || selectedEventId !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedEventId('all'); }}
                className="mt-4 text-[#6366f1] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <ul className="divide-y divide-white/10">
                {paginatedSessions.map((session) => (
                  <li key={session.id} className="px-6 py-4 hover:bg-white/5 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-medium text-white">{session.title}</h3>
                          <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded">
                            {getEventTitle(session.eventId)}
                          </span>
                        </div>
                        {session.description && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{session.description}</p>
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
                          className="text-[#a5b4fc] hover:text-white px-3 py-1 text-sm font-medium transition"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => openDeleteModal(session.id, session.title)}
                          className="text-red-400 hover:text-red-300 px-3 py-1 text-sm font-medium transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                >
                  ← Précédent
                </button>
                <span className="text-gray-400">Page {currentPage} / {totalPages}</span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

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