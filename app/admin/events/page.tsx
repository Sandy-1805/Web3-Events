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
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('📅 Événements reçus:', data);
      setEvents(data);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
        console.log(`✅ Événement ${id} supprimé`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
          <Link
            href="/admin/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Nouvel événement
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">Aucun événement pour le moment</p>
            <Link
              href="/admin/events/create"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Créer le premier événement
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(event.startDate).toLocaleString('fr-FR')}</span>
                        <span>⏱️ Fin: {new Date(event.endDate).toLocaleString('fr-FR')}</span>
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}