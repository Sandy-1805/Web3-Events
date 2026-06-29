// app/speakers/[id]/page.tsx
// 🎤 Page publique d'un intervenant
// ACCÈS : public (aucune authentification requise - spec §2.3)
// Affiche : photo, nom, bio, liens externes, sessions associées

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
  socialLinks: string; // stocké en JSON string dans la DB
}

interface Session {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  eventId: number;
}

// Petit helper pour parser les socialLinks (stockés en JSON)
function parseSocialLinks(raw: string): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Vérifie si une session est en cours maintenant
function isLive(startTime: string, endTime: string): boolean {
  const now = new Date();
  return now >= new Date(startTime) && now <= new Date(endTime);
}

export default function SpeakerDetailPage() {
  const params = useParams();
  const speakerId = params.id as string;

  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (speakerId) {
      // Lancer les deux fetch en parallèle pour aller plus vite
      Promise.all([fetchSpeaker(), fetchSpeakerSessions()]).finally(() =>
        setLoading(false)
      );
    }
  }, [speakerId]);

  const fetchSpeaker = async () => {
    try {
      const response = await fetch(`/api/speakers/${speakerId}`);
      if (!response.ok) throw new Error('Intervenant non trouvé');
      const data = await response.json();
      setSpeaker(data);
    } catch (err) {
      setError("Impossible de charger l'intervenant");
      console.error(err);
    }
  };

  const fetchSpeakerSessions = async () => {
    try {
      // Utilise la nouvelle route API /api/speakers/[id]/sessions
      const response = await fetch(`/api/speakers/${speakerId}/sessions`);
      if (!response.ok) return;
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 text-center">
        <p className="text-red-400">{error || 'Intervenant non trouvé'}</p>
        <Link href="/speakers" className="mt-4 inline-block text-[#6366f1] hover:underline">
          ← Retour aux intervenants
        </Link>
      </div>
    );
  }

  const socialLinks = parseSocialLinks(speaker.socialLinks);

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retour */}
        <div className="mb-8">
          <Link href="/speakers" className="text-[#6366f1] hover:underline">
            ← Tous les intervenants
          </Link>
        </div>

        {/* Carte profil */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photo de profil */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
              {speaker.photo ? (
                <img
                  src={speaker.photo}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si l'image ne charge pas, afficher l'emoji par défaut
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                '🎤'
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{speaker.name}</h1>

              {/* Liens externes */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-3">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#a5b4fc] hover:text-[#6366f1] underline transition"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Biographie */}
          {speaker.bio && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">À propos</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {speaker.bio}
              </p>
            </div>
          )}
        </div>

        {/* Sessions de l'intervenant */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Sessions ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
              Aucune session assignée pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const live = isLive(session.startTime, session.endTime);
                return (
                  <Link key={session.id} href={`/sessions/${session.id}`}>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">
                              {session.title}
                            </h3>
                            {/* Badge LIVE si la session est en cours */}
                            {live && (
                              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                🔴 LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span>
                              📅{' '}
                              {new Date(session.startTime).toLocaleDateString('fr-FR')}
                            </span>
                            <span>
                              ⏰{' '}
                              {new Date(session.startTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              →{' '}
                              {new Date(session.endTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>🚪 {session.room}</span>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}