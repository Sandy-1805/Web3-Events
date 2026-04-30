'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  photo: string;
}

export default function SpeakersPage() {
  const router = useRouter();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const response = await fetch('/api/speakers');

      if (response.status === 401) {
        // Non autorisé -> rediriger vers login
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Erreur chargement');

      const data = await response.json();
      setSpeakers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les intervenants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#0a0a0f]">
        <div className="text-gray-400">Chargement des intervenants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/login')} className="mt-4 text-[#6366f1] hover:underline">
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-bold tracking-wider text-[#6366f1] uppercase mb-3">
            Conférenciers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Nos intervenants
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Des experts passionnés qui partagent leurs connaissances et leur expérience.
          </p>
        </div>

        {speakers.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-gray-400">Aucun intervenant pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Link href={`/speakers/${speaker.id}`} key={speaker.id}>
                <div className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] flex items-center justify-center text-3xl">
                    🎤
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2 text-center group-hover:text-[#a5b4fc] transition">
                    {speaker.name}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3 text-center">
                    {speaker.bio || 'Bio à venir'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}