// app/favorites/page.tsx
// ⭐ Page des favoris personnels du participant
// SPEC §4.8 : "Stockage réalisé côté navigateur (local)"
// → On utilise localStorage, PAS la base de données
// → Accessible sans login (stockage local = propre à chaque navigateur)
//
// 💡 Pourquoi localStorage ?
//   localStorage est un espace de stockage dans le navigateur de l'utilisateur.
//   Les données persistent même après fermeture de l'onglet (contrairement à sessionStorage).
//   Elles sont supprimées si l'utilisateur vide son cache.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FavoriteSession {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  room: string;
  eventId: number;
}

// Clé utilisée dans localStorage pour stocker les favoris
const FAVORITES_KEY = 'eventsync_favorites';

// Récupère les IDs des sessions favorites depuis le localStorage
export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') return []; // SSR guard
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Ajoute ou retire un favori
export function toggleFavorite(sessionId: number): boolean {
  const ids = getFavoriteIds();
  const index = ids.indexOf(sessionId);
  if (index === -1) {
    ids.push(sessionId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return true; // ajouté
  } else {
    ids.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    return false; // retiré
  }
}

// Vérifie si une session est favorite
export function isFavorite(sessionId: number): boolean {
  return getFavoriteIds().includes(sessionId);
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    // 1. Récupérer les IDs depuis localStorage
    const ids = getFavoriteIds();

    if (ids.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // 2. Récupérer les détails de chaque session via l'API
    // On utilise Promise.all pour faire les appels en parallèle (plus rapide)
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/session/${id}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );

      // Filtrer les sessions qui n'existent plus (null)
      const validSessions = results.filter(Boolean) as FavoriteSession[];
      setFavorites(validSessions);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (sessionId: number) => {
    toggleFavorite(sessionId); // retire du localStorage
    setFavorites((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const isLive = (startTime: string, endTime: string) => {
    const now = new Date();
    return now >= new Date(startTime) && now <= new Date(endTime);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement de vos favoris...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ⭐ Mes favoris
          </h1>
          <p className="text-gray-400 mt-2">Votre itinéraire personnel — sauvegardé dans votre navigateur</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">Aucune session favorite</p>
            <p className="text-gray-500 text-sm mb-6">
              Ajoutez des sessions depuis le planning en cliquant sur ⭐
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558dd] transition"
            >
              Découvrir des événements →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4 text-center">
              {favorites.length} session{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {favorites.map((session) => {
                const live = isLive(session.startTime, session.endTime);
                return (
                  <div
                    key={session.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Lien vers le détail de la session */}
                      <Link href={`/sessions/${session.id}`} className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-white hover:text-[#a5b4fc] transition">
                            {session.title}
                          </h3>
                          {live && (
                            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                              🔴 LIVE
                            </span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span>
                            📅 {new Date(session.startTime).toLocaleDateString('fr-FR')}
                          </span>
                          <span>
                            ⏰{' '}
                            {new Date(session.startTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>🚪 {session.room}</span>
                        </div>
                      </Link>

                      {/* Bouton retirer */}
                      <button
                        onClick={() => removeFavorite(session.id)}
                        className="text-gray-500 hover:text-red-400 transition ml-4 p-1"
                        title="Retirer des favoris"
                        aria-label="Retirer des favoris"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}