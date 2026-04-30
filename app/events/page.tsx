'use client';

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

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Filtrer les événements
    const filtered = allEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEvents(filtered);
    setCurrentPage(1); // Revenir à la première page après recherche
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
      setLoading(false);
    }
  };

  // Pagination calculs
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement des événements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold tracking-wider text-[#6366f1] uppercase mb-3">
            Découvrir
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Tous nos événements
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Des rencontres uniques pour explorer les technologies émergentes.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1]"
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
          <p className="text-gray-500 text-sm mt-2 text-center">
            {filteredEvents.length} événement(s) trouvé(s)
          </p>
        </div>

        {/* Grille des événements */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-gray-400">Aucun événement trouvé</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#6366f1] hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <Link href={`/events/${event.id}`} key={event.id}>
                  <div className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">📅</div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.startDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#a5b4fc] transition">
                      {event.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {event.description || 'Aucune description'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{event.location || 'Lieu non spécifié'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
                >
                  ← Précédent
                </button>
                <span className="text-gray-400">
                  Page {currentPage} sur {totalPages}
                </span>
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
    </div>
  );
}