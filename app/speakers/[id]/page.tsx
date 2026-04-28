'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
  socialLinks: string;
}

interface Session {
  id: number;
  title: string;
  startTime: string;
  room: string;
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
      fetchSpeaker();
      fetchSpeakerSessions();
    }
  }, [speakerId]);

  const fetchSpeaker = async () => {
    try {
      const response = await fetch(`/api/speakers/${speakerId}`);
      if (!response.ok) throw new Error('Intervenant non trouvé');
      const data = await response.json();
      setSpeaker(data);
    } catch (err) {
      setError('Impossible de charger l\'intervenant');
      console.error(err);
    }
  };

  const fetchSpeakerSessions = async () => {
    try {
      // Récupérer toutes les sessions et filtrer par speaker via session_speakers
      const response = await fetch('/api/session');
      const allSessions = await response.json();
      // Pour l'instant, afficher juste un message - la relation sera implémentée plus tard
      setSessions([]);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseSocialLinks = () => {
    if (!speaker?.socialLinks) return {};
    try {
      return JSON.parse(speaker.socialLinks);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-400">{error || 'Intervenant non trouvé'}</p>
          <Link href="/speakers" className="mt-4 inline-block text-[#6366f1] hover:underline">
            ← Retour aux intervenants
          </Link>
        </div>
      </div>
    );
  }

  const socialLinks = parseSocialLinks();

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/speakers" className="text-[#6366f1] hover:underline">
            ← Retour à la liste des intervenants
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] flex items-center justify-center text-5xl">
              🎤
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{speaker.name}</h1>

            {Object.keys(socialLinks).length > 0 && (
              <div className="flex justify-center gap-3 mb-6">
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    𝕏
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    in
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    🐙
                  </a>
                )}
              </div>
            )}

            {speaker.bio && (
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white mb-3">Biographie</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{speaker.bio}</p>
              </div>
            )}

            {sessions.length > 0 && (
              <div className="text-left mt-6">
                <h2 className="text-xl font-semibold text-white mb-3">Sessions animées</h2>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <Link key={session.id} href={`/sessions/${session.id}`}>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition">
                        <p className="text-white font-medium">{session.title}</p>
                        <p className="text-gray-500 text-sm">{session.room} • {new Date(session.startTime).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}