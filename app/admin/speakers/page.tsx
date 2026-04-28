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
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchSpeakers = async () => {
    try {
      const response = await fetch('/api/speakers');
      const data = await response.json();
      setSpeakers(data);
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
        setSpeakers(speakers.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des intervenants</h1>
          <Link
            href="/admin/speakers/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nouvel intervenant
          </Link>
        </div>

        {speakers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Aucun intervenant pour le moment</p>
            <Link href="/admin/speakers/create" className="mt-4 inline-block text-blue-600 hover:underline">
              Ajouter le premier intervenant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{speaker.name}</h3>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/speakers/${speaker.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => deleteSpeaker(speaker.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {speaker.bio && (
                    <p className="mt-2 text-gray-600 text-sm line-clamp-3">{speaker.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}