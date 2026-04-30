'use client';

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
    if (user?.role === 'admin') {
      fetchSpeakers();
    }
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
      const response = await fetch('/api/speakers');
      const data = await response.json();
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
      const response = await fetch(`/api/speakers/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAllSpeakers(allSpeakers.filter(s => s.id !== id));
      }
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
            Gestion des intervenants
          </h1>
          <Link
            href="/admin/speakers/create"
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
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
          <p className="text-gray-500 text-sm mt-2">{filteredSpeakers.length} intervenant(s)</p>
        </div>

        {filteredSpeakers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucun intervenant trouvé</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mt-4 text-[#6366f1] hover:underline">
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSpeakers.map((speaker) => (
                <div key={speaker.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{speaker.name}</h3>
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/speakers/${speaker.id}/edit`}
                          className="text-[#a5b4fc] hover:text-white transition"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => deleteSpeaker(speaker.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    {speaker.bio && (
                      <p className="mt-2 text-gray-400 text-sm line-clamp-3">{speaker.bio}</p>
                    )}
                  </div>
                </div>
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
    </div>
  );
}