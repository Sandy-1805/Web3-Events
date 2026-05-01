'use client';

// app/admin/speakers/page.tsx
// CORRECTIONS THÈME :
// - bg-[#0a0a0f] → géré par admin/layout.tsx
// - bg-white/5 bg-white/10 border-white/10 → .es-card
// - text-white → var(--es-text-1)
// - text-gray-400/500 → var(--es-text-2) / var(--es-text-3)
// - bg-white/10 border-white/20 input → .es-input

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
  socialLinks: string;
}

export default function AdminSpeakersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') fetchSpeakers();
  }, [user]);

  useEffect(() => {
    const filtered = allSpeakers.filter(speaker =>
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSpeakers(filtered);
    setCurrentPage(1);
  }, [searchTerm, allSpeakers]);

  const fetchSpeakers = async () => {
    try {
      const res = await fetch('/api/speakers');
      const data = await res.json();
      setAllSpeakers(data);
      setFilteredSpeakers(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSpeaker = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet intervenant ?')) return;
    try {
      const res = await fetch(`/api/speakers/${id}`, { method: 'DELETE' });
      if (res.ok) setAllSpeakers(allSpeakers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const totalPages = Math.ceil(filteredSpeakers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpeakers = filteredSpeakers.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

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
          <h1 className="es-page-title">Gestion des intervenants</h1>
          <Link href="/admin/speakers/create" className="es-btn-primary">
            + Nouvel intervenant
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="🔍 Rechercher un intervenant..."
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
            {filteredSpeakers.length} intervenant(s)
          </p>
        </div>

        {/* Liste vide */}
        {filteredSpeakers.length === 0 ? (
          <div className="es-card p-12 text-center">
            <p style={{ color: 'var(--es-text-2)' }}>Aucun intervenant trouvé</p>
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
            {/* Grille de cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSpeakers.map((speaker) => (
                <div key={speaker.id} className="es-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--es-text-1)' }}>
                      {speaker.name}
                    </h3>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/speakers/${speaker.id}/edit`}
                        style={{ color: 'var(--es-accent)', fontSize: '0.875rem' }}
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => deleteSpeaker(speaker.id)}
                        style={{ color: 'var(--es-live)', fontSize: '0.875rem' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {speaker.bio && (
                    <p className="mt-2 text-sm line-clamp-3" style={{ color: 'var(--es-text-2)' }}>
                      {speaker.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
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
    </div>
  );
}
