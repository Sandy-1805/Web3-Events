'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

export default function AdminEventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    eventId: null as number | null,
    eventTitle: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    const filtered = allEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchTerm, allEvents]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setAllEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number, title: string) => {
    setModalConfig({ isOpen: true, eventId: id, eventTitle: title });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, eventId: null, eventTitle: '' });
  };

  const confirmDelete = async () => {
    if (!modalConfig.eventId) return;
    try {
      const response = await fetch(`/api/events/${modalConfig.eventId}`, { method: 'DELETE' });
      if (response.ok) {
        setAllEvents(allEvents.filter(e => e.id !== modalConfig.eventId));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      closeModal();
    }
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
            Gestion des événements
          </h1>
          <Link
            href="/admin/events/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + Nouvel événement
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="🔍 Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-2">{filteredEvents.length} événement(s)</p>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucun événement trouvé</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mt-4 text-[#6366f1] hover:underline">
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Titre</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Dates</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Lieu</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-white">{event.title}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{event.location || '—'}</td>
                      <td className="p-4">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-[#a5b4fc] hover:text-white transition"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => openDeleteModal(event.id, event.title)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Modale */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d0d14] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-400">
                Êtes-vous sûr de vouloir supprimer "{modalConfig.eventTitle}" ?
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}