'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  eventId: number;
}

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (sessionId: number) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setFavorites(favorites.filter(f => f.id !== sessionId));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ⭐ Mes favoris
          </h1>
          <p className="text-gray-400 mt-2">Les sessions que vous avez sauvegardées</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400">Aucune session favorite</p>
            <Link href="/events" className="mt-4 inline-block text-[#6366f1] hover:underline">
              Découvrir des sessions →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map(session => (
              <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition">
                <div className="flex justify-between items-start">
                  <Link href={`/sessions/${session.id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-white hover:text-[#a5b4fc] transition">
                      {session.title}
                    </h3>
                    {session.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{session.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>📅 {new Date(session.startTime).toLocaleDateString('fr-FR')}</span>
                      <span>⏰ {new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>🚪 {session.room}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(session.id)}
                    className="text-red-400 hover:text-red-300 transition ml-4"
                    title="Retirer des favoris"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}