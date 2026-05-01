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
    if (user?.role === 'admin') fetchEvents();
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
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // Loading state - utilise les variables CSS pour le thème
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--es-text-3)' }}>Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="es-page-title">Gestion des événements</h1>
          <Link href="/admin/events/create" className="es-btn-primary">
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
              className="es-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--es-text-3)' }}
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--es-text-3)' }}>
            {filteredEvents.length} événement(s)
          </p>
        </div>

        {/* Liste vide */}
        {filteredEvents.length === 0 ? (
          <div className="es-card p-12 text-center">
            <p style={{ color: 'var(--es-text-2)' }}>Aucun événement trouvé</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4"
                style={{ color: 'var(--es-accent)' }}
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Tableau */}
            <div className="es-table-container">
              <table className="es-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Dates</th>
                    <th>Lieu</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td style={{ color: 'var(--es-text-2)', fontSize: '0.875rem' }}>
                        {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ color: 'var(--es-text-2)', fontSize: '0.875rem' }}>
                        {event.location || '—'}
                      </td>
                      <td>
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            style={{ color: 'var(--es-accent)', fontSize: '0.875rem' }}
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => openDeleteModal(event.id, event.title)}
                            style={{ color: 'var(--es-live)', fontSize: '0.875rem' }}
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
                  className="es-btn-secondary"
                  style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ← Précédent
                </button>
                <span style={{ color: 'var(--es-text-2)' }}>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="es-btn-secondary"
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modale de suppression - utilise les variables CSS */}
      {modalConfig.isOpen && (
        <div className="es-modal-overlay">
          <div className="es-modal">
            <div className="text-center mb-4">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(244, 63, 94, 0.15)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--es-live)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--es-text-1)' }}>
                Confirmer la suppression
              </h3>
              <p style={{ color: 'var(--es-text-2)' }}>
                Êtes-vous sûr de vouloir supprimer &ldquo;{modalConfig.eventTitle}&rdquo; ?
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={closeModal} className="es-btn-secondary px-4 py-2">
                Annuler
              </button>
              <button onClick={confirmDelete} className="es-btn-danger es-btn-secondary px-4 py-2">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
